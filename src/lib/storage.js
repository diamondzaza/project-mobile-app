/** อัปโหลดรูปขึ้น Supabase Storage (bucket 'pet-photos') — path: {user_id}/{petId|'profile'}/{table}/{id}.jpg */
import { supabase, isSupabaseConfigured } from "./supabase";
import { uuid } from "./id";

/**
 * @param {string} userId
 * @param {string} folder  เช่น 'profile' หรือ petId
 * @param {string} table   'pets' | 'food_logs' | 'notes'
 * @param {string} uri     ผลจาก expo-image-picker (file:// บน native, file/blob/http บน web)
 * @returns {Promise<string|null>} path ใน bucket หรือ null ถ้าไม่มีรูป/ยังไม่ได้ตั้ง Supabase
 */
export async function uploadPhoto(userId, folder, table, uri) {
  if (!uri || !isSupabaseConfigured) return null;
  const name = `${uuid()}.jpg`;
  const path = `${userId}/${folder || "misc"}/${table}/${name}`;

  // fetch เป็น blob ได้ทั้ง web (File/Blob) และ native (file:// URI)
  const res = await fetch(uri);
  const blob = await res.blob();

  const { error } = await supabase.storage.from("pet-photos").upload(path, blob, {
    contentType: "image/jpeg",
    upsert: false,
  });
  if (error) throw error;
  return path;
}

/** path ใน bucket -> URL สำหรับแสดงผล (bucket เป็น public) */
export function photoUrl(path) {
  if (!path || !isSupabaseConfigured) return null;
  const { data } = supabase.storage.from("pet-photos").getPublicUrl(path);
  return data?.publicUrl ?? null;
}
