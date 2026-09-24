/**
 * แจ้งเตือนระดับ OS (expo-notifications) — เสริมจากใน-app feed
 * - ถ้าผู้ใช้ยังไม่ได้อนุญาต จะขอ permission ครั้งแรก
 * - เว็บ: ใช้ Notification API ของเบราว์เซอร์ / native: local notification
 * - ถ้า permission ไม่ผ่าน ทุกอย่างเงียบ ๆ (in-app feed ยังทำงานปกติ)
 */
import { Platform } from "react-native";

let Notifications = null;
try {
  Notifications = require("expo-notifications");
} catch {
  // ยังไม่ได้ติดตั้ง expo-notifications — แอปยังใช้งานได้ แต่ไม่มี OS notification
}

/** ตั้งค่า handler ครั้งเดียวตอนเปิดแอป */
export function initNotifications() {
  if (!Notifications) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/** ขออนุญาตแจ้งเตือน (คืน true ถ้าได้รับอนุญาต) */
export async function requestPermission() {
  if (!Notifications) return false;
  try {
    const settings = await Notifications.getPermissionsAsync();
    if (settings.granted) return true;
    const req = await Notifications.requestPermissionsAsync();
    return Boolean(req.granted);
  } catch {
    return false; // บาง platform (web ที่ไม่รองรับ) จะ throw — เงียบ ๆ
  }
}

/** ยิง local notification ทันที (ใช้ตอน reminder engine เตือน) */
export async function showReminder(title, body) {
  if (!Notifications) return;
  try {
    const granted = await requestPermission();
    if (!granted) return;
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: null, // ทันที
    });
  } catch {
    // เงียบ ๆ — การแจ้งเตือน OS ล้มเหลวไม่ควรทำแอปพัง
  }
}

/** สถานะรองรับของ platform ปัจจุบัน (ไว้แสดงในหน้า settings ถ้าต้องการ) */
export function osNotificationSupport() {
  if (!Notifications) return "unavailable"; // ไม่ได้ติดตั้ง package
  if (Platform.OS === "web") return "web"; // ขึ้นกับ browser permission
  return "native";
}
