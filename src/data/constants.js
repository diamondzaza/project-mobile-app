/** ข้อมูลจำลองส่วนกลาง*/
export const PET_ICONS = [
  "dog", "cat", "rabbit", "bird", "turtle", "fish", "paw",
];

export const MONTH_NAMES = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

export const WEEKDAY_LABELS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];


export const slides = [
  {
    image: require("../IMG/LOGO1-circle.webp"),
    title: "Pet Care Planner",
    subtitle: "ดูแลสัตว์เลี้ยงง่ายๆ ในที่เดียว\nน้ำหนัก สุขภาพ วัคซีน และนัดหมาย",
  },

];


export const DEFAULT_FOOD_GOAL_G = 300; 
export const DEFAULT_ACTIVITY_GOAL_MIN = 30; 
export const DEFAULT_WALK_REMINDER_HOUR = 18; 


export const MEAL_REMINDERS = [
  { tag: "Morning", meal: "Breakfast", label: "เช้า", hour: 10, icon: "sunrise" },
  { tag: "Noon", meal: "Lunch", label: "เที่ยง", hour: 14, icon: "sun" },
  { tag: "Evening", meal: "Dinner", label: "เย็น", hour: 20, icon: "moon" },
];


export const MEAL_REMINDER_HOUR_OPTIONS = [6, 8, 10, 12, 14, 16, 18, 20];


export const WALK_REMINDER_HOUR_OPTIONS = [8, 12, 17, 18, 20];


export const NOTE_CATEGORIES = [
  { key: "Food/Allergy", label: "อาหาร/ภูมิแพ้", icon: "coffee" },
  { key: "Health", label: "สุขภาพ", icon: "heart" },
  { key: "Behavior", label: "พฤติกรรม", icon: "smile" },
  { key: "Appointment", label: "นัดหมาย", icon: "calendar" },
];


export const NOTE_REMINDER_OPTIONS = [
  { key: "1h", label: "ใน 1 ชั่วโมง", hoursFromNow: 1 },
  { key: "3h", label: "ใน 3 ชั่วโมง", hoursFromNow: 3 },
  { key: "tomorrow9", label: "พรุ่งนี้ 9:00", special: "tomorrow9" },
];


/* ---------- แพ็กเกจสมาชิก ---------- */
// petLimit: null = ไม่จำกัด | adLevel: 'banner' = แบนเนอร์โฆษณา, 'promo' = เฉพาะข้อความส่งเสริม, 'none' = ไม่มีเลย
export const SUBSCRIPTION_PLANS = [
  {
    key: "standard",
    label: "Standard",
    tagline: "เหมาะกับครัวเรือนที่มีสัตว์เลี้ยงจำนวนไม่มาก",
    price: 0,
    priceLabel: "ฟรี",
    petLimit: 2,
    adLevel: "banner",
    features: [
      "จำกัดจำนวนสัตว์เลี้ยงไม่เกิน 2 ตัว",
      "ใช้ฟีเจอร์พื้นฐานครบ (น้ำหนัก สุขภาพ นัดหมาย อาหาร กิจกรรม โน้ต)",
      "แสดงแบนเนอร์โฆษณาภายในแอป",
    ],
  },
  {
    key: "plus",
    label: "Plus",
    tagline: "สำหรับครัวเรือนที่มีสัตว์เลี้ยงหลายตัว",
    price: 99,
    priceLabel: "฿99/เดือน",
    petLimit: 6,
    adLevel: "promo",
    features: [
      "จำกัดจำนวนสัตว์เลี้ยงไม่เกิน 6 ตัว",
      "วิเคราะห์สุขภาพขั้นสูง (แนวโน้มน้ำหนัก + คำแนะนำ)",
      "แจ้งเตือนนัดหมายล่วงหน้า 5 วัน",
      "เก็บประวัติการบันทึกย้อนหลัง 90 วัน",
      "ไม่มีแบนเนอร์โฆษณา (มีเพียงข้อความส่งเสริมการขาย)",
    ],
  },
  {
    key: "premium",
    label: "Premium",
    tagline: "คุ้มค่าที่สุดสำหรับบ้านที่มีสัตว์หลายชนิดหรือฟาร์มสัตว์เลี้ยงขนาดเล็ก",
    price: 299,
    priceLabel: "฿299/เดือน",
    petLimit: null,
    adLevel: "none",
    features: [
      "จำนวนสัตว์เลี้ยงไม่จำกัด",
      "เก็บประวัติการบันทึกได้ไม่จำกัดจำนวน",
      "วิเคราะห์สุขภาพขั้นสูง + แจ้งเตือนนัดหมายล่วงหน้า 5 วัน",
      "ไม่มีโฆษณา 100% (Ad-free) ตลอดการใช้งาน",
    ],
  },
];

/** จำนวนสัตว์เลี้ยงสูงสุดของแต่ละแพ็กเกจ (null = ไม่จำกัด) */
export const PET_LIMITS = { standard: 2, plus: 6, premium: null };

/** ระดับโฆษณาของแต่ละแพ็กเกจ */
export const AD_LEVELS = { standard: "banner", plus: "promo", premium: "none" };

/** จำนวนวันที่เก็บประวัติย้อนหลังของแพ็กเกจที่ไม่ใช่ premium (null = ไม่จำกัด) */
export const HISTORY_DAYS = { standard: 90, plus: 90, premium: null };
