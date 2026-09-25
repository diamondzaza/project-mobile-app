/** บันทึกประจำวัน: น้ำหนัก อาหาร กิจกรรม โน้ต สุขภาพ */
import { supabase } from "../supabase";
import { uploadPhoto } from "../storage";
import { localDateKey } from "./helpers";

/* ---------- น้ำหนัก ---------- */

export async function upsertWeight(userId, petId, entry) {
  const { error } = await supabase.from("weight_logs").upsert(
    {
      pet_id: petId,
      user_id: userId,
      weight_kg: entry.value,
      measured_date: localDateKey(entry.date),
    },
    { onConflict: "pet_id,measured_date" }
  );
  if (error) throw error;
}

export async function deleteWeight(userId, petId, date) {
  const { error } = await supabase
    .from("weight_logs")
    .delete()
    .eq("pet_id", petId)
    .eq("measured_date", localDateKey(date));
  if (error) throw error;
}

/* ---------- รายการในลิสต์ (ใช้ร่วม food/activity/notes) ---------- */

async function insertListRow(table, row) {
  const { error } = await supabase.from(table).insert(row);
  if (error) throw error;
}

export function updateListRow(table, id, patch) {
  return supabase.from(table).update(patch).eq("id", id).then(
    (r) => { if (r.error) throw r.error; },
  );
}

export function deleteRow(table, id) {
  return supabase.from(table).delete().eq("id", id).then(
    (r) => { if (r.error) throw r.error; },
  );
}

/* ---------- อาหาร ---------- */

export async function insertFoodLog(userId, petId, item) {
  const row = {
    id: item.id,
    pet_id: petId,
    user_id: userId,
    description: item.text,
    meal: item.tag,
    grams: item.grams ?? 0,
    logged_at: item.createdAt ?? new Date().toISOString(),
  };
  if (item.photo) row.photo_path = await uploadPhoto(userId, petId, "food_logs", item.photo);
  await insertListRow("food_logs", row);
}

export function updateFoodLog(id, patch) {
  const row = {};
  if ("text" in patch) row.description = patch.text;
  if ("tag" in patch) row.meal = patch.tag;
  // grams เป็น null เมื่อข้อความใหม่ไม่มีตัวเลข — ไม่ส่งไปแทนที่จะชน NOT NULL
  if ("grams" in patch && patch.grams != null) row.grams = patch.grams;
  return updateListRow("food_logs", id, row);
}

/* ---------- กิจกรรม ---------- */

export function insertActivityLog(userId, petId, item) {
  return insertListRow("activity_logs", {
    id: item.id,
    pet_id: petId,
    user_id: userId,
    description: item.text,
    kind: item.tag,
    minutes: item.minutes ?? 0,
    logged_at: item.createdAt ?? new Date().toISOString(),
  });
}

export function updateActivityLog(id, patch) {
  const row = {};
  if ("text" in patch) row.description = patch.text;
  if ("tag" in patch) row.kind = patch.tag;
  // minutes เป็น null เมื่อข้อความใหม่ไม่มีตัวเลข — ไม่ส่งไปแทนที่จะชน NOT NULL
  if ("minutes" in patch && patch.minutes != null) row.minutes = patch.minutes;
  return updateListRow("activity_logs", id, row);
}

/* ---------- โน้ต ---------- */

export async function insertNote(userId, petId, item) {
  const row = {
    id: item.id,
    pet_id: petId,
    user_id: userId,
    body: item.text,
    category: item.category,
    pinned: Boolean(item.pinned),
    reminder_at: item.reminderAt ?? null,
  };
  if (item.photo) row.photo_path = await uploadPhoto(userId, petId, "notes", item.photo);
  await insertListRow("notes", row);
}

export function updateNote(id, patch) {
  const row = {};
  if ("text" in patch) row.body = patch.text;
  if ("category" in patch) row.category = patch.category;
  if ("pinned" in patch) row.pinned = Boolean(patch.pinned);
  // ส่ง reminder_at เฉพาะเมื่อแก้ reminder เท่านั้น — กันแก้ข้อความ/pin แล้วลบทิ้ง
  if ("reminderAt" in patch) row.reminder_at = patch.reminderAt ?? null;
  return updateListRow("notes", id, row);
}

/** โน้ต: reminder ถูกเตือนแล้ว -> กันเตือนซ้ำหลังโหลดใหม่ */
export function markNoteReminded(id) {
  return updateListRow("notes", id, { reminder_done_at: new Date().toISOString() });
}

/* ---------- สุขภาพ (health_tasks) ---------- */

export async function insertHealthItem(userId, petId, item) {
  const { error } = await supabase.from("health_tasks").insert({
    id: item.id, // ใช้ id เดียวกับแอป เพื่อให้ completeHealthItem อ้างถูกแถว
    pet_id: petId,
    user_id: userId,
    title: item.title,
    due_text: item.date || null, // วันที่แบบข้อความ (หน้า Health ยังไม่มีปฏิทิน)
  });
  if (error) throw error;
}

export function completeHealthItem(userId, petId, itemId) {
  return updateListRow("health_tasks", itemId, {
    status: "completed",
    completed_at: new Date().toISOString(),
  });
}

/** แก้ไขรายการสุขภาพ (เผื่อ flow แก้ไขในอนาคต) */
export function updateHealthItem(itemId, patch) {
  const row = {};
  if ("title" in patch) row.title = patch.title;
  if ("date" in patch) row.due_text = patch.date || null;
  return updateListRow("health_tasks", itemId, row);
}

export function deleteHealthItem(itemId) {
  return deleteRow("health_tasks", itemId);
}
