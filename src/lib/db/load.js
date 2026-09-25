/** โหลดข้อมูลทั้งหมดของ user มาวางเป็นรูปทรง state ของ App.js */
import { supabase } from "../supabase";
import { photoUrl } from "../storage";
import { HISTORY_DAYS } from "../../data/constants";
import {
  petFromRow,
  weightFromRow,
  appointmentFromRow,
  foodFromRow,
  activityFromRow,
  noteFromRow,
  notificationFromRow,
  groupByPet,
  healthFromRows,
} from "./mappers";

/** จำนวน notification สูงสุดที่โหลด (premium ได้มากกว่า) */
const NOTIF_LIMITS = { standard: 100, plus: 100, premium: 500 };

/** ตัดประวัติที่เก่ากว่า cutoff ออก (premium = ไม่จำกัด จึงไม่ตัด) */
function applyHistoryCutoff(tier, data) {
  const days = HISTORY_DAYS[tier];
  if (days == null) return data;
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000); // เปรียบเทียบ Date กับ Date เท่านั้น
  const isKept = (iso) => !iso || new Date(iso) >= cutoff;

  const filterMap = (map) => {
    const next = {};
    for (const [petId, items] of Object.entries(map)) {
      next[petId] = items.filter(
        (it) => isKept(it.createdAt) || isKept(it.date)
      );
    }
    return next;
  };
  return {
    ...data,
    weightData: filterMap(data.weightData),
    foodData: filterMap(data.foodData),
    activityData: filterMap(data.activityData),
    notesData: filterMap(data.notesData),
  };
}

export async function loadAllData(userId) {
  const [petsRes, weightRes, apptRes, healthRes, foodRes, activityRes, notesRes, notifRes, settingsRes, profileRes, subRes] =
    await Promise.all([
      supabase.from("pets").select("*").is("deleted_at", null).order("created_at"),
      supabase.from("weight_logs").select("*").order("measured_date"),
      supabase.from("appointments").select("*").is("deleted_at", null).order("appointment_at"),
      supabase.from("health_tasks").select("*").is("deleted_at", null),
      supabase.from("food_logs").select("*").is("deleted_at", null).order("logged_at"),
      supabase.from("activity_logs").select("*").is("deleted_at", null).order("logged_at"),
      supabase.from("notes").select("*").is("deleted_at", null).order("created_at"),
      supabase.from("notifications").select("*").order("fired_at", { ascending: false }).limit(NOTIF_LIMITS.premium),
      supabase.from("pet_settings").select("*"),
      supabase.from("users").select("*").eq("id", userId).maybeSingle(),
      supabase.from("subscriptions").select("*").eq("user_id", userId).maybeSingle(),
    ]);

  const first = [petsRes, weightRes, apptRes, healthRes, foodRes, activityRes, notesRes, notifRes, settingsRes, profileRes]
    .find((r) => r.error);
  if (first?.error) throw first.error;

  // แพ็กเกจ: ตาราง subscriptions ยังไม่มี (ยังไม่รัน 0004) ก็ไม่พัง — ถือว่า standard
  if (subRes.error) {
    console.warn("[load] subscriptions:", subRes.error.message, "— ยังไม่รัน 0004_subscriptions.sql?");
  }
  const sub = subRes.error ? null : subRes.data;
  // แพ็กเกจ: ไม่มีแถว / หมดอายุ / ยกเลิก = standard
  const tier =
    sub && sub.status === "active" && (!sub.period_end || new Date(sub.period_end) > new Date())
      ? sub.tier
      : "standard";

  const foodGoals = {};
  const activityGoals = {};
  const walkReminderPrefs = {};
  const foodReminderPrefs = {};
  const reminderPrefs = {};
  for (const s of settingsRes.data) {
    foodGoals[s.pet_id] = s.food_goal_g;
    activityGoals[s.pet_id] = s.activity_goal_min;
    walkReminderPrefs[s.pet_id] = { on: s.walk_reminder_enabled, hour: s.walk_reminder_hour };
    foodReminderPrefs[s.pet_id] = {
      on: s.food_reminder_enabled,
      meals: { Morning: s.food_reminder_morning_enabled, Noon: s.food_reminder_noon_enabled, Evening: s.food_reminder_evening_enabled },
      hours: { Morning: s.food_reminder_morning_hour, Noon: s.food_reminder_noon_hour, Evening: s.food_reminder_evening_hour },
    };
    reminderPrefs[s.pet_id] = s.vaccine_reminder_enabled;
  }

  const result = {
    pets: petsRes.data.map(petFromRow),
    weightData: groupByPet(weightRes.data, weightFromRow),
    healthData: healthFromRows(healthRes.data),
    appointments: apptRes.data.map(appointmentFromRow),
    foodData: groupByPet(foodRes.data, foodFromRow),
    activityData: groupByPet(activityRes.data, activityFromRow),
    notesData: groupByPet(notesRes.data, noteFromRow),
    notifications: notifRes.data.map(notificationFromRow).slice(0, NOTIF_LIMITS[tier]),
    foodGoals,
    activityGoals,
    walkReminderPrefs,
    foodReminderPrefs,
    reminderPrefs,
    tier,
    subscription: sub ? { status: sub.status, periodEnd: sub.period_end } : null,
    user: profileRes.data
      ? {
          name: profileRes.data.name ?? "",
          email: profileRes.data.email ?? "",
          phone: profileRes.data.phone ?? "",
          photo: photoUrl(profileRes.data.avatar_path),
        }
      : { name: "", email: "", phone: "" },
  };
  return applyHistoryCutoff(tier, result);
}

/** โหลดเฉพาะโปรไฟล์ผู้ใช้ */
export async function loadProfileRow(userId) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}
