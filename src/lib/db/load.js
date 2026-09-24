/** โหลดข้อมูลทั้งหมดของ user มาวางเป็นรูปทรง state ของ App.js */
import { supabase } from "../supabase";
import { photoUrl } from "../storage";
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

export async function loadAllData(userId) {
  const [petsRes, weightRes, apptRes, healthRes, foodRes, activityRes, notesRes, notifRes, settingsRes, profileRes] =
    await Promise.all([
      supabase.from("pets").select("*").is("deleted_at", null).order("created_at"),
      supabase.from("weight_logs").select("*").order("measured_date"),
      supabase.from("appointments").select("*").is("deleted_at", null).order("appointment_at"),
      supabase.from("health_tasks").select("*").is("deleted_at", null),
      supabase.from("food_logs").select("*").is("deleted_at", null).order("logged_at"),
      supabase.from("activity_logs").select("*").is("deleted_at", null).order("logged_at"),
      supabase.from("notes").select("*").is("deleted_at", null).order("created_at"),
      supabase.from("notifications").select("*").order("fired_at", { ascending: false }).limit(100),
      supabase.from("pet_settings").select("*"),
      supabase.from("users").select("*").eq("id", userId).maybeSingle(),
    ]);

  const first = [petsRes, weightRes, apptRes, healthRes, foodRes, activityRes, notesRes, notifRes, settingsRes, profileRes]
    .find((r) => r.error);
  if (first?.error) throw first.error;

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

  return {
    pets: petsRes.data.map(petFromRow),
    weightData: groupByPet(weightRes.data, weightFromRow),
    healthData: healthFromRows(healthRes.data),
    appointments: apptRes.data.map(appointmentFromRow),
    foodData: groupByPet(foodRes.data, foodFromRow),
    activityData: groupByPet(activityRes.data, activityFromRow),
    notesData: groupByPet(notesRes.data, noteFromRow),
    notifications: notifRes.data.map(notificationFromRow),
    foodGoals,
    activityGoals,
    walkReminderPrefs,
    foodReminderPrefs,
    reminderPrefs,
    user: profileRes.data
      ? {
          name: profileRes.data.name ?? "",
          email: profileRes.data.email ?? "",
          phone: profileRes.data.phone ?? "",
          photo: photoUrl(profileRes.data.avatar_path),
        }
      : { name: "", email: "", phone: "" },
  };
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
