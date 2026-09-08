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
