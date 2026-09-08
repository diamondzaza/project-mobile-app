//utils วันที่ 

const MONTH_ABBR = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const pad = (n) => (n < 10 ? "0" + n : "" + n);

export function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

export function isSameDate(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}


export function formatGregorian(d) {
  return `${pad(d.getDate())} ${MONTH_ABBR[d.getMonth()]} ${d.getFullYear()}`;
}


export function formatGregorianShort(d) {
  return `${pad(d.getDate())} ${MONTH_ABBR[d.getMonth()]}`;
}

export function formatDate(d) {
  return formatGregorianShort(d);
}

export function timeAgo(date) {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60) return "เมื่อสักครู่";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ชม. ที่แล้ว`;
  const days = Math.floor(hrs / 24);
  return `${days} วันที่แล้ว`;
}
