/** ตัวช่วยวันเวลา/parse ที่ใช้ร่วมกันทั้ง data layer */

/** แปลงเวลาเป็นข้อความภาษาไทยแบบย่อ (แทน string "10 นาทีที่แล้ว" เดิม) */
export function formatRelativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "เมื่อสักครู่";
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ชม. ที่แล้ว`;
  return `${Math.floor(hours / 24)} วันที่แล้ว`;
}

/** "10:00 AM" / "10:00" / "10.30" / "10 AM" / "10" -> {hour, minute} (parse ครั้งเดียวตอน save) */
export function parseTimeText(text) {
  const s = String(text || "").trim();
  let m = s.match(/^(\d{1,2})[:.](\d{2})\s*(AM|PM|am|pm)?$/);
  if (m) {
    return { hour: applyMeridiem(parseInt(m[1], 10), m[3]), minute: parseInt(m[2], 10) };
  }
  m = s.match(/^(\d{1,2})\s*(AM|PM|am|pm)$/);
  if (m) {
    return { hour: applyMeridiem(parseInt(m[1], 10), m[2]), minute: 0 };
  }
  m = s.match(/^(\d{1,2})$/);
  if (m) {
    return { hour: applyMeridiem(parseInt(m[1], 10), null), minute: 0 };
  }
  return { hour: 9, minute: 0 }; // parse ไม่ได้ — ค่า default ที่รู้กันทั้งแอป
}

function applyMeridiem(hour, meridiem) {
  const mer = meridiem?.toUpperCase();
  let h = hour;
  if (mer === "PM" && h < 12) h += 12;
  if (mer === "AM" && h === 12) h = 0;
  if (!mer && h > 23) h = 9;
  return h;
}

/** Date + ข้อความเวลา -> ISO สำหรับคอลัมน์ appointment_at */
export function combineDateTime(dateObj, timeText) {
  const d = new Date(dateObj);
  const { hour, minute } = parseTimeText(timeText);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

/** ISO -> "10:00" สำหรับแสดงผลในการ์ดนัดหมาย */
export function formatClock(iso) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** วันที่ของเครื่องผู้ใช้ (ไม่ใช่ UTC) สำหรับคอลัมน์ date — กัน UTC+7 ได้วันผิด */
export function localDateKey(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
