/** ช่วงน้ำหนักอ้างอิงตามสายพันธุ์ (ค่าโดยประมาณจากข้อมูลอ้างอิงสัตวแพทย์ที่เผยแพร่ทั่วไป)
 *  ใช้เป็นเกณฑ์วัดของ "วิเคราะห์สุขภาพขั้นสูง" เมื่อผู้ใช้กรอกสายพันธุ์ตรง — ไม่ใช่คำวินิจฉัยทางการแพทย์
 *  ไม่เจอสายพันธุ์ -> ใช้ช่วงตามขนาดตัว (sizeFallback) หรือช่วงของประเภทสัตว์ต่อไป */

export const BREED_DISCLAIMER = "ค่าอ้างอิงโดยประมาณตามสายพันธุ์ ไม่ใช่คำวินิจฉัยทางการแพทย์";

const normalize = (s) =>
  String(s || "").toLowerCase().replace(/[\s.\-_()]/g, "").replace(/(พันธุ์|dog|cat)/g, "");

const DOG_BREEDS = [
  { aliases: ["chihuahua", "ชิวาวา"], range: [1.5, 3] },
  { aliases: ["pomeranian", "ปอมเมอเรเนียน", "ปอม"], range: [1.8, 3.5] },
  { aliases: ["maltese", "มัลทีส"], range: [1.8, 4] },
  { aliases: ["yorkshireterrier", "yorkshire", "ยอร์คเชียร์เทอร์เยอร์", "ยอร์คเชียร์", "ยอร์กกี้"], range: [2, 3.2] },
  { aliases: ["pug", "ปั๊ก", "ปักกิ่ง"], range: [6, 8.5] },
  { aliases: ["shihtzu", "ชิสุ", "ซื่อซื่อ"], range: [4, 7.5] },
  { aliases: ["cavalierkingcharlesspaniel", "cavalier", "คาวาเลียร์"], range: [5.5, 8] },
  { aliases: ["frenchbulldog", "ฝรั่งเศส", "บุลด็อกฝรั่งเศส"], range: [8, 14] },
  { aliases: ["corgi", "คอร์กี้", "เวลช์คอร์กี้"], range: [10, 14] },
  { aliases: ["beagle", "บีเกิ้ล", "บีเกิล"], range: [9, 11] },
  { aliases: ["poodle", "พุดเดิ้ล", "พูเดิ้ล"], range: [5, 12] },
  { aliases: ["poodletoy", "พุดเดิ้ลจิ๋ว", "พูเดิ้ลจิ๋ว"], range: [3, 6] },
  { aliases: ["englishbulldog", "bulldog", "บูลด็อก", "บุลด็อกอังกฤษ"], range: [18, 25] },
  { aliases: ["sharpei", "ชาเปย์", "ชาร์เปย์"], range: [16, 25] },
  { aliases: ["borddercollie", "bordercollie", "บอร์เดอร์คอลลี่", "บอร์เดอร์คอลลี"], range: [14, 20] },
  { aliases: ["dalmatian", "ดัลเมเชียน"], range: [20, 32] },
  { aliases: ["samoyed", "ซามอยด์", "ซาโมยิโด"], range: [16, 29] },
  { aliases: ["siberianhusky", "husky", "ฮัสกี้", "ฮัสกี้"], range: [16, 27] },
  { aliases: ["alaskanmalamute", "อลาสกันมาลามิวต์", "อลาสกัน"], range: [32, 43] },
  { aliases: ["thairidgeback", "ไทยหลัง", "ไทยหลังอาน"], range: [14, 25] },
  { aliases: ["bangkaew", "thaibangkaew", "ไทยบางแก้ว", "บางแก้ว"], range: [16, 24] },
  { aliases: ["germanshepherd", "เยอรมันเชพเพิร์ด", "เยอรมันชีพเพิร์ด", "เยอรมัน"], range: [22, 40] },
  { aliases: ["rottweiler", "รอตไวเลอร์", "รอทไวเลอร์"], range: [36, 60] },
  { aliases: ["doberman", "ด็อกเบอร์มัน", "โดเบอร์แมน"], range: [32, 45] },
  { aliases: ["bassethound", "บาเซ็ตฮาวด์", "บาสเซ็ทฮาวด์"], range: [20, 29] },
  { aliases: ["labradorretriever", "labrador", "ลาบราดอร์", "ลาบาดอร์"], range: [25, 36] },
  { aliases: ["goldenretriever", "โกลเด้นรีทรีฟเวอร์", "โกลเด้น", "โกลเดน"], range: [25, 34] },
  { aliases: ["bernese", "เบอร์นีสเมาน์เทนด็อก", "เบิร์นเนส"], range: [38, 50] },
  { aliases: ["greatdane", "เกรตเดน", "เกรทเดน"], range: [45, 79] },
];

const CAT_BREEDS = [
  { aliases: ["siamese", "สยาม", "วิเชียรมาศ"], range: [2.5, 5] },
  { aliases: ["thaidomestic", "แมวส้ม", "แมวไทย", "แมวพื้นเมือง", "domestic"], range: [3, 5.5] },
  { aliases: ["munchkin", "มังกี้", "มังช์กิน"], range: [2, 4] },
  { aliases: ["scottishfold", "สก็อตติชโฟลด์", "สกอตติชโฟลด์"], range: [3, 6] },
  { aliases: ["persian", "เปอร์เซีย", "เปอร์เซียน"], range: [3, 5.5] },
  { aliases: ["russianblue", "รัสเซียนบลู", "รัสเซียนบลู"], range: [3.5, 5.5] },
  { aliases: ["britishshorthair", "บริติชโชต์แฮร์", "บริทิชชอร์แฮร์"], range: [4, 7.5] },
  { aliases: ["mainecoon", "เมนคูน", "เมนคูน"], range: [4, 11] },
  { aliases: ["ragdoll", "แร็กดอล", "แรคดอล"], range: [4.5, 9] },
  { aliases: ["norwegianforestcat", "นอร์เวย์ฟอเรสต์", "นอร์เวเจียนฟอเรสต์"], range: [3.5, 8] },
  { aliases: ["balinese", "บาหลี"], range: [2.5, 5] },
];

/** ช่วงตามขนาดตัว — ใช้เมื่อไม่เจอสายพันธุ์ตรง (เดาขนาดจากคำในชื่อ) */
export const SIZE_FALLBACK = {
  toy: { aliases: ["toy", "จิ๋ว", "ตัวจิ๋ว"], label: "สุนัขขนาดจิ๋ว", range: [1.5, 4] },
  small: { aliases: ["small", "เล็ก", "ขนาดเล็ก"], label: "ขนาดเล็ก", range: [4, 10] },
  medium: { aliases: ["medium", "กลาง", "ขนาดกลาง"], label: "ขนาดกลาง", range: [10, 22] },
  large: { aliases: ["large", "big", "ใหญ่", "ขนาดใหญ่"], label: "ขนาดใหญ่", range: [22, 40] },
  giant: { aliases: ["giant", "ยักษ์", "ขนาดยักษ์"], label: "ขนาดยักษ์", range: [40, 75] },
};

/** หาช่วงน้ำหนักจากชื่อสายพันธุ์ -> { range, label } หรือ null ถ้าไม่เจอ
 *  species: "dog" | "cat" | อื่นๆ (ค้นเฉพาะกลุ่มนั้นก่อน แล้วข้ามไป fallback ขนาด) */
export function findBreedRange(breedText, species) {
  const q = normalize(breedText);
  if (!q || q.length < 2) return null;
  const pools = species === "cat" ? [CAT_BREEDS, DOG_BREEDS] : species === "dog" ? [DOG_BREEDS, CAT_BREEDS] : [DOG_BREEDS, CAT_BREEDS];
  for (const pool of pools) {
    for (const b of pool) {
      // จับคู่แบบเป๊ะก่อน แล้วค่อยแบบ "ชื่อที่พิมพ์มีชื่อสายพันธุ์อยู่ในตัว" (alias ต้องยาวพอกันพาดผิด)
      if (b.aliases.some((a) => normalize(a) === q)) return { range: b.range, label: b.aliases[0] };
      if (b.aliases.some((a) => a.length >= 4 && q.includes(normalize(a)))) return { range: b.range, label: b.aliases[0] };
    }
  }
  // fallback ขนาด — เฉพาะสุนัข (แมวเล็กอยู่แล้ว ใช้ช่วงสายพันธุ์ไม่ตรง)
  if (species === "dog") {
    for (const key of ["toy", "small", "medium", "large", "giant"]) {
      const f = SIZE_FALLBACK[key];
      if (f.aliases.some((a) => q.includes(normalize(a)))) return { range: f.range, label: f.label };
    }
  }
  return null;
}
