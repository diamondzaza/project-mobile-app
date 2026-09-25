/** โปรไฟล์ผู้ใช้ (ตาราง users) */
import { supabase } from "../supabase";

/** อัปเดตโปรไฟล์ (patch บางส่วน) — email/phone ว่าง -> NULL กันชน unique */
export async function saveUserPatch(userId, patch) {
  const row = {};
  if ("name" in patch) row.name = patch.name;
  if ("email" in patch) row.email = patch.email?.trim() || null;
  if ("phone" in patch) row.phone = patch.phone?.trim() || null;
  if ("avatar_path" in patch) row.avatar_path = patch.avatar_path;
  if (Object.keys(row).length === 0) return; // ไม่มีอะไรจะเขียน (เช่น patch มีแต่ photo ที่ upload ไม่สำเร็จ)
  const { error } = await supabase.from("users").update(row).eq("id", userId);
  if (error) throw error;
}
