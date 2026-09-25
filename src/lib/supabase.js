/** Supabase client — ถ้าไม่ได้ตั้งค่า env แอปจะยังทำงานด้วย mock data เหมือนเดิม */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/** true เมื่อตั้งค่า env ครบ = ใช้ cloud จริง / false = โหมด mock ในเครื่อง */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
