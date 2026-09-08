/** หน้า Food */
import { useEffect, useState } from "react";
import { SafeAreaView, View, TextInput, Pressable, Image, StyleSheet, Switch } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { Soup } from "lucide-react-native";

import AppText from "../components/AppText";
import Card from "../components/Card";
import IconButton from "../components/IconButton";
import ProgressBar from "../components/ProgressBar";
import { colors, shadow } from "../theme";
import { isSameDate, timeAgo, formatGregorianShort } from "../utils/date";
import { MEAL_REMINDERS, MEAL_REMINDER_HOUR_OPTIONS } from "../data/constants";
import { parseGrams } from "../utils/parse";
import { takePhoto, choosePhoto } from "../utils/photo";
import AnimatedScrollView from "../components/AnimatedScrollView";
import Reveal from "../components/Reveal";

const CAT = {
  accent: "#C97B5A",
  accentDeep: "#A8552E",
  soft: "#F3D9C2", grad: ["#F3D9C2", "#FBE3D6"], dot: "#C97B5A",
  tags: MEAL_REMINDERS,
  emptyTitle: "วันนี้ยังไม่ได้บันทึกมื้ออาหาร", emptySub: "พิมพ์เมนูแล้วกด + เพื่อบันทึกมื้อแรกของวัน",
  summaryLabel: "มื้อล่าสุด", footer: "เคล็ดลับ: พิมพ์กรัมเช่น \"200 กรัม\" — จะนับเข้าเป้าหมายรายวันอัตโนมัติ",
};

const tagLabelOf = (tag) => MEAL_REMINDERS.find((t) => t.tag === tag)?.label || tag;


const glassCard = {
  backgroundColor: "rgba(255,255,255,0.72)",
  borderColor: "rgba(255,255,255,0.5)",
  borderWidth: 1,
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 20,
  elevation: 5,
};

const glassCardStrong = {
  ...glassCard,
  backgroundColor: "rgba(255,255,255,0.8)",
  borderColor: "rgba(201,123,90,0.4)",
  shadowOpacity: 0.14,
  elevation: 7,
};

const glassCardWarn = {
  ...glassCard,
  backgroundColor: "rgba(255,246,214,0.78)",
  borderColor: "rgba(222,168,74,0.45)",
};


const PERIODS = [
  { key: "today", label: "วันนี้", days: 1 },
  { key: "7d", label: "7 วัน", days: 7 },
  { key: "30d", label: "30 วัน", days: 30 },
];

function FoodScreen({ go, activePet, items, onAdd, onEdit, onRemove, goal, onSetGoal, foodReminder, onSetFoodReminder }) {
  const [text, setText] = useState("");
  const [activeTag, setActiveTag] = useState(CAT.tags[0].tag);
  const [period, setPeriod] = useState("today");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const [pendingPhoto, setPendingPhoto] = useState(null);

  const [goalEditing, setGoalEditing] = useState(false);
  const [goalText, setGoalText] = useState("");

  const [mealDraft, setMealDraft] = useState({});
  const [hourDraft, setHourDraft] = useState(10);
  const [justSaved, setJustSaved] = useState(false);

  const list = items || [];
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);


  const gramsOf = (it) => (it.grams != null ? it.grams : parseGrams(it.text)) || 0;

  const todayTotal = list
    .filter((it) => it.createdAt && new Date(it.createdAt) >= startOfToday)
    .reduce((sum, it) => sum + gramsOf(it), 0);
  const weekCutoff = new Date(startOfToday);
  weekCutoff.setDate(weekCutoff.getDate() - 6);
  const weekTotal = list
    .filter((it) => it.createdAt && new Date(it.createdAt) >= weekCutoff)
    .reduce((sum, it) => sum + gramsOf(it), 0);

  const todayCount = list.filter((it) => it.createdAt && new Date(it.createdAt) >= startOfToday).length;
  const lastItem = list.slice(-1)[0];


  const days = PERIODS.find((p) => p.key === period)?.days || 1;
  const cutoff = new Date(startOfToday);
  cutoff.setDate(cutoff.getDate() - (days - 1));
  const filtered = list.filter((it) => it.createdAt && new Date(it.createdAt) >= cutoff);

  const dayGroups =
    period === "today"
      ? null
      : [...filtered]
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
          .reduce((acc, it) => {
            const d = new Date(it.createdAt);
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            const g = acc.find((x) => x.key === key);
            if (g) g.items.push(it);
            else acc.push({ key, date: d, items: [it] });
            return acc;
          }, [])
          .sort((a, b) => b.date - a.date);

  const dayLabel = (d) => {
    const yesterday = new Date(startOfToday);
    yesterday.setDate(yesterday.getDate() - 1);
    if (isSameDate(d, now)) return "วันนี้";
    if (isSameDate(d, yesterday)) return "เมื่อวาน";
    return formatGregorianShort(d);
  };


  const reminderOn = foodReminder?.on ?? true;
  const hourOf = (m) => foodReminder?.hours?.[m.tag] ?? m.hour;
  const mealEnabled = (m, source) => source?.meals?.[m.tag] ?? true;

  const buildMealDraft = () =>
    Object.fromEntries(CAT.tags.map((t) => [t.tag, mealEnabled(t, foodReminder)]));

  const buildHourDraft = () => {
    const first = CAT.tags.find((t) => mealEnabled(t, foodReminder));
    return first ? hourOf(first) : 10;
  };

  useEffect(() => {
    setMealDraft(buildMealDraft());
    setHourDraft(buildHourDraft());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePet?.id, foodReminder?.meals]);

  useEffect(() => {
    setJustSaved(false);
  }, [activePet?.id]);

  const mealsDirty =
    CAT.tags.some((t) => mealDraft[t.tag] !== mealEnabled(t, foodReminder)) ||
    CAT.tags.some((t) => mealDraft[t.tag] && hourOf(t) !== hourDraft);
  const showSaved = justSaved && !mealsDirty;

  const saveMeals = () => {
    const hours = Object.fromEntries(CAT.tags.filter((t) => mealDraft[t.tag]).map((t) => [t.tag, hourDraft]));
    onSetFoodReminder(activePet.id, { meals: mealDraft, hours });
    setJustSaved(true);
  };

  const missingMeals = reminderOn
    ? CAT.tags.filter(
        (m) =>
          mealEnabled(m, foodReminder) &&
          now.getHours() >= hourOf(m) &&
          !list.some((it) => it.tag === m.tag && it.createdAt && new Date(it.createdAt) >= startOfToday)
      )
    : [];

  const handleAdd = () => {
    if (!text.trim()) return;
    onAdd(activePet.id, {
      id: `${Date.now()}`,
      text: text.trim(),
      tag: activeTag,
      grams: parseGrams(text),
      photo: pendingPhoto,
      createdAt: new Date(),
    });
    setText("");
    setPendingPhoto(null);
  };

  const handlePhoto = async (mode) => {
    const uri = mode === "camera" ? await takePhoto() : await choosePhoto();
    if (uri) setPendingPhoto(uri);
  };

  const startEdit = (it) => {
    setEditingId(it.id);
    setEditText(it.text);
  };

  const saveEdit = () => {
    if (!editText.trim()) return;
    onEdit(activePet.id, editingId, { text: editText.trim(), grams: parseGrams(editText) });
    setEditingId(null);
  };

  const saveGoal = () => {
    const g = parseInt(goalText, 10);
    if (!isNaN(g) && g > 0) onSetGoal(activePet.id, g);
    setGoalEditing(false);
  };

  const renderRow = (it) =>
    editingId === it.id ? (
      <Reveal key={it.id}>
        <Card style={[glassCard, styles.row]}>
          <TextInput
            style={styles.editInput}
            value={editText}
            onChangeText={setEditText}
            autoFocus
            onSubmitEditing={saveEdit}
          />
          <IconButton icon="check" color={CAT.accentDeep} onPress={saveEdit} />
          <IconButton icon="x" color={colors.textGray} onPress={() => setEditingId(null)} />
        </Card>
      </Reveal>
    ) : (
      <Reveal key={it.id}>
        <Card style={[glassCard, styles.row]}>
          {it.photo ? (
            <Image source={{ uri: it.photo }} style={styles.thumb} />
          ) : (
            <View style={[styles.dot, { backgroundColor: CAT.dot }]} />
          )}
          <View style={{ flex: 1, marginLeft: 10 }}>
            <AppText style={styles.rowTitle} numberOfLines={2}>{it.text}</AppText>
            <AppText style={styles.rowSub}>
              {[tagLabelOf(it.tag), it.createdAt ? timeAgo(new Date(it.createdAt)) : null].filter(Boolean).join(" · ")}
            </AppText>
          </View>
          {gramsOf(it) > 0 && (
            <View style={styles.gramsPill}>
              <AppText style={styles.gramsText}>{gramsOf(it)} ก.</AppText>
            </View>
          )}
          {onEdit && (
            <IconButton icon="edit-2" size={16} color={colors.brown} accessibilityLabel="แก้ไขรายการมื้ออาหาร" onPress={() => startEdit(it)} />
          )}
          <IconButton icon="trash-2" size={16} color="#B23A22" accessibilityLabel="ลบรายการมื้ออาหาร" onPress={() => onRemove(activePet.id, it.id)} />
        </Card>
      </Reveal>
    );

  const emptyTitle = period === "today" ? CAT.emptyTitle : `ไม่มีรายการอาหารใน ${days} วันที่ผ่านมา`;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <AnimatedScrollView contentContainerStyle={{ paddingBottom: 32 }}>

          <LinearGradient colors={CAT.grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
            <Pressable onPress={() => go("petProfile")} style={styles.backBtn}>
              <Feather name="chevron-left" size={22} color={colors.textDark} />
            </Pressable>
            <AppText style={styles.headerTitle}>อาหาร · {activePet.name}</AppText>
            <View style={[styles.countPill, { backgroundColor: CAT.accentDeep }]}>
              <AppText style={styles.countText}>วันนี้ {todayCount} มื้อ</AppText>
            </View>
          </LinearGradient>


          <Reveal>
            <Card style={[glassCardStrong, styles.goalCard]}>
              <View style={styles.goalRow}>
                <View style={[styles.summaryIcon, { backgroundColor: CAT.soft }]}>
                  <Feather name="target" size={18} color={CAT.accentDeep} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <AppText style={styles.summaryLabel}>วันนี้กินไป {Math.round(todayTotal)} กรัม</AppText>
                  <AppText style={styles.summarySub}>สัปดาห์นี้รวม {Math.round(weekTotal)} กรัม</AppText>
                </View>
                {goalEditing ? (
                  <View style={styles.goalEditRow}>
                    <TextInput
                      style={styles.goalInput}
                      value={goalText}
                      onChangeText={setGoalText}
                      keyboardType="number-pad"
                      autoFocus
                      onSubmitEditing={saveGoal}
                    />
                    <AppText style={styles.goalUnit}>g</AppText>
                    <IconButton icon="check" size={16} color={CAT.accentDeep} onPress={saveGoal} />
                  </View>
                ) : (
                  <Pressable
                    onPress={() => { setGoalText(String(goal)); setGoalEditing(true); }}
                    style={styles.goalPill}
                    accessibilityRole="button"
                    accessibilityLabel={`แก้ไขเป้าหมายอาหารรายวัน ปัจจุบัน ${goal} กรัม`}
                  >
                    <Feather name="edit-2" size={11} color="#FFFFFF" />
                    <AppText style={styles.goalPillText}>เป้า {goal} กรัม</AppText>
                    <AppText style={styles.goalEditLabel}>แก้ไข</AppText>
                  </Pressable>
                )}
              </View>
              <ProgressBar value={todayTotal} max={goal} unit=" ก." accent={CAT.accentDeep} />
            </Card>
          </Reveal>

          {pendingPhoto && (
            <View style={styles.previewRow}>
              <View style={styles.previewWrap}>
                <Image source={{ uri: pendingPhoto }} style={styles.pendingThumb} />
                <Pressable onPress={() => setPendingPhoto(null)} style={styles.previewRemove}>
                  <Feather name="x" size={13} color="#FFFFFF" />
                </Pressable>
              </View>
              <AppText style={styles.previewHint}>รูปนี้จะแนบกับมื้อถัดไปของคุณ</AppText>
            </View>
          )}

          <View style={styles.inputRow}>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                value={text}
                onChangeText={setText}
                placeholder="เช่น อาหารเม็ด 200 กรัม - เช้า"
                placeholderTextColor={colors.textGray}
              />
            </View>
            <Pressable onPress={() => handlePhoto("camera")} style={[styles.photoBtn, { backgroundColor: CAT.soft }]} accessibilityRole="button" accessibilityLabel="ถ่ายรูปมื้อนี้">
              <Feather name="camera" size={18} color={CAT.accentDeep} />
            </Pressable>
            <Pressable onPress={() => handlePhoto("gallery")} style={[styles.photoBtn, { backgroundColor: CAT.soft }]} accessibilityRole="button" accessibilityLabel="เลือกรูปจากคลังภาพ">
              <Feather name="image" size={18} color={CAT.accentDeep} />
            </Pressable>
            <Pressable onPress={handleAdd} style={[styles.addBtn, { backgroundColor: CAT.accentDeep }]} accessibilityRole="button" accessibilityLabel="บันทึกมื้อนี้">
              <Feather name="plus" size={22} color="#FFFFFF" />
            </Pressable>
          </View>

          <View style={styles.chipsRow}>
            {CAT.tags.map((t) => {
              const active = activeTag === t.tag;
              return (
                <Pressable
                  key={t.tag}
                  onPress={() => setActiveTag(t.tag)}
                  style={[styles.chip, active ? styles.chipActive : styles.chipGlass]}
                >
                  <View style={styles.chipInner}>
                    <Feather name={t.icon} size={13} color={active ? "#FFFFFF" : colors.textDark} />
                    <AppText style={[styles.chipText, { color: active ? "#FFFFFF" : colors.textDark, fontWeight: active ? "600" : "400" }]}>
                      {t.label}
                    </AppText>
                  </View>
                </Pressable>
              );
            })}
          </View>


          {missingMeals.length > 0 && (
            <Reveal>
              <Card style={[glassCardWarn, styles.reminderCard]}>
                <View style={[styles.summaryIcon, { backgroundColor: "#FBEFD8" }]}>
                  <Feather name="bell" size={18} color={CAT.accentDeep} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <AppText style={styles.summaryLabel}>เตือนมื้ออาหาร</AppText>
                  <AppText style={styles.summarySub} numberOfLines={1}>
                    ยังไม่ได้บันทึกมื้อ: {missingMeals.map((m) => m.label).join(" · ")}
                  </AppText>
                </View>
                <Feather name="chevron-right" size={18} color={colors.textBody} />
              </Card>
            </Reveal>
          )}

          {onSetFoodReminder && (
            <Reveal>
              <Card style={[glassCard, styles.foodReminderCard]}>
                <View style={[styles.goalRow, styles.reminderRowFirst]}>
                  <View style={[styles.summaryIcon, { backgroundColor: CAT.soft }]}>
                    <Feather name="bell" size={18} color={CAT.accentDeep} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <AppText style={styles.summaryLabel}>แจ้งเตือนการให้อาหาร</AppText>
                    <AppText style={styles.summarySub}>
                      {reminderOn
                        ? "แจ้งเตือนเมื่อถึงเวลามื้อแล้วยังไม่ได้บันทึก"
                        : "ปิดการแจ้งเตือนอยู่"}
                    </AppText>
                  </View>
                  <Switch
                    value={reminderOn}
                    onValueChange={(v) => onSetFoodReminder(activePet.id, { on: v })}
                    trackColor={{ true: CAT.accentDeep, false: "rgba(90,52,25,0.2)" }}
                    thumbColor="#FFFFFF"
                    accessibilityLabel="เปิด/ปิดแจ้งเตือนการให้อาหาร"
                  />
                </View>
                {reminderOn && (
                  <>
                    <AppText style={styles.mealSelectTitle}>เลือกมื้อที่ต้องการแจ้งเตือน</AppText>
                    <View style={styles.mealSelectRow}>
                      {CAT.tags.map((m) => {
                        const active = mealDraft[m.tag];
                        return (
                          <Pressable
                            key={m.tag}
                            onPress={() => setMealDraft((prev) => ({ ...prev, [m.tag]: !prev[m.tag] }))}
                            style={[styles.chip, active ? styles.chipActive : styles.chipGlass]}
                            accessibilityRole="button"
                            accessibilityState={{ selected: active }}
                            accessibilityLabel={`เลือกแจ้งเตือนมื้อ${m.label}`}
                          >
                            <View style={styles.chipInner}>
                              <Feather name={m.icon} size={13} color={active ? "#FFFFFF" : colors.textDark} />
                              <AppText style={[styles.chipText, { color: active ? "#FFFFFF" : colors.textDark, fontWeight: active ? "600" : "400" }]}>
                                {m.label}
                              </AppText>
                            </View>
                          </Pressable>
                        );
                      })}
                    </View>
                    <AppText style={styles.mealSelectTitle}>เวลาแจ้งเตือน (ใช้ทุกมื้อที่เลือก)</AppText>
                    <View style={styles.mealSelectRow}>
                      {MEAL_REMINDER_HOUR_OPTIONS.map((oh) => {
                        const active = hourDraft === oh;
                        return (
                          <Pressable
                            key={oh}
                            onPress={() => setHourDraft(oh)}
                            style={[styles.chip, styles.timeChip, active ? styles.chipActive : styles.chipGlass]}
                            accessibilityRole="button"
                            accessibilityState={{ selected: active }}
                            accessibilityLabel={`ตั้งเวลาแจ้งเตือน ${oh}:00`}
                          >
                            <AppText style={[styles.chipText, { color: active ? "#FFFFFF" : colors.textDark, fontWeight: active ? "600" : "400" }]}>
                              {String(oh).padStart(2, "0")}:00
                            </AppText>
                          </Pressable>
                        );
                      })}
                    </View>
                    <Pressable
                      onPress={saveMeals}
                      disabled={!mealsDirty}
                      style={[styles.saveMealsBtn, !mealsDirty && !showSaved && styles.saveMealsBtnDisabled]}
                      accessibilityRole="button"
                      accessibilityLabel="บันทึกมื้อและเวลาที่เลือก"
                    >
                      <Feather name={showSaved ? "check" : "save"} size={15} color="#FFFFFF" />
                      <AppText style={styles.saveMealsText}>{showSaved ? "บันทึกแล้ว" : "บันทึก"}</AppText>
                    </Pressable>
                  </>
                )}
              </Card>
            </Reveal>
          )}


          <View style={styles.chipsRow}>
            {PERIODS.map((p) => {
              const active = period === p.key;
              return (
                <Pressable
                  key={p.key}
                  onPress={() => setPeriod(p.key)}
                  style={[styles.chip, active ? styles.chipActive : styles.chipGlass]}
                >
                  <AppText style={[styles.chipText, { color: active ? "#FFFFFF" : colors.textDark, fontWeight: active ? "600" : "400" }]}>
                    {p.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

  
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Soup size={64} color={CAT.accentDeep} strokeWidth={1.6} style={styles.emptyIcon} />
              <AppText style={styles.emptyTitle}>{emptyTitle}</AppText>
              <AppText style={styles.emptySub}>{CAT.emptySub}</AppText>
            </View>
          ) : (
            <>

              {lastItem && lastItem.createdAt && (
                <Reveal>
                  <Card style={[glassCard, styles.summaryCard]}>
                {lastItem.photo ? (
                      <Image source={{ uri: lastItem.photo }} style={styles.summaryThumb} />
                    ) : (
                      <View style={[styles.summaryIcon, { backgroundColor: CAT.soft }]}>
                        <Feather name="clock" size={18} color={CAT.accentDeep} />
                      </View>
                    )}
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <AppText style={styles.summaryLabel}>
                        {CAT.summaryLabel}: {timeAgo(new Date(lastItem.createdAt))}
                      </AppText>
                      <AppText style={styles.summarySub} numberOfLines={1}>
                        {lastItem.text}{lastItem.tag ? ` · ${tagLabelOf(lastItem.tag)}` : ""}
                      </AppText>
                    </View>
                  </Card>
                </Reveal>
              )}


              <View style={styles.listWrap}>
                {dayGroups
                  ? dayGroups.map((g) => (
                      <View key={g.key}>
                        <AppText style={styles.dayHeader}>{dayLabel(g.date)}</AppText>
                        {g.items.map(renderRow)}
                      </View>
                    ))
                  : filtered.map(renderRow)}
              </View>
            </>
          )}

          {/* ---------- Footer ---------- */}
          <AppText style={styles.footer}>{CAT.footer}</AppText>
        </AnimatedScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: { padding: 6 },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: "700", color: colors.textDark, marginLeft: 4 },
  countPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, ...shadow },
  countText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },

  goalCard: { marginHorizontal: 20, marginTop: 16, padding: 14 },
  goalRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  goalPill: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: CAT.accentDeep, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6,
  },
  goalPillText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  goalEditLabel: { color: "#FFFFFF", fontSize: 12, fontWeight: "400" },
  goalEditRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  goalInput: {
    width: 70, height: 34, backgroundColor: colors.cardBg, borderRadius: 10,
    borderWidth: 1, borderColor: colors.border, paddingHorizontal: 8,
    fontSize: 14, color: colors.textDark, fontFamily: "BaiJamjuree_400Regular", textAlign: "center",
  },
  goalUnit: { fontSize: 13, fontWeight: "500", color: colors.textGray },

  summaryIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  summaryLabel: { fontSize: 14, fontWeight: "700", color: colors.textDark },
  summarySub: { fontSize: 12, fontWeight: "400", color: colors.textGray, marginTop: 2 },

 
  inputRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, marginTop: 16, gap: 6 },
  inputWrap: {
    flex: 1,
    height: 50,
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  input: { fontSize: 15, color: colors.textDark, fontFamily: "BaiJamjuree_400Regular" },
  photoBtn: { width: 42, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  addBtn: { width: 50, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center", marginLeft: 10, ...shadow },
  previewRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, marginTop: 12, gap: 10 },
  previewWrap: { width: 54, height: 54 },
  previewRemove: {
    position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: 10,
    backgroundColor: colors.red, alignItems: "center", justifyContent: "center",
  },
  previewHint: { flex: 1, fontSize: 12, fontWeight: "400", color: colors.textGray },
  pendingThumb: { width: 54, height: 54, borderRadius: 12 },
  thumb: { width: 46, height: 46, borderRadius: 12 },
  summaryThumb: { width: 38, height: 38, borderRadius: 12 },

  chipsRow: { flexDirection: "row", paddingHorizontal: 20, marginTop: 12, gap: 8, flexWrap: "wrap" },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  chipInner: { flexDirection: "row", alignItems: "center", gap: 5 },
 
  chipGlass: {
    backgroundColor: "rgba(255,255,255,0.6)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
  },
 
  chipActive: { backgroundColor: CAT.accentDeep },
  chipText: { fontSize: 13 },

  reminderCard: { marginHorizontal: 20, marginTop: 14, padding: 14, flexDirection: "row", alignItems: "center" },
  foodReminderCard: { marginHorizontal: 20, marginTop: 14, padding: 14 },
  reminderRowFirst: { marginBottom: 0 },
  mealSelectTitle: { fontSize: 13, fontWeight: "600", color: colors.textDark, marginTop: 12 },
  mealSelectRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 8 },
  timeChip: { paddingHorizontal: 10, paddingVertical: 5 },
  saveMealsBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    backgroundColor: CAT.accentDeep, borderRadius: 12, paddingVertical: 10, marginTop: 12, ...shadow,
  },
  saveMealsBtnDisabled: { opacity: 0.45 },
  saveMealsText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  summaryCard: { marginHorizontal: 20, marginTop: 16, padding: 14, flexDirection: "row", alignItems: "center" },

  empty: { alignItems: "center", paddingVertical: 50 },
  emptyIcon: { marginBottom: 14 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: colors.textDark, marginBottom: 6 },
  emptySub: { fontSize: 13, fontWeight: "400", color: colors.textGray, textAlign: "center", maxWidth: 240 },

  listWrap: { marginTop: 14, paddingHorizontal: 20 },
  dayHeader: { fontSize: 13, fontWeight: "600", color: colors.textBody, marginBottom: 10, marginTop: 4 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 12, paddingVertical: 12 },
  editInput: { flex: 1, fontSize: 15, color: colors.textDark, fontFamily: "BaiJamjuree_400Regular", paddingVertical: 4, marginRight: 4 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  rowTitle: { fontSize: 15, fontWeight: "600", color: colors.textDark },
  rowSub: { fontSize: 12, fontWeight: "400", color: colors.textBody, marginTop: 2 },
  gramsPill: { backgroundColor: CAT.soft, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, marginRight: 2 },
  gramsText: { fontSize: 12, fontWeight: "700", color: colors.textDark },

  footer: { fontSize: 12, fontWeight: "400", color: colors.textBody, textAlign: "center", marginTop: 18 },
});

export default FoodScreen;
