/** ฟีดแจ้งเตือน (notifications) — dedupe_key = id ฝั่งแอป กันสร้างซ้ำจาก engine เช็คทุก 60 วิ */
import { supabase } from "../supabase";

/** เพิ่มแจ้งเตือน (ซ้ำเงียบ ๆ ด้วย upsert + ignoreDuplicates) */
export async function insertNotification(userId, n, kind = "general") {
  const { error } = await supabase
    .from("notifications")
    .upsert(
      {
        user_id: userId,
        pet_id: n.petId ?? null,
        kind,
        title: n.title,
        screen: n.screen ?? "home",
        dedupe_key: n.id,
      },
      { onConflict: "user_id,dedupe_key", ignoreDuplicates: true }
    );
  if (error) throw error;
}

export function markNotificationRead(dedupeKey) {
  return supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("dedupe_key", dedupeKey)
    .then((r) => { if (r.error) throw r.error; });
}

/** ทำเครื่องหมายว่าอ่านทั้งหมด */
export function markAllNotificationsRead(userId) {
  return supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("read_at", null)
    .then((r) => { if (r.error) throw r.error; });
}

export function deleteNotificationByDedupeKey(dedupeKey) {
  return supabase
    .from("notifications")
    .delete()
    .eq("dedupe_key", dedupeKey)
    .then((r) => { if (r.error) throw r.error; });
}
