/** ข้อมูลจำลอง (mock)  */
import { daysFromNow, formatDate } from "../utils/date";


export const initialPets = [
  { id: "1", name: "Coco", breed: "Golden Retriever", age: "1 year", icon: "dog", healthyRange: [5, 7] },
  { id: "2", name: "Milo", breed: "Tabby Cat", age: "2 years", icon: "cat", healthyRange: [3, 4.5] },
];

export const initialWeightData = {
  "1": [
    { value: 5.2, date: daysFromNow(-30).toISOString() },
    { value: 5.3, date: daysFromNow(-24).toISOString() },
    { value: 5.4, date: daysFromNow(-18).toISOString() },
    { value: 5.5, date: daysFromNow(-12).toISOString() },
    { value: 5.6, date: daysFromNow(-6).toISOString() },
    { value: 5.7, date: daysFromNow(0).toISOString() },
  ],
  "2": [
    { value: 3.1, date: daysFromNow(-30).toISOString() },
    { value: 3.2, date: daysFromNow(-24).toISOString() },
    { value: 3.2, date: daysFromNow(-18).toISOString() },
    { value: 3.3, date: daysFromNow(-12).toISOString() },
    { value: 3.4, date: daysFromNow(-6).toISOString() },
    { value: 3.5, date: daysFromNow(0).toISOString() },
  ],
};


export const initialAppointments = [
  { id: "a1", petId: "1", title: "ตรวจสุขภาพ (Coco)", dateObj: daysFromNow(2), time: "10:00 AM", location: "คลินิก Dondon", icon: "user-plus" },
  { id: "a2", petId: "1", title: "อาบน้ำ-ตัดขน (Coco)", dateObj: daysFromNow(6), time: "11:30 AM", location: "ร้าน Pet Salon", icon: "scissors" },
  { id: "a3", petId: "2", title: "วัคซีน (Milo)", dateObj: daysFromNow(10), time: "09:00 AM", location: "คลินิก Dondon", icon: "activity" },
];


export const initialHealthData = {
  "1": {
    upcoming: [{ id: "h1", title: "วัคซีนพิษสุนัขบ้า", date: formatDate(daysFromNow(2)) }],
    completed: [{ id: "h2", title: "ตรวจสุขภาพ", date: formatDate(daysFromNow(-5)) }],
  },
  "2": {
    upcoming: [{ id: "h3", title: "ถ่ายพยาธิ", date: formatDate(daysFromNow(20)) }],
    completed: [],
  },
};


export const initialNotifications = [
  { id: "n1", title: "ถึงเวลาให้ Coco กินข้าวแล้ว!", time: "10 นาทีที่แล้ว", read: false, petId: "1", screen: "food" },
  { id: "n2", title: "พรุ่งนี้: นัดฉีดวัคซีนรวม (Coco)", time: "2 ชม. ที่แล้ว", read: false, petId: "1", screen: "petAppointments" },
  { id: "n3", title: "ด่วน: อัปเดตน้ำหนักของ Milo!", time: "1 วันที่แล้ว", read: false, petId: "2", screen: "weight" },
];

export const initialUser = {
  name: "I love Roblox",
  email: "freefirenumber1@example.com",
  phone: "081-234-5678",
};


export const initialFoodData = {
  "1": [{ id: "f1", text: "อาหารเม็ด 120 กรัม - มื้อเช้า", tag: "Morning", grams: 120, createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) }],
};


const atDay = (offset, hour) => {
  const d = daysFromNow(offset);
  d.setHours(hour, 0, 0, 0);
  return d;
};

export const initialActivityData = {
  "1": [
    { id: "ac1", text: "เดินเล่นในสวน 30 นาที", tag: "Walk", minutes: 30, createdAt: atDay(0, 8) },
    { id: "ac2", text: "เล่นเก็บลูกบอลที่บ้าน 15 นาที", tag: "Play", minutes: 15, createdAt: atDay(0, 13) },
    { id: "ac3", text: "เดินรอบบ้าน 25 นาที", tag: "Walk", minutes: 25, createdAt: atDay(-1, 8) },
    { id: "ac4", text: "เดิน 30 นาที + เล่น 20 นาที", tag: "Walk", minutes: 30, createdAt: atDay(-2, 9) },
    { id: "ac5", text: "เล่นกับของเล่น 20 นาที", tag: "Play", minutes: 20, createdAt: atDay(-2, 15) },
    { id: "ac6", text: "เดินเล่นไกล 40 นาที", tag: "Walk", minutes: 40, createdAt: atDay(-4, 7) },
    { id: "ac7", text: "เล่นจูงเชือก 10 นาที", tag: "Play", minutes: 10, createdAt: atDay(-5, 16) },
    { id: "ac8", text: "เดินเล่นในสวน 20 นาที", tag: "Walk", minutes: 20, createdAt: atDay(-6, 8) },
    { id: "ac9", text: "เดินเล่น 30 นาที", tag: "Walk", minutes: 30, createdAt: atDay(-7, 8) },
  ],
};


export const initialNotesData = {
  "1": [
    { id: "nt1", text: "แพ้เนื้อไก่", category: "Food/Allergy", pinned: true, createdAt: daysFromNow(-10) },
    { id: "nt2", text: "นัดฉีดวัคซีนครั้งถัดไป: 20 ก.ย. ที่คลินิก Dondon", category: "Appointment", reminderAt: atDay(1, 9), createdAt: daysFromNow(-1) },
    { id: "nt3", text: "ชอบลูกบอลสีแดง แต่เกลียดฝน", category: "Behavior", createdAt: daysFromNow(-3) },
  ],
};
