/** ฟังก์ชันยืนยันตัวตน (ครอบ supabase.auth) — ใช้ได้เมื่อ isSupabaseConfigured */
import { Platform } from "react-native";

import { supabase, isSupabaseConfigured } from "./supabase";

/** เข้าสู่ระบบด้วยอีเมล + รหัสผ่าน (ล็อกอินด้วยเบอร์โทรถูกลบออกแล้ว) */
export async function signIn(identifier, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: identifier.trim(),
    password,
  });
  if (error) throw error;
  return data.session;
}

/** สมัครสมาชิก — metadata จะถูก trigger ใน DB ย้ายลงตาราง users อัตโนมัติ */
export async function signUp({ email, password, name, username, phone }) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: { name, username, phone: phone || "" },
    },
  });
  if (error) throw error;
  return data; // data.session อาจเป็น null ถ้าโปรเจกต์เปิดยืนยันอีเมล
}

/** Google OAuth (web: redirect กลับมาที่ origin เดิม; native: ยังไม่รองรับ — ต้องตั้งค่า browser session เพิ่ม) */
export async function signInWithGoogle() {
  if (Platform.OS !== "web") {
    throw new Error("Google Sign-in ยังรองรับเฉพาะเว็บ (native ต้องตั้งค่าเพิ่ม)");
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin },
  });
  if (error) throw error;
}

export async function signOut() {
  await supabase.auth.signOut();
}

/** session ปัจจุบัน (ถ้ามี) */
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

/** โหลดโปรไฟล์จากตาราง users */
export async function loadProfile(userId) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** อัปเดตโปรไฟล์ (patch บางส่วน) */
export async function saveProfile(userId, patch) {
  const { error } = await supabase
    .from("users")
    .update(patch)
    .eq("id", userId);
  if (error) throw error;
}

/** แปลง error ของ Supabase เป็นข้อความไทยที่ผู้ใช้อ่านได้ */
export function translateAuthError(message) {
  const m = String(message || "");
  if (m.includes("Invalid login credentials")) return "อีเมล/เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง";
  if (m.includes("Email not confirmed")) return "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ";
  if (m.includes("User already registered")) return "อีเมลนี้ถูกใช้สมัครแล้ว";
  if (m.includes("Password should be at least")) return "รหัสผ่านสั้นเกินไป";
  if (m.includes("Google Sign-in")) return m;
  return "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
}

export { isSupabaseConfigured };
