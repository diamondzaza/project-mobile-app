/** คอมโพเนนต์หลักของแอป */
import { useState, useEffect, useRef } from "react";
import { BackHandler } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import {
  WelcomeScreen,
  LoginScreen,
  RegisterScreen,
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
import {
  initialPets,
  initialWeightData,
  initialHealthData,
  initialAppointments,
  initialNotifications,
  initialUser,
  initialFoodData,
  initialActivityData,
  initialNotesData,
} from "./data";
import { MEAL_REMINDERS, DEFAULT_FOOD_GOAL_G, DEFAULT_ACTIVITY_GOAL_MIN, DEFAULT_WALK_REMINDER_HOUR } from "./data/constants";
import { isSameDate } from "./utils/date";
import { gradient } from "./theme";

export default function App() {
  
  const [screenStack, setScreenStack] = useState(["welcome"]);
  const screen = screenStack[screenStack.length - 1];

  const [pets, setPets] = useState(initialPets);
  const [activePetId, setActivePetId] = useState(null);
  const activePet = pets.find((p) => p.id === activePetId);

  const [weightData, setWeightData] = useState(initialWeightData);
  const [healthData, setHealthData] = useState(initialHealthData);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [user, setUser] = useState(initialUser);
  const [foodData, setFoodData] = useState(initialFoodData);
  const [activityData, setActivityData] = useState(initialActivityData);
  const [notesData, setNotesData] = useState(initialNotesData);
  
  const [foodGoals, setFoodGoals] = useState({});
  const [activityGoals, setActivityGoals] = useState({});
  
  const [walkReminderPrefs, setWalkReminderPrefs] = useState({});
  
  const [reminderPrefs, setReminderPrefs] = useState({});
  const setReminderOn = (petId, v) => setReminderPrefs((prev) => ({ ...prev, [petId]: v }));

  
  const go = (s) => setScreenStack((prev) => [...prev, s]);

  
  const selectPet = (id) => {
    setActivePetId(id);
    go("petProfile");
  };

  
  const addPet = (newPet, initialWeight) => {
    setPets((prev) => [...prev, newPet]);
    if (initialWeight) {
      setWeightData((prev) => ({
        ...prev,
        [newPet.id]: [...(prev[newPet.id] || []), { value: initialWeight, date: new Date().toISOString() }],
      }));
    }
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
    setReminderPrefs(dropKey);
    setAppointments((prev) => prev.filter((a) => a.petId !== id));
    setNotifications((prev) => prev.filter((n) => n.petId !== id));
    setActivePetId((prev) => (prev === id ? null : prev));
  };

 
  const addWeightEntry = (petId, value, date) => {
    setWeightData((prev) => ({
      ...prev,
      [petId]: [...(prev[petId] || []), { value, date: date.toISOString() }],
    }));
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
  };

  const addHealthItem = (petId, item) => {
    setHealthData((prev) => {
      const current = prev[petId] || { upcoming: [], completed: [] };
      return {
        ...prev,
        [petId]: { ...current, upcoming: [...current.upcoming, item] },
      };
    });
  };

  const addAppointment = (appt) => setAppointments((prev) => [...prev, appt]);
  const removeAppointment = (id) => setAppointments((prev) => prev.filter((a) => a.id !== id));

  const markRead = (id) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  
  const dismissedReminderIdsRef = useRef(new Set());

  const removeNotification = (id) => {
    if (id.startsWith("meal-") || id.startsWith("walk-") || id.startsWith("note-")) {
      dismissedReminderIdsRef.current.add(id);
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
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

  const updateUser = (patch) => setUser((prev) => ({ ...prev, ...patch }));

  
  const makeListHandlers = (setter) => ({
    onAdd: (petId, item) =>
      setter((prev) => ({ ...prev, [petId]: [...(prev[petId] || []), item] })),
    onEdit: (petId, itemId, patch) =>
      setter((prev) => ({
        ...prev,
        [petId]: (prev[petId] || []).map((i) => (i.id === itemId ? { ...i, ...patch } : i)),
      })),
    onRemove: (petId, itemId) =>
      setter((prev) => ({
        ...prev,
        [petId]: (prev[petId] || []).filter((i) => i.id !== itemId),
      })),
  });

  const foodHandlers = makeListHandlers(setFoodData);
  const activityHandlers = makeListHandlers(setActivityData);
  const notesHandlers = makeListHandlers(setNotesData);

  
  const setFoodGoal = (petId, grams) => setFoodGoals((prev) => ({ ...prev, [petId]: grams }));
  const setActivityGoal = (petId, mins) => setActivityGoals((prev) => ({ ...prev, [petId]: mins }));
  const setWalkReminder = (petId, patch) =>
    setWalkReminderPrefs((prev) => ({
      ...prev,
      [petId]: { on: true, hour: DEFAULT_WALK_REMINDER_HOUR, ...prev[petId], ...patch },
    }));

  const back = () =>
    setScreenStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : ["home"]));

  const goWithBack = (s) => {
    if (s === "back") back();
    else if (s === "welcome") setScreenStack(["welcome"]);
    else if (s === "logout") setScreenStack(["login"]);
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
      const now = new Date();
      const dateKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
      // สถานะมื้อวันนี้ของทุกสัตว์: id → { fed: ล็อกแล้ว, pastDue: เลยเวลาหรือยัง, title, petId }
      const todayMeals = new Map();
      for (const pet of pets) {
        for (const m of MEAL_REMINDERS) {
          const fed = (foodData[pet.id] || []).some(
            (it) => it.tag === m.tag && it.createdAt && isSameDate(new Date(it.createdAt), now)
          );
          todayMeals.set(`meal-${pet.id}-${m.tag}-${dateKey}`, {
            fed,
            pastDue: now.getHours() >= m.hour,
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
        return toAdd.length ? [...toAdd, ...next] : next;
      });
    };
    check();
    const timer = setInterval(check, 60000);
    return () => clearInterval(timer);
  }, [pets, foodData]);

  
  useEffect(() => {
    const check = () => {
      const now = new Date();
      const dateKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
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
        return fresh.length ? [...fresh, ...prev] : prev;
      });
    };
    check();
    const timer = setInterval(check, 60000);
    return () => clearInterval(timer);
  }, [pets, activityData, walkReminderPrefs]);

  
  useEffect(() => {
    const check = () => {
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
      setNotesData((prev) => {
        const next = { ...prev };
        for (const { petId, item } of due) {
          next[petId] = (next[petId] || []).map((i) => (i.id === item.id ? { ...i, reminded: true } : i));
        }
        return next;
      });
      setNotifications((prev) => [
        ...due.map(({ petId, item }) => ({
          id: `note-${petId}-${item.id}`,
          title: `แจ้งเตือน: ${item.text}`,
          time: "เมื่อสักครู่",
          read: false,
          petId,
          screen: "notes",
        })),
        ...prev.filter((n) => !due.some(({ petId, item }) => n.id === `note-${petId}-${item.id}`)),
      ]);
    };
    check();
    const timer = setInterval(check, 60000);
    return () => clearInterval(timer);
  }, [pets, notesData]);


  const renderScreen = () => {
    switch (screen) {
    case "welcome":
      return <WelcomeScreen go={goWithBack} />;
    case "login":
      return <LoginScreen go={goWithBack} />;
    case "register":
      return <RegisterScreen go={goWithBack} />;
    case "home":
      return <HomeScreen go={goWithBack} pets={pets} weightData={weightData} selectPet={selectPet} removePet={removePet} />;
    case "addPet":
      return <AddPetScreen go={back} addPet={addPet} />;
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
        />
      );
    case "editProfile":
      return <EditProfileScreen go={goWithBack} user={user} updateUser={updateUser} />;

    default:
      return <WelcomeScreen go={goWithBack} />;
  }
  };


  return (
    <LinearGradient colors={gradient.screen} style={{ flex: 1 }}>
      {renderScreen()}
    </LinearGradient>
  );
}
