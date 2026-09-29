/** กรองข้อความให้เหลือเฉพาะตัวเลข — ใช้กับ onChangeText ของฟิลด์ตัวเลข
 *  เหตุผล: keyboardType ช่วยเฉพาะคีย์บอร์ดมือถือ บนเว็บยังพิมพ์ตัวอักษรได้ จึงต้องกรองค่าด้วย
 *  decimals=false = เลขจำนวนเต็มเท่านั้น (เช่น นาที, กรัม) */
export function numericOnly(text, { decimals = true } = {}) {
  const digits = String(text).replace(/[^0-9.]/g, "");
  if (!decimals) return digits.replace(/\./g, "");
  // เก็บจุดทศนิยมแค่จุดเดียว
  return digits.replace(/(\..*)\./g, "$1");
}
