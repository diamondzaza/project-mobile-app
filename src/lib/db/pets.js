/** สัตว์เลี้ยง + ตั้งค่าต่อสัตว์ (pet_settings) */
import { supabase } from "../supabase";
import { uploadPhoto } from "../storage";
import { SPECIES_ALLOWED } from "./mappers";
import { upsertWeight } from "./logs"; // ไม่มีวงจร import — logs ไม่ import pets กลับ

const petToRow = (userId, p) => ({
  user_id: userId,
  name: p.name,
  species: SPECIES_ALLOWED.includes(p.icon) ? p.icon : "other",
  icon: p.icon, // key แสดงผลตามที่แอปใช้จริง (รวม paw/turtle/fish ฯลฯ)
  type_label: p.typeLabel ?? null,
  breed: p.breed || null,
  age_text: p.age || null,
  healthy_range_min: p.healthyRange?.[0] ?? 0,
  healthy_range_max: p.healthyRange?.[1] ?? 0,
});

export async function insertPet(userId, pet, initialWeight) {
  const row = { id: pet.id, ...petToRow(userId, pet) };
  if (pet.photo) {
    row.photo_path = await uploadPhoto(userId, pet.id, "pets", pet.photo);
  }
  const { error } = await supabase.from("pets").insert(row);
  if (error) throw error;
  if (initialWeight != null) {
    await upsertWeight(userId, pet.id, { value: initialWeight, date: new Date().toISOString() });
  }
  // สร้าง settings เริ่มต้นให้ด้วย
  await upsertSettings(userId, pet.id, {});
}

/** แก้ไขสัตว์เลี้ยง (patch บางส่วน — ส่งเฉพาะฟิลด์ที่เปลี่ยน) */
export async function updatePet(userId, petId, patch) {
  const row = {};
  if ("name" in patch) row.name = patch.name;
  if ("breed" in patch) row.breed = patch.breed || null;
  if ("age" in patch) row.age_text = patch.age || null;
  if ("icon" in patch) {
    row.icon = patch.icon;
    row.species = SPECIES_ALLOWED.includes(patch.icon) ? patch.icon : "other";
  }
  if ("typeLabel" in patch) row.type_label = patch.typeLabel ?? null;
  if ("healthyRange" in patch) {
    row.healthy_range_min = patch.healthyRange?.[0] ?? 0;
    row.healthy_range_max = patch.healthyRange?.[1] ?? 0;
  }
  if (Object.keys(row).length === 0) return;
  const { error } = await supabase.from("pets").update(row).eq("id", petId);
  if (error) throw error;
}

/** เปลี่ยนรูปสัตว์เลี้ยง (แยกออกเพราะต้องอัปโหลดไฟล์ก่อน) */
export async function setPetPhoto(userId, petId, localUri) {
  const path = await uploadPhoto(userId, petId, "pets", localUri);
  const { error } = await supabase.from("pets").update({ photo_path: path }).eq("id", petId);
  if (error) throw error;
  return path;
}

export async function deletePet(petId) {
  // cascade ลบข้อมูลลูกทั้งหมดใน DB
  const { error } = await supabase.from("pets").delete().eq("id", petId);
  if (error) throw error;
}

/** เป้าหมาย/แจ้งเตือนทั้งชุดของสัตว์ 1 ตัว -> แถว pet_settings (upsert ทั้งแถวทุกครั้ง) */
const settingsToRow = (userId, petId, prefs) => ({
  pet_id: petId,
  user_id: userId,
  food_goal_g: prefs.foodGoalG,
  activity_goal_min: prefs.activityGoalMin,
  food_reminder_enabled: prefs.foodReminder?.on ?? true,
  food_reminder_morning_enabled: prefs.foodReminder?.meals?.Morning ?? true,
  food_reminder_noon_enabled: prefs.foodReminder?.meals?.Noon ?? true,
  food_reminder_evening_enabled: prefs.foodReminder?.meals?.Evening ?? true,
  food_reminder_morning_hour: prefs.foodReminder?.hours?.Morning ?? 10,
  food_reminder_noon_hour: prefs.foodReminder?.hours?.Noon ?? 14,
  food_reminder_evening_hour: prefs.foodReminder?.hours?.Evening ?? 20,
  walk_reminder_enabled: prefs.walkReminder?.on ?? true,
  walk_reminder_hour: prefs.walkReminder?.hour ?? 18,
  vaccine_reminder_enabled: prefs.vaccineReminder ?? true,
});

export async function upsertSettings(userId, petId, prefs) {
  const { error } = await supabase
    .from("pet_settings")
    .upsert(settingsToRow(userId, petId, prefs), { onConflict: "pet_id" });
  if (error) throw error;
}
