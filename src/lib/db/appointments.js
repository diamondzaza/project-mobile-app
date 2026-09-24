/** นัดหมาย (appointments) */
import { supabase } from "../supabase";
import { combineDateTime } from "./helpers";
import { updateListRow } from "./logs";

export async function insertAppointment(userId, appt) {
  const { error } = await supabase.from("appointments").insert({
    id: appt.id,
    pet_id: appt.petId,
    user_id: userId,
    title: appt.title,
    appointment_at: combineDateTime(appt.dateObj, appt.time),
    location: appt.location || null,
    icon: appt.icon || null,
  });
  if (error) throw error;
}

/** แก้ไขนัดหมาย (title/location/วันเวลา) */
export function updateAppointment(userId, id, patch) {
  const row = {};
  if ("title" in patch) row.title = patch.title;
  if ("location" in patch) row.location = patch.location || null;
  if ("dateObj" in patch || "time" in patch) {
    row.appointment_at = combineDateTime(patch.dateObj, patch.time);
  }
  return updateListRow("appointments", id, row);
}

/** เปลี่ยนสถานะ: scheduled / completed / cancelled */
export function setAppointmentStatus(id, status) {
  return updateListRow("appointments", id, { status });
}

export async function deleteAppointment(id) {
  const { error } = await supabase.from("appointments").delete().eq("id", id);
  if (error) throw error;
}
