/** อุปกรณ์ (devices) — สำหรับ push notification ในอนาคต */
import { supabase } from "../supabase";
import { Platform } from "react-native";

/** ลงทะเบียนเครื่องนี้ของผู้ใช้ (เรียกตอนล็อกอินสำเร็จ / ได้ push token)
 *  UNIQUE(user_id, platform) — ผู้ใช้ 1 คนมี 1 แถวต่อ platform, token เป็น NULL ได้ */
export async function registerDevice(userId, { expoPushToken, timezone = "Asia/Bangkok" } = {}) {
  const platform = Platform.OS === "ios" ? "ios" : Platform.OS === "android" ? "android" : "web";
  const row = {
    user_id: userId,
    platform,
    expo_push_token: expoPushToken ?? null,
    timezone,
    last_seen_at: new Date().toISOString(),
  };
  const { error } = await supabase
    .from("devices")
    .upsert(row, { onConflict: "user_id,platform" });
  if (error) throw error;
}
