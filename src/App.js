/** คอมโพเนนต์หลักของแอป */
import { useState, useEffect, useRef } from "react";
import { BackHandler, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import {
  WelcomeScreen,
  LoginScreen,
  RegisterScreen,
  SetupScreen,
  SubscriptionScreen,
  HomeScreen,
  AddPetScreen,
  PetProfileScreen,
  WeightScreen,
  HealthScreen,
  PetAppointmentsScreen,
  FoodScreen,
  ActivityScreen,
  NotesScreen,
  NotificationsScreen,
  OverallAppointmentsScreen,
  UserProfileScreen,
  EditProfileScreen,
} from "./screens";
import { MEAL_REMINDERS, DEFAULT_FOOD_GOAL_G, DEFAULT_ACTIVITY_GOAL_MIN, DEFAULT_WALK_REMINDER_HOUR, PET_LIMITS, AD_LEVELS } from "./data/constants";
import { isSameDate } from "./utils/date";
import { gradient } from "./theme";
import { supabase, isSupabaseConfigured } from "./lib/supabase";
import * as authApi from "./lib/auth";
import * as db from "./lib/db";
import { uploadPhoto } from "./lib/storage";
import { uuid } from "./lib/id";
import { initNotifications, showReminder } from "./lib/notifications";

export default function App() {
  // ไม่ได้ตั้งค่า .env → แสดงหน้าแนะนำการตั้งค่า (ไม่มีโหมด mock แล้ว)
  // ครอบเป็น component แยกเพื่อไม่ให้ hook ใน AppInner ถูกเรียกไม่ครบ
  if (!isSupabaseConfigured) {
    return <SetupScreen />;
  }
  return <AppInner />;
}

function AppInner() {
  const [screenStack, setScreenStack] = useState(["welcome"]);
  const screen = screenStack[screenStack.length - 1];

  const [pets, setPets] = useState([]);
  const [activePetId, setActivePetId] = useState(null);
  const activePet = pets.find((p) => p.id === activePetId);

  const [weightData, setWeightData] = useState({});
  const [healthData, setHealthData] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState({ name: "", email: "", phone: "" });
  const [foodData, setFoodData] = useState({});
  const [activityData, setActivityData] = useState({});
  const [notesData, setNotesData] = useState({});
  
  const [foodGoals, setFoodGoals] = useState({});
  const [activityGoals, setActivityGoals] = useState({});
  
  const [walkReminderPrefs, setWalkReminderPrefs] = useState({});

  const [foodReminderPrefs, setFoodReminderPrefs] = useState({});
  
  const [reminderPrefs, setReminderPrefs] = useState({});
  const [tier, setTier] = useState("standard"); // แพ็กเกจสมาชิก: standard | plus | premium
  const setReminderOn = (petId, v) => {
    setReminderPrefs((prev) => ({ ...prev, [petId]: v }));
    if (cloud) {
      mirror(db.upsertSettings(userId, petId, {
        ...composeSettings(petId, foodGoals[petId] ?? DEFAULT_FOOD_GOAL_G, activityGoals[petId] ?? DEFAULT_ACTIVITY_GOAL_MIN),
        vaccineReminder: v,
      }));
    }
  };

  // ---------- cloud (Supabase) ----------
  const [userId, setUserId] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const authLoadedForRef = useRef(null);
  /** ใช้ cloud ได้เมื่อตั้งค่า env แล้วและมี session — ไม่งั้นทำงานแบบ mock ในเครื่อง */
  const cloud = isSupabaseConfigured && userId != null;

  /** เขียนข้อมูลขึ้น DB แบบ fire-and-forget (UI ไม่รอ, error แสดงใน console) */
  const mirror = (p) => { p?.catch?.((e) => console.warn("[sync]", e?.message || e)); };

  /** วางข้อมูลที่โหลดจาก DB ลง state ทั้งหมด */
  const applyLoaded = (data) => {
    setPets(data.pets);
    setWeightData(data.weightData);
    setHealthData(data.healthData);
    setAppointments(data.appointments);
    setNotifications(data.notifications);
    setUser(data.user);
    setFoodData(data.foodData);
    setActivityData(data.activityData);
    setNotesData(data.notesData);
    setFoodGoals(data.foodGoals);
    setActivityGoals(data.activityGoals);
    setWalkReminderPrefs(data.walkReminderPrefs);
    setFoodReminderPrefs(data.foodReminderPrefs);
    setReminderPrefs(data.reminderPrefs);
    setTier(data.tier ?? "standard");
  };

  /** โหลดข้อมูลของ user ลง state — คืน true เมื่อสำเร็จ (false = ลองใหม่ได้) */
  const handleAuthed = async (uid) => {
    setUserId(uid);
    try {
      applyLoaded(await db.loadAllData(uid));
      authLoadedForRef.current = uid;
      setDataLoaded(true);
      setScreenStack((prev) => {
        const cur = prev[prev.length - 1];
        return ["welcome", "login", "register"].includes(cur) ? ["home"] : prev;
      });
      // ลงทะเบียนอุปกรณ์ (ไว้รับ push ในอนาคต — ไม่มี token ก็เก็บ platform ไว้)
      mirror(db.registerDevice(uid));
      return true;
    } catch (e) {
      console.warn("[load]", e?.message || e);
      return false;
    } finally {
      setAuthReady(true);
    }
  };

  /** ล้างข้อมูลทั้งหมดตอนออกจากระบบ */
  const resetData = () => {
    setPets([]);
    setWeightData({});
    setHealthData({});
    setAppointments([]);
    setNotifications([]);
    setUser({ name: "", email: "", phone: "" });
    setFoodData({});
    setActivityData({});
    setNotesData({});
    setFoodGoals({});
    setActivityGoals({});
    setWalkReminderPrefs({});
    setFoodReminderPrefs({});
    setReminderPrefs({});
    setActivePetId(null);
    authLoadedForRef.current = null;
    setDataLoaded(false);
  };

  // ตั้งค่า OS notification handler ครั้งเดียว
  useEffect(() => {
    initNotifications();
  }, []);

  // ตรวจ session ตอนเปิดแอป + รองรับ Google OAuth redirect กลับเข้ามา
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    (async () => {
      const session = await authApi.getSession();
      if (session?.user) {
        const ok = await handleAuthed(session.user.id);
        if (!ok) {
          // โหลดข้อมูลไม่สำเร็จ — ออกจากระบบเพื่อกลับไปโหมด mock อย่างสะอาด
          await authApi.signOut().catch(() => {});
          setUserId(null);
        }
      } else {
        setAuthReady(true);
      }
    })();
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) handleAuthed(session.user.id);
    });
    return () => data?.subscription?.unsubscribe();
  }, []);

  // ---------- ยืนยันตัวตน (ส่งให้หน้า Login/Register ใช้เมื่อตั้งค่า cloud แล้ว) ----------
  const submitLogin = async (identifier, password) => {
    try {
      const session = await authApi.signIn(identifier, password);
      const ok = await handleAuthed(session.user.id);
      if (!ok) return { ok: false, error: "โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" };
      return { ok: true };
    } catch (e) {
      return { ok: false, error: authApi.translateAuthError(e?.message) };
    }
  };

  const submitRegister = async (form) => {
    try {
      const data = await authApi.signUp(form);
      if (data.session) {
        const ok = await handleAuthed(data.session.user.id);
        if (!ok) return { ok: false, error: "สมัครสำเร็จแต่โหลดข้อมูลไม่ได้ กรุณาเข้าสู่ระบบใหม่" };
        return { ok: true };
      }
      return { ok: true, needConfirm: true };
    } catch (e) {
      return { ok: false, error: authApi.translateAuthError(e?.message) };
    }
  };

  const submitGoogle = async () => {
    try {
      await authApi.signInWithGoogle();
      return { ok: true }; // web: จะ redirect ออกนอกหน้า กลับมาโดย onAuthStateChange
    } catch {
      return { ok: false, error: "ยังไม่ได้ตั้งค่า Google Sign-in ใน Supabase" };
    }
  };

  // ---------- แพ็กเกจสมาชิก ----------
  /** โหลดข้อมูลใหม่จาก DB (ใช้หลังเปลี่ยน tier เพื่อให้จำกัดประวัติตรงกันทันที) */
  const refreshData = async () => {
    try {
      applyLoaded(await db.loadAllData(userId));
      return true;
    } catch (e) {
      console.warn("[load]", e?.message || e);
      return false;
    }
  };

  const activateTier = async (newTier) => {
    try {
      if (cloud) await db.activateSubscription(userId, newTier, { days: 30 });
      setTier(newTier);
      if (cloud) await refreshData();
      Alert.alert("สำเร็จ!", `เปิดใช้แพ็กเกจ ${newTier.toUpperCase()} แล้ว (ทดลองใช้ 30 วัน)`);
    } catch (e) {
      console.warn("[sync]", e?.message || e);
      setTier("standard");
      Alert.alert("ไม่สำเร็จ", "บันทึกขึ้นฐานข้อมูลไม่ได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  const cancelTier = async () => {
    try {
      if (cloud) await db.cancelSubscription(userId);
      setTier("standard");
      if (cloud) await refreshData();
      Alert.alert("ยกเลิกแล้ว", "กลับไปใช้แพ็กเกจ Standard เรียบร้อย");
    } catch (e) {
      console.warn("[sync]", e?.message || e);
      Alert.alert("ไม่สำเร็จ", "บันทึกขึ้นฐานข้อมูลไม่ได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  const go = (s) => setScreenStack((prev) => [...prev, s]);

  
  const selectPet = (id) => {
    setActivePetId(id);
    go("petProfile");
  };

  
  const addPet = (newPet, initialWeight) => {
    // บังคับจำนวนสัตว์เลี้ยงตามแพ็กเกจ (null = ไม่จำกัด)
    const limit = PET_LIMITS[tier];
    if (limit != null && pets.length >= limit) {
      Alert.alert(
        "จำนวนสัตว์เลี้ยงเต็มตามแพ็กเกจ",
        `แพ็กเกจปัจจุบันรองรับสูงสุด ${limit} ตัว (มีอยู่ ${pets.length} ตัว)\nอัปเกรดแพ็กเกจเพื่อเพิ่มสัตว์เลี้ยงได้ที่ "แพ็กเกจของฉัน" ในหน้าโปรไฟล์`
      );
      return false;
    }
    const pet = { ...newPet, id: uuid() }; // DB ใช้ uuid
    setPets((prev) => [...prev, pet]);
    if (initialWeight) {
      setWeightData((prev) => ({
        ...prev,
        [pet.id]: [...(prev[pet.id] || []), { value: initialWeight, date: new Date().toISOString() }],
      }));
    }
    if (cloud) mirror(db.insertPet(userId, pet, initialWeight));
    return true;
  };


  const removePet = (id) => {
    setPets((prev) => prev.filter((p) => p.id !== id));
    const dropKey = (prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    };
    setWeightData(dropKey);
    setHealthData(dropKey);
    setFoodData(dropKey);
    setActivityData(dropKey);
    setNotesData(dropKey);
    setFoodGoals(dropKey);
    setActivityGoals(dropKey);
    setWalkReminderPrefs(dropKey);
    setFoodReminderPrefs(dropKey);
    setReminderPrefs(dropKey);
    setAppointments((prev) => prev.filter((a) => a.petId !== id));
    setNotifications((prev) => prev.filter((n) => n.petId !== id));
    setActivePetId((prev) => (prev === id ? null : prev));
    if (cloud) mirror(db.deletePet(id));
  }


  const addWeightEntry = (petId, value, date) => {
    setWeightData((prev) => ({
      ...prev,
      [petId]: [...(prev[petId] || []), { value, date: date.toISOString() }],
    }));
    if (cloud) mirror(db.upsertWeight(userId, petId, { value, date: date.toISOString() }));
  };

  const completeHealthItem = (petId, itemId) => {
    setHealthData((prev) => {
      const current = prev[petId] || { upcoming: [], completed: [] };
      const item = current.upcoming.find((i) => i.id === itemId);
      if (!item) return prev;
      return {
        ...prev,
        [petId]: {
          upcoming: current.upcoming.filter((i) => i.id !== itemId),
          completed: [...current.completed, item],
        },
      };
    });
    if (cloud) mirror(db.completeHealthItem(userId, petId, itemId));
  };

  const addHealthItem = (petId, item) => {
    const withId = { ...item, id: uuid() };
    setHealthData((prev) => {
      const current = prev[petId] || { upcoming: [], completed: [] };
      return {
        ...prev,
        [petId]: { ...current, upcoming: [...current.upcoming, withId] },
      };
    });
    if (cloud) mirror(db.insertHealthItem(userId, petId, withId));
  };

  const addAppointment = (appt) => {
    const withId = { ...appt, id: uuid() };
    setAppointments((prev) => [...prev, withId]);
    if (cloud) mirror(db.insertAppointment(userId, withId));
  };
  const removeAppointment = (id) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    if (cloud) mirror(db.deleteAppointment(id));
  };

  const markRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    if (cloud) mirror(db.markNotificationRead(id));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (cloud) mirror(db.markAllNotificationsRead(userId));
  };
  const dismissedReminderIdsRef = useRef(new Set());

  const removeNotification = (id) => {
    if (id.startsWith("meal-") || id.startsWith("walk-") || id.startsWith("note-") || id.startsWith("appt-")) {
      dismissedReminderIdsRef.current.add(id);
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (cloud) mirror(db.deleteNotificationByDedupeKey(id));
  };

  
  const openNotification = (n) => {
    markRead(n.id);
    if (n.petId && pets.some((p) => p.id === n.petId)) {
      setActivePetId(n.petId);
      setScreenStack((prev) => [...prev, n.screen]);
    } else {
      setScreenStack((prev) => [...prev, "home"]);
    }
  };

  const updateUser = (patch) => {
    setUser((prev) => ({ ...prev, ...patch }));
    if (cloud) {
      if (patch.photo) {
        // รูปโปรไฟล์: อัปโหลดขึ้น Storage แล้วเก็บ avatar_path (แทน uri ในเครื่อง)
        mirror((async () => {
          const path = await uploadPhoto(userId, "profile", "users", patch.photo);
          await db.saveUserPatch(userId, path ? { avatar_path: path } : {});
        })());
      }
      mirror(db.saveUserPatch(userId, patch));
    }
  };


  const makeListHandlers = (setter, sync) => ({
    onAdd: (petId, item) => {
      const withId = { ...item, id: uuid() }; // DB ใช้ uuid
      setter((prev) => ({ ...prev, [petId]: [...(prev[petId] || []), withId] }));
      if (cloud) mirror(sync.insert(userId, petId, withId));
    },
    onEdit: (petId, itemId, patch) => {
      setter((prev) => ({
        ...prev,
        [petId]: (prev[petId] || []).map((i) => (i.id === itemId ? { ...i, ...patch } : i)),
      }));
      if (cloud) mirror(sync.update(itemId, patch));
    },
    onRemove: (petId, itemId) => {
      setter((prev) => ({
        ...prev,
        [petId]: (prev[petId] || []).filter((i) => i.id !== itemId),
      }));
      if (cloud) mirror(sync.remove(itemId));
    },
  });

  const foodHandlers = makeListHandlers(setFoodData, {
    insert: db.insertFoodLog,
    update: db.updateFoodLog,
    remove: (id) => db.deleteRow("food_logs", id),
  });
  const activityHandlers = makeListHandlers(setActivityData, {
    insert: db.insertActivityLog,
    update: (id, patch) =>
      db.updateListRow("activity_logs", id, {
        description: patch.text,
        kind: patch.tag,
        // minutes เป็น null เมื่อข้อความใหม่ไม่มีตัวเลข — ไม่ส่งไปแทนที่จะชน NOT NULL
        minutes: patch.minutes == null ? undefined : patch.minutes,
      }),
    remove: (id) => db.deleteRow("activity_logs", id),
  });
  const notesHandlers = makeListHandlers(setNotesData, {
    insert: db.insertNote,
    update: (id, patch) =>
      db.updateListRow("notes", id, {
        body: patch.text,
        category: patch.category,
        pinned: patch.pinned,
        // ส่ง reminder_at เฉพาะเมื่อแก้ reminder เท่านั้น — กัน pin/แก้ข้อความลบทิ้ง
        ...( "reminderAt" in patch ? { reminder_at: patch.reminderAt ?? null } : {}),
      }),
    remove: (id) => db.deleteRow("notes", id),
  });


  const composeSettings = (petId, foodGoal, activityGoal) => ({
    foodGoalG: foodGoal,
    activityGoalMin: activityGoal,
    foodReminder: foodReminderPrefs[petId],
    walkReminder: walkReminderPrefs[petId],
    vaccineReminder: reminderPrefs[petId],
  });
  const setFoodGoal = (petId, grams) => {
    setFoodGoals((prev) => ({ ...prev, [petId]: grams }));
    if (cloud) mirror(db.upsertSettings(userId, petId, composeSettings(petId, grams, activityGoals[petId] ?? DEFAULT_ACTIVITY_GOAL_MIN)));
  };
  const setActivityGoal = (petId, mins) => {
    setActivityGoals((prev) => ({ ...prev, [petId]: mins }));
    if (cloud) mirror(db.upsertSettings(userId, petId, composeSettings(petId, foodGoals[petId] ?? DEFAULT_FOOD_GOAL_G, mins)));
  };
  const setWalkReminder = (petId, patch) => {
    setWalkReminderPrefs((prev) => ({
      ...prev,
      [petId]: { on: true, hour: DEFAULT_WALK_REMINDER_HOUR, ...prev[petId], ...patch },
    }));
    if (cloud) {
      const merged = { on: true, hour: DEFAULT_WALK_REMINDER_HOUR, ...walkReminderPrefs[petId], ...patch };
      mirror(db.upsertSettings(userId, petId, { ...composeSettings(petId, foodGoals[petId] ?? DEFAULT_FOOD_GOAL_G, activityGoals[petId] ?? DEFAULT_ACTIVITY_GOAL_MIN), walkReminder: merged }));
    }
  };
  const setFoodReminder = (petId, patch) => {
    setFoodReminderPrefs((prev) => {
      const cur = prev[petId] || { on: true };
      return {
        ...prev,
        [petId]: { ...cur, ...patch, hours: { ...(cur.hours || {}), ...(patch.hours || {}) } },
      };
    });
    if (cloud) {
      const cur = foodReminderPrefs[petId] || { on: true };
      const merged = { ...cur, ...patch, hours: { ...(cur.hours || {}), ...(patch.hours || {}) } };
      mirror(db.upsertSettings(userId, petId, { ...composeSettings(petId, foodGoals[petId] ?? DEFAULT_FOOD_GOAL_G, activityGoals[petId] ?? DEFAULT_ACTIVITY_GOAL_MIN), foodReminder: merged }));
    }
  };

  const back = () =>
    setScreenStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : ["home"]));

  const goWithBack = (s) => {
    if (s === "back") back();
    else if (s === "welcome") setScreenStack(["welcome"]);
    else if (s === "logout") {
      if (cloud) {
        authApi.signOut().catch(() => {});
        resetData();
        setUserId(null);
      }
      setScreenStack(["login"]);
    }
    else go(s);
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (screenStack.length > 1) {
        back();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [screenStack]);

  useEffect(() => {
    const check = () => {
      // โหมด cloud: ข้ามจนกว่าข้อมูลจริงจะโหลดมาแล้ว (ไม่งั้นยิงแจ้งเตือนจาก mock data ที่ id ไม่มีใน DB)
      if (cloud && !dataLoaded) return;
      const now = new Date();
      // รูปแบบ YYYY-MM-DD ต้องตรงกับ server (0002_reminders.sql) เพื่อให้ dedupe_key ซ้ำกันได้
      const dateKey = db.localDateKey(now.toISOString());
      // สถานะมื้อวันนี้ของทุกสัตว์: id → { fed: ล็อกแล้ว, pastDue: เลยเวลาหรือยัง, title, petId }
      const todayMeals = new Map();
      for (const pet of pets) {
        const pref = foodReminderPrefs[pet.id] || { on: true };
        if (!pref.on) continue;
        for (const m of MEAL_REMINDERS) {
          if (pref.meals && pref.meals[m.tag] === false) continue;
          const hour = pref.hours?.[m.tag] ?? m.hour;
          const fed = (foodData[pet.id] || []).some(
            (it) => it.tag === m.tag && it.createdAt && isSameDate(new Date(it.createdAt), now)
          );
          todayMeals.set(`meal-${pet.id}-${m.tag}-${dateKey}`, {
            fed,
            pastDue: now.getHours() >= hour,
            title: `ยังไม่ได้บันทึกมื้อ${m.label}ของ ${pet.name}`,
            petId: pet.id,
          });
        }
      }
      setNotifications((prev) => {
        const existing = new Set(prev.map((n) => n.id));
        const toAdd = [];
        for (const [id, st] of todayMeals) {
          if (st.fed || !st.pastDue) continue;
          if (existing.has(id) || dismissedReminderIdsRef.current.has(id)) continue;
          toAdd.push({ id, title: st.title, time: "เมื่อสักครู่", read: false, petId: st.petId, screen: "food" });
        }

        const next = prev.filter((n) => {
          if (!n.id.startsWith("meal-")) return true;
          const st = todayMeals.get(n.id);
          return st != null && !st.fed;
        });
        if (toAdd.length === 0 && next.length === prev.length) return prev;
        if (cloud) {
          for (const n of toAdd) {
            mirror(db.insertNotification(userId, n, "meal"));
            showReminder(n.title, "แตะเพื่อเปิดแอปและบันทึกมื้ออาหาร");
          }
          for (const n of prev) {
            if (n.id.startsWith("meal-") && !next.includes(n)) mirror(db.deleteNotificationByDedupeKey(n.id));
          }
        }
        return toAdd.length ? [...toAdd, ...next] : next;
      });
    };
    check();
    const timer = setInterval(check, 60000);
    return () => clearInterval(timer);
  }, [pets, foodData, foodReminderPrefs, notifications, cloud, userId, dataLoaded]);

  useEffect(() => {
    const check = () => {
      if (cloud && !dataLoaded) return;
      const now = new Date();
      // รูปแบบ YYYY-MM-DD ต้องตรงกับ server (0002_reminders.sql) เพื่อให้ dedupe_key ซ้ำกันได้
      const dateKey = db.localDateKey(now.toISOString());
      const toAdd = [];
      for (const pet of pets) {
        const pref = walkReminderPrefs[pet.id] || { on: true, hour: DEFAULT_WALK_REMINDER_HOUR };
        if (!pref.on || now.getHours() < pref.hour) continue;
        const walked = (activityData[pet.id] || []).some(
          (it) => it.tag === "Walk" && it.createdAt && isSameDate(new Date(it.createdAt), now)
        );
        if (walked) continue;
        toAdd.push({
          id: `walk-${pet.id}-${dateKey}`,
          title: `ถึงเวลาพา ${pet.name} ไปเดินเล่นแล้ว!`,
          time: "เมื่อสักครู่",
          read: false,
          petId: pet.id,
          screen: "activityLog",
        });
      }
      if (toAdd.length === 0) return;
      setNotifications((prev) => {
        const existing = new Set(prev.map((n) => n.id));
        const fresh = toAdd.filter((n) => !existing.has(n.id) && !dismissedReminderIdsRef.current.has(n.id));
        if (cloud) {
          for (const n of fresh) {
            mirror(db.insertNotification(userId, n, "walk"));
            showReminder(n.title, "แตะเพื่อเปิดแอปและบันทึกกิจกรรม");
          }
        }
        return fresh.length ? [...fresh, ...prev] : prev;
      });
    };
    check();
    const timer = setInterval(check, 60000);
    return () => clearInterval(timer);
  }, [pets, activityData, walkReminderPrefs, notifications, cloud, userId, dataLoaded]);

  
  useEffect(() => {
    const check = () => {
      if (cloud && !dataLoaded) return;
      const now = new Date();
      const due = [];
      for (const pet of pets) {
        for (const it of notesData[pet.id] || []) {
          if (it.reminderAt && !it.reminded && new Date(it.reminderAt) <= now) {
            due.push({ petId: pet.id, item: it });
          }
        }
      }
      if (due.length === 0) return;
      if (cloud) for (const { item } of due) mirror(db.markNoteReminded(item.id));
      setNotesData((prev) => {
        const next = { ...prev };
        for (const { petId, item } of due) {
          next[petId] = (next[petId] || []).map((i) => (i.id === item.id ? { ...i, reminded: true } : i));
        }
        return next;
      });
      setNotifications((prev) => {
        const add = due.map(({ petId, item }) => ({
          id: `note-${petId}-${item.id}`,
          title: `แจ้งเตือน: ${item.text}`,
          time: "เมื่อสักครู่",
          read: false,
          petId,
          screen: "notes",
        }));
        const filtered = prev.filter((n) => !add.some((a) => a.id === n.id));
        if (cloud) {
          for (const n of add) {
            mirror(db.insertNotification(userId, n, "note"));
            showReminder(n.title, "แตะเพื่อเปิดแอปและดูโน้ต");
          }
        }
        return [...add, ...filtered];
      });
    };
    check();
    const timer = setInterval(check, 60000);
    return () => clearInterval(timer);
  }, [pets, notesData, notifications, cloud, userId, dataLoaded]);

  // Engine 4: แจ้งเตือนนัดหมายล่วงหน้า 5 วัน (ฟีเจอร์ Plus/Premium)
  useEffect(() => {
    if (!["plus", "premium"].includes(tier)) return;
    const check = () => {
      const now = new Date();
      const dateKey = db.localDateKey(now.toISOString());
      const toAdd = [];
      for (const appt of appointments) {
        // นับแบบปฏิทิน (ไม่ใช่ ceil มิลลิวินาที) — กันนัดวันนี้แสดง "อีก 1 วัน"
        const diffDays = Math.round(
          (new Date(db.localDateKey(appt.dateObj.toISOString())) - new Date(db.localDateKey(now.toISOString()))) / 86400000
        );
        if (diffDays < 1 || diffDays > 5) continue;
        toAdd.push({
          id: `appt-${appt.id}-${dateKey}`,
          title: `นัดหมาย "${appt.title}" อีก ${diffDays} วัน`,
          time: "เมื่อสักครู่",
          read: false,
          petId: appt.petId,
          screen: "petAppointments",
        });
      }
      if (toAdd.length === 0) return;
      setNotifications((prev) => {
        const existing = new Set(prev.map((n) => n.id));
        const fresh = toAdd.filter((n) => !existing.has(n.id) && !dismissedReminderIdsRef.current.has(n.id));
        if (cloud) {
          for (const n of fresh) {
            mirror(db.insertNotification(userId, n, "appointment"));
            showReminder(n.title, "แตะเพื่อดูรายละเอียดนัดหมาย");
          }
        }
        return fresh.length ? [...fresh, ...prev] : prev;
      });
    };
    check();
    const timer = setInterval(check, 60000);
    return () => clearInterval(timer);
  }, [appointments, tier, notifications, cloud, userId, dataLoaded]);


  const renderScreen = () => {
    switch (screen) {
    case "welcome":
      return <WelcomeScreen go={goWithBack} />;
    case "login":
      return (
        <LoginScreen
          go={goWithBack}
          submitLogin={submitLogin}
          submitGoogle={submitGoogle}
        />
      );
    case "register":
      return (
        <RegisterScreen
          go={goWithBack}
          submitRegister={submitRegister}
          submitGoogle={submitGoogle}
        />
      );
    case "home":
      return <HomeScreen go={goWithBack} pets={pets} weightData={weightData} selectPet={selectPet} removePet={removePet} tier={tier} />;
    case "addPet":
      return <AddPetScreen go={back} addPet={addPet} />;
    case "subscription":
      return <SubscriptionScreen go={goWithBack} tier={tier} petCount={pets.length} onActivate={activateTier} onCancel={cancelTier} />;
    case "petProfile":
      return (
        <PetProfileScreen
          go={(s) => (s === "home" ? back() : go(s))}
          activePet={activePet}
          weightData={weightData}
          healthData={healthData}
          appointments={appointments}
          foodData={foodData}
          activityData={activityData}
          notesData={notesData}
          tier={tier}
        />
      );

    case "weight":
      return (
        <WeightScreen
          go={back}
          activePet={activePet}
          weightData={weightData}
          addWeightEntry={addWeightEntry}
        />
      );
    case "health":
      return (
        <HealthScreen
          go={back}
          activePet={activePet}
          healthData={healthData}
          completeHealthItem={completeHealthItem}
          addHealthItem={addHealthItem}
          remindersOn={reminderPrefs[activePet?.id] ?? true}
          setRemindersOn={(v) => setReminderOn(activePet.id, v)}
        />
      );
    case "petAppointments":
      return (
        <PetAppointmentsScreen
          go={back}
          activePet={activePet}
          appointments={appointments}
          addAppointment={addAppointment}
          removeAppointment={removeAppointment}
        />
      );
    case "food":
      return (
        <FoodScreen
          go={back}
          activePet={activePet}
          items={foodData[activePet?.id]}
          onAdd={foodHandlers.onAdd}
          onEdit={foodHandlers.onEdit}
          onRemove={foodHandlers.onRemove}
          goal={foodGoals[activePet?.id] ?? DEFAULT_FOOD_GOAL_G}
          onSetGoal={setFoodGoal}
          foodReminder={foodReminderPrefs[activePet?.id]}
          onSetFoodReminder={setFoodReminder}
        />
      );
    case "activityLog":
      return (
        <ActivityScreen
          go={back}
          activePet={activePet}
          items={activityData[activePet?.id]}
          onAdd={activityHandlers.onAdd}
          onEdit={activityHandlers.onEdit}
          onRemove={activityHandlers.onRemove}
          goal={activityGoals[activePet?.id] ?? DEFAULT_ACTIVITY_GOAL_MIN}
          onSetGoal={setActivityGoal}
          walkReminder={walkReminderPrefs[activePet?.id]}
          onSetWalkReminder={setWalkReminder}
        />
      );
    case "notes":
      return (
        <NotesScreen
          go={back}
          activePet={activePet}
          items={notesData[activePet?.id]}
          onAdd={notesHandlers.onAdd}
          onEdit={notesHandlers.onEdit}
          onRemove={notesHandlers.onRemove}
        />
      );

    case "notifications":
      return (
        <NotificationsScreen
          go={goWithBack}
          notifications={notifications}
          markRead={markRead}
          removeNotification={removeNotification}
          onOpen={openNotification}
          onMarkAllRead={markAllRead}
        />
      );
    case "overallAppointments":
      return (
        <OverallAppointmentsScreen
          go={goWithBack}
          appointments={appointments}
          pets={pets}
          addAppointment={addAppointment}
          removeAppointment={removeAppointment}
        />
      );
    case "userProfile":
      return (
        <UserProfileScreen
          go={goWithBack}
          user={user}
          pets={pets}
          appointments={appointments}
          notifications={notifications}
          updateUser={updateUser}
          tier={tier}
        />
      );
    case "editProfile":
      return <EditProfileScreen go={goWithBack} user={user} updateUser={updateUser} />;

    default:
      return <WelcomeScreen go={goWithBack} />;
  }
  };


  // กำลังเช็ค session ตอนเปิดแอป (โหมด cloud) — แสดงพื้นหลังเปล่ารอสักครู่
  if (!authReady) {
    return <LinearGradient colors={gradient.screen} style={{ flex: 1 }} />;
  }

  return (
    <LinearGradient colors={gradient.screen} style={{ flex: 1 }}>
      {renderScreen()}
    </LinearGradient>
  );
}
