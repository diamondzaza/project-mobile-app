/** แปลงแถวใน Postgres <-> รูปทรง state ที่ App.js/หน้าจอใช้ */
import { photoUrl } from "../storage";
import { formatClock } from "./helpers";
import { formatDate } from "../../utils/date";

/** ชนิดสัตว์ที่ตารางยอมรับ (เกินจากนี้ เช่น icon 'paw' ของ 'อื่นๆ' → 'other') */
export const SPECIES_ALLOWED = ["dog", "cat", "rabbit", "bird"];

export const petFromRow = (r) => ({
  id: r.id,
  name: r.name,
  breed: r.breed ?? "",
  age: r.age_text ?? "",
  icon: r.icon ?? r.species, // คอลัมน์ icon เก็บ key ตามที่แอปใช้แสดงผล
  typeLabel: r.type_label ?? undefined,
  healthyRange: [Number(r.healthy_range_min), Number(r.healthy_range_max)],
  photo: photoUrl(r.photo_path),
});

export const weightFromRow = (r) => ({
  value: Number(r.weight_kg),
  date: new Date(`${r.measured_date}T00:00:00`).toISOString(),
});

export const appointmentFromRow = (r) => ({
  id: r.id,
  petId: r.pet_id,
  title: r.title,
  dateObj: new Date(r.appointment_at),
  time: formatClock(r.appointment_at),
  location: r.location ?? "",
  icon: r.icon ?? undefined,
});

export const foodFromRow = (r) => ({
  id: r.id,
  text: r.description ?? "",
  tag: r.meal,
  grams: Number(r.grams),
  createdAt: r.logged_at,
  photo: photoUrl(r.photo_path),
});

export const activityFromRow = (r) => ({
  id: r.id,
  text: r.description ?? "",
  tag: r.kind,
  minutes: r.minutes,
  createdAt: r.logged_at,
});

export const noteFromRow = (r) => ({
  id: r.id,
  text: r.body,
  category: r.category,
  pinned: r.pinned,
  createdAt: r.created_at,
  reminderAt: r.reminder_at ?? undefined,
  reminded: Boolean(r.reminder_done_at),
  photo: photoUrl(r.photo_path),
});

export const notificationFromRow = (r) => ({
  id: r.dedupe_key,
  title: r.title,
  time: formatRelativeTime(r.fired_at),
  read: Boolean(r.read_at),
  petId: r.pet_id ?? null,
  screen: r.screen,
});

function formatRelativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "เมื่อสักครู่";
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ชม. ที่แล้ว`;
  return `${Math.floor(hours / 24)} วันที่แล้ว`;
}

/** จัดกลุ่มแถวตาม petId เป็น map {petId: [...]} (รูปทรงเดิมของ App.js) */
export function groupByPet(rows, toApp) {
  const map = {};
  for (const r of rows) {
    (map[r.pet_id] ||= []).push(toApp(r));
  }
  return map;
}

/** แถว health_tasks -> โครง {upcoming, completed} ต่อสัตว์ */
export function healthFromRows(rows) {
  const map = {};
  for (const r of rows) {
    const item = {
      id: r.id,
      title: r.title,
      date: r.due_text ?? (r.due_date ? formatDate(new Date(`${r.due_date}T00:00:00`)) : ""),
    };
    (map[r.pet_id] ||= { upcoming: [], completed: [] });
    if (r.status === "completed") map[r.pet_id].completed.push(item);
    else map[r.pet_id].upcoming.push(item);
  }
  return map;
}
