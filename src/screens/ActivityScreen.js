/** หน้า Activity */
import { useState, useRef, useEffect } from "react";
import { SafeAreaView, View, TextInput, Pressable, Switch, StyleSheet, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { Footprints, Volleyball, Moon, Flame, PawPrint } from "lucide-react-native";

import Card from "../components/Card";
import AppText from "../components/AppText";
import IconButton from "../components/IconButton";
import ProgressBar from "../components/ProgressBar";
import SimpleBarChart from "../calendar/SimpleBarChart";
import { colors, shadow } from "../theme";
import { isSameDate, timeAgo, formatGregorianShort, MONTH_ABBR } from "../utils/date";
import { WEEKDAY_LABELS, MONTH_NAMES, WALK_REMINDER_HOUR_OPTIONS, DEFAULT_WALK_REMINDER_HOUR } from "../data/constants";
import { parseMinutes, minutesLabel } from "../utils/parse";
import { confirmDelete } from "../utils/confirm";
import AnimatedScrollView from "../components/AnimatedScrollView";
import Reveal from "../components/Reveal";

const CAT = {
  accent: "#C97B5A",
  
  accentDeep: "#A8552E",
  soft: "#F3D9C2", grad: ["#E8C4A0", "#F3D9C2"],
  tags: [
    { key: "Walk", label: "เดินเล่น", Icon: Footprints },
    { key: "Play", label: "เล่น", Icon: Volleyball },
    { key: "Rest", label: "พักผ่อน", Icon: Moon },
  ],
  emptyTitle: "วันนี้ยังไม่มีกิจกรรมที่บันทึกไว้", emptySub: "บันทึกการเดินหรือเล่นด้านล่าง เพื่อรักษาสถิติต่อเนื่องไว้",
  footer: "เคล็ดลับ: พิมพ์นาทีเช่น \"30 นาที\" — จะนับเข้าเป้าหมายเดินรายวันอัตโนมัติ",
};

const tagLabelOf = (tag) => CAT.tags.find((t) => t.key === tag)?.label || tag;


const minsSplit = (mins) => {
  if (mins == null) return { main: "—", sub: null };
  if (mins < 60) return { main: `${Math.round(mins)} นาที`, sub: null };
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return { main: `${h} ชม.`, sub: m ? `${m} นาที` : null };
};


const TAG_DOT = { Walk: "#4E7FA8", Play: "#8A6FB0", Rest: "#8F6B14" };


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

const CHART_PERIODS = [
  { key: "week", label: "สัปดาห์" },
  { key: "month", label: "เดือน" },
];
const PERIODS = [
  { key: "today", label: "วันนี้", days: 1 },
  { key: "7d", label: "7 วัน", days: 7 },
  { key: "30d", label: "30 วัน", days: 30 },
];

const dateKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

function ActivityScreen({ go, activePet, items, onAdd, onEdit, onRemove, goal, onSetGoal, walkReminder, onSetWalkReminder }) {
  const [text, setText] = useState("");
  const [activeTag, setActiveTag] = useState(CAT.tags[0].key);
  const [chartPeriod, setChartPeriod] = useState("week");
  const [chartTag, setChartTag] = useState("all");
  const [period, setPeriod] = useState("today");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [goalEditing, setGoalEditing] = useState(false);
  const [goalText, setGoalText] = useState("");
  
  const [expandedId, setExpandedId] = useState(null);
 
  const addScale = useRef(new Animated.Value(1)).current;

  const list = items || [];
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);


  const minsOf = (it) => (it.minutes != null ? it.minutes : parseMinutes(it.text)) || 0;

  const walkMinsToday = list
    .filter((it) => it.tag === "Walk" && it.createdAt && new Date(it.createdAt) >= startOfToday)
    .reduce((sum, it) => sum + minsOf(it), 0);


  const activeDays = new Set(list.filter((it) => it.createdAt).map((it) => dateKey(new Date(it.createdAt))));
  let streak = 0;
  {
    const cursor = new Date(startOfToday);
    if (!activeDays.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
    while (activeDays.has(dateKey(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
  }


  const chartData = (() => {
    // กรองตามหมวดหมู่ที่เลือก ("all" = รวมทุกกิจกรรม)
    const scoped = chartTag === "all" ? list : list.filter((it) => it.tag === chartTag);
    if (chartPeriod === "week") {
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startOfToday);
        d.setDate(d.getDate() - (6 - i));
        const value = scoped
          .filter((it) => it.createdAt && isSameDate(new Date(it.createdAt), d))
          .reduce((sum, it) => sum + minsOf(it), 0);
        return { label: WEEKDAY_LABELS[d.getDay()], value, dateLabel: formatGregorianShort(d) };
      });
    }

    // โหมดเดือน: แท่งรายเดือน 6 เดือนล่าสุด เรียงจากเก่าไปใหม่
    return Array.from({ length: 6 }, (_, i) => {
      const monthsBack = 5 - i;
      const start = new Date(startOfToday.getFullYear(), startOfToday.getMonth() - monthsBack, 1);
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
      const value = scoped
        .filter((it) => it.createdAt && new Date(it.createdAt) >= start && new Date(it.createdAt) < end)
        .reduce((sum, it) => sum + minsOf(it), 0);
      return {
        label: MONTH_ABBR[start.getMonth()],
        value,
        dateLabel: `${MONTH_NAMES[start.getMonth()]} ${start.getFullYear()}`,
      };
    });
  })();
  const chartTodayIndex = chartPeriod === "week" ? 6 : 5;

  //สถิติตามช่วงกราฟ
  const chartCutoff = new Date(startOfToday);
  if (chartPeriod === "week") {
    chartCutoff.setDate(chartCutoff.getDate() - 6);
  } else {
    chartCutoff.setMonth(chartCutoff.getMonth() - 5);
    chartCutoff.setDate(1);
  }
  const inPeriod = list.filter((it) => it.createdAt && new Date(it.createdAt) >= chartCutoff);
  const walkCount = inPeriod.filter((it) => it.tag === "Walk").length;
  const playItems = inPeriod.filter((it) => it.tag === "Play");
  const avgPlay = playItems.length
    ? Math.round(playItems.reduce((sum, it) => sum + minsOf(it), 0) / playItems.length)
    : 0;
 
  const avgPlaySplit = minsSplit(avgPlay);
  const totalActive = chartData.reduce((s, d) => s + d.value, 0);
  const totalActiveSplit = minsSplit(totalActive);

  //  ลิสต์รายการ 
  const days = PERIODS.find((p) => p.key === period)?.days || 1;
  const cutoff = new Date(startOfToday);
  cutoff.setDate(cutoff.getDate() - (days - 1));
  const filtered = list.filter((it) => it.createdAt && new Date(it.createdAt) >= cutoff);
  const dayGroups = [...filtered]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .reduce((acc, it) => {
      const d = new Date(it.createdAt);
      const key = dateKey(d);
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

  const handleAdd = () => {
    if (!text.trim()) return;
    onAdd(activePet.id, {
      id: `${Date.now()}`,
      text: text.trim(),
      tag: activeTag,
      minutes: parseMinutes(text),
      createdAt: new Date(),
    });
    setText("");
    addScale.setValue(0.88);
    Animated.spring(addScale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 8 }).start();
  };

  const startEdit = (it) => {
    setEditingId(it.id);
    setEditText(it.text);
  };

  const saveEdit = () => {
    if (!editText.trim()) return;
    onEdit(activePet.id, editingId, { text: editText.trim(), minutes: parseMinutes(editText) });
    setEditingId(null);
  };

  const saveGoal = () => {
    const g = parseInt(goalText, 10);
    if (!isNaN(g) && g > 0) onSetGoal(activePet.id, g);
    setGoalEditing(false);
  };

  const handleDelete = (it) => {
    confirmDelete({
      title: "ลบรายการนี้?",
      message: `"${it.text}" จะถูกลบออกจากบันทึกกิจกรรม`,
      onConfirm: () => onRemove(activePet.id, it.id),
    });
  };

  const exactTime = (it) => {
    const d = new Date(it.createdAt);
    return `${formatGregorianShort(d)} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
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
          <IconButton icon="check" color={CAT.accentDeep} accessibilityLabel="บันทึกการแก้ไข" onPress={saveEdit} />
          <IconButton icon="x" color={colors.textBody} accessibilityLabel="ยกเลิกการแก้ไข" onPress={() => setEditingId(null)} />
        </Card>
      </Reveal>
    ) : (
      <Reveal key={it.id}>
        <Card style={[glassCard, styles.row]}>
          <View style={[styles.dot, { backgroundColor: TAG_DOT[it.tag] || CAT.accentDeep }]} />
          <Pressable
            style={{ flex: 1, marginLeft: 10 }}
            accessibilityRole="button"
            accessibilityLabel={`รายการกิจกรรม: ${it.text}. แตะเพื่อสลับเวลาแบบเต็ม`}
            onPress={() => setExpandedId((prev) => (prev === it.id ? null : it.id))}
            onLongPress={() => setExpandedId((prev) => (prev === it.id ? null : it.id))}
          >
            <AppText style={styles.rowTitle}>{it.text}</AppText>
            <AppText style={styles.rowSub}>
              {[
                tagLabelOf(it.tag),
                it.createdAt ? (expandedId === it.id ? exactTime(it) : timeAgo(new Date(it.createdAt))) : null,
              ].filter(Boolean).join(" · ")}
            </AppText>
          </Pressable>
          {minsOf(it) > 0 && (
            <View style={styles.minsPill}>
              <AppText style={styles.minsText}>{minutesLabel(minsOf(it))}</AppText>
            </View>
          )}
          {onEdit && (
            <IconButton icon="edit-2" size={16} color={colors.brown} accessibilityLabel="แก้ไขรายการ" onPress={() => startEdit(it)} />
          )}
          <IconButton icon="trash-2" size={16} color="#B23A22" accessibilityLabel="ลบรายการ" onPress={() => handleDelete(it)} />
        </Card>
      </Reveal>
    );

  const reminderOn = walkReminder?.on ?? true;
  const reminderHour = walkReminder?.hour ?? DEFAULT_WALK_REMINDER_HOUR;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <AnimatedScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          <LinearGradient colors={CAT.grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
            <Pressable onPress={() => go("petProfile")} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="กลับไปหน้าโปรไฟล์สัตว์เลี้ยง">
              <Feather name="chevron-left" size={22} color={colors.textDark} />
            </Pressable>
            <AppText style={styles.headerTitle}>กิจกรรม · {activePet.name}</AppText>
            <View style={[styles.countPill, { backgroundColor: streak > 0 ? CAT.accentDeep : colors.textBody }]}>
              <Flame size={12} color="#FFFFFF" />
              <AppText style={styles.countText}>ต่อเนื่อง {streak} วัน</AppText>
            </View>
          </LinearGradient>


          <Reveal>
            <Card style={[glassCardStrong, styles.goalCard]}>
              <View style={styles.goalRow}>
                <View style={[styles.summaryIcon, { backgroundColor: CAT.soft }]}>
                  <Feather name="target" size={18} color={CAT.accentDeep} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <AppText style={styles.summaryLabel}>
                    วันนี้เดินแล้ว {minutesLabel(walkMinsToday)}
                  </AppText>
                  <AppText style={styles.summarySub}>จากเป้าหมายเดินอย่างน้อย {goal} นาที</AppText>
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
                      accessibilityLabel="เป้าหมายเดินรายวัน (นาที)"
                    />
                    <AppText style={styles.goalUnit}>นาที</AppText>
                    <IconButton icon="check" size={16} color={CAT.accentDeep} accessibilityLabel="บันทึกเป้าหมาย" onPress={saveGoal} />
                  </View>
                ) : (
                  <Pressable
                    onPress={() => { setGoalText(String(goal)); setGoalEditing(true); }}
                    style={styles.goalPill}
                    accessibilityRole="button"
                    accessibilityLabel={`แก้ไขเป้าหมายรายวัน ปัจจุบัน ${goal} นาที`}
                  >
                    <Feather name="edit-2" size={11} color="#FFFFFF" />
                    <AppText style={styles.goalPillText}>เป้า {goal} นาที</AppText>
                    <AppText style={styles.goalEditLabel}>แก้ไข</AppText>
                  </Pressable>
                )}
              </View>
              <ProgressBar value={walkMinsToday} max={goal} unit=" นาที" accent={CAT.accentDeep} />
            </Card>
          </Reveal>

          <Reveal>
            <Card style={[glassCard, styles.chartCard]}>
              <AppText style={styles.sectionLabel}>กราฟกิจกรรม</AppText>
              <View style={styles.chipsRowInner}>
                {CHART_PERIODS.map((p) => {
                  const active = chartPeriod === p.key;
                  return (
                    <Pressable
                      key={p.key}
                      onPress={() => setChartPeriod(p.key)}
                      style={[styles.chip, active ? styles.chipActive : styles.chipGlass]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      accessibilityLabel={`ช่วงกราฟ: ${p.label}`}
                    >
                      <AppText style={[styles.chipText, { color: active ? "#FFFFFF" : colors.textDark, fontWeight: active ? "600" : "400" }]}>
                        {p.label}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
              <AppText style={styles.filterLabel}>หมวดหมู่</AppText>
              <View style={styles.chipsRowInner}>
                <Pressable
                  onPress={() => setChartTag("all")}
                  style={[styles.chip, chartTag === "all" ? styles.chipActive : styles.chipGlass]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: chartTag === "all" }}
                  accessibilityLabel="กราฟทุกกิจกรรมรวมกัน"
                >
                  <View style={styles.chipInner}>
                    <Feather name="layers" size={13} color={chartTag === "all" ? "#FFFFFF" : colors.textDark} />
                    <AppText style={[styles.chipText, { color: chartTag === "all" ? "#FFFFFF" : colors.textDark, fontWeight: chartTag === "all" ? "600" : "400" }]}>
                      ทั้งหมด
                    </AppText>
                  </View>
                </Pressable>
                {CAT.tags.map((t) => {
                  const active = chartTag === t.key;
                  return (
                    <Pressable
                      key={t.key}
                      onPress={() => setChartTag(t.key)}
                      style={[styles.chip, active ? styles.chipActive : styles.chipGlass]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      accessibilityLabel={`กราฟกิจกรรม: ${t.label}`}
                    >
                      <View style={styles.chipInner}>
                        <t.Icon size={13} color={active ? "#FFFFFF" : colors.textDark} />
                        <AppText style={[styles.chipText, { color: active ? "#FFFFFF" : colors.textDark, fontWeight: active ? "600" : "400" }]}>
                          {t.label}
                        </AppText>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
              <SimpleBarChart data={chartData} accent={CAT.accentDeep} unit=" นาที" todayIndex={chartTodayIndex} />
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <AppText style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                    {walkCount}
                  </AppText>
                  <AppText style={styles.statLabel}>ครั้งที่เดิน</AppText>
                </View>
                <View style={styles.statBox}>
                  <AppText style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                    {avgPlaySplit.main}
                  </AppText>
                  {avgPlaySplit.sub && <AppText style={styles.statValueSub}>{avgPlaySplit.sub}</AppText>}
                  <AppText style={styles.statLabel}>เล่นเฉลี่ย</AppText>
                </View>
                <View style={styles.statBox}>
                  <AppText style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                    {totalActiveSplit.main}
                  </AppText>
                  {totalActiveSplit.sub && <AppText style={styles.statValueSub}>{totalActiveSplit.sub}</AppText>}
                  <AppText style={styles.statLabel}>รวมทั้งหมด</AppText>
                </View>
              </View>
            </Card>
          </Reveal>

          <Reveal>
            <Card style={[glassCard, styles.reminderCard]}>
              <View style={styles.goalRow}>
                <View style={[styles.summaryIcon, { backgroundColor: CAT.soft }]}>
                  <Feather name="bell" size={18} color={CAT.accentDeep} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <AppText style={styles.summaryLabel}>แจ้งเตือนเดินเล่นประจำวัน</AppText>
                  <AppText style={styles.summarySub}>
                    {reminderOn
                      ? `แจ้งเตือน ${String(reminderHour).padStart(2, "0")}:00 ถ้าวันนี้ยังไม่ได้เดิน`
                      : "ปิดการแจ้งเตือนอยู่"}
                  </AppText>
                </View>
                <Switch
                  value={reminderOn}
                  onValueChange={(v) => onSetWalkReminder(activePet.id, { on: v })}
                  trackColor={{ true: CAT.accentDeep, false: "rgba(90,52,25,0.2)" }}
                  thumbColor="#FFFFFF"
                  accessibilityLabel="เปิด/ปิดแจ้งเตือนเดินเล่นรายวัน"
                />
              </View>
              {reminderOn && (
                <View style={styles.chipsRowInner}>
                  {WALK_REMINDER_HOUR_OPTIONS.map((h) => {
                    const active = reminderHour === h;
                    return (
                      <Pressable
                        key={h}
                        onPress={() => onSetWalkReminder(activePet.id, { hour: h })}
                        style={[styles.chip, active ? styles.chipActive : styles.chipGlass]}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        accessibilityLabel={`ตั้งเวลาแจ้งเตือนเดินเล่น ${h}:00`}
                      >
                        <AppText style={[styles.chipText, { color: active ? "#FFFFFF" : colors.textDark, fontWeight: active ? "600" : "400" }]}>
                          {String(h).padStart(2, "0")}:00
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </Card>
          </Reveal>

          <Reveal>
            <Card style={[glassCard, styles.inputCard]}>
              <View style={styles.inputRow}>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.input}
                    value={text}
                    onChangeText={setText}
                    placeholder="เช่น เดินเล่นในสวน 30 นาที"
                    placeholderTextColor={colors.textGray}
                    onSubmitEditing={handleAdd}
                    accessibilityLabel="รายละเอียดกิจกรรมใหม่"
                  />
                </View>
        
                <Animated.View style={{ transform: [{ scale: addScale }] }}>
                  <Pressable
                    onPress={handleAdd}
                    style={styles.addBtn}
                    accessibilityRole="button"
                    accessibilityLabel="บันทึกรายการกิจกรรมนี้"
                  >
                    <Feather name="plus" size={16} color="#FFFFFF" />
                    <AppText style={styles.addBtnText}>บันทึก</AppText>
                  </Pressable>
                </Animated.View>
              </View>
              <AppText style={styles.sectionLabel}>หมวดหมู่</AppText>
              <View style={styles.chipsRowInner}>
                {CAT.tags.map((t) => {
                  const active = activeTag === t.key;
                  return (
                    <Pressable
                      key={t.key}
                      onPress={() => setActiveTag(t.key)}
                      style={[styles.chip, active ? styles.chipActive : styles.chipGlass]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      accessibilityLabel={`หมวดหมู่กิจกรรม: ${t.label}`}
                    >
                      <View style={styles.chipInner}>
                        <t.Icon size={13} color={active ? "#FFFFFF" : colors.textDark} />
                        <AppText style={[styles.chipText, { color: active ? "#FFFFFF" : colors.textDark, fontWeight: active ? "600" : "400" }]}>
                          {t.label}
                        </AppText>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </Card>
          </Reveal>

          <View style={styles.listHeader}>
            <AppText style={styles.sectionLabel}>บันทึกกิจกรรม</AppText>
            <View style={styles.chipsRowInner}>
              {PERIODS.map((p) => {
                const active = period === p.key;
                return (
                  <Pressable
                    key={p.key}
                    onPress={() => setPeriod(p.key)}
                    style={[styles.chip, active ? styles.chipActive : styles.chipGlass]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={`ช่วงบันทึก: ${p.label}`}
                  >
                    <AppText style={[styles.chipText, { color: active ? "#FFFFFF" : colors.textDark, fontWeight: active ? "600" : "400" }]}>
                      {p.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <PawPrint size={64} color={CAT.accentDeep} strokeWidth={1.6} style={styles.emptyIcon} />
              <AppText style={styles.emptyTitle}>
                {period === "today" ? CAT.emptyTitle : `ไม่มีกิจกรรมใน ${days} วันที่ผ่านมา`}
              </AppText>
              <AppText style={styles.emptySub}>{CAT.emptySub}</AppText>
            </View>
          ) : (
            <View style={styles.listWrap}>
              {dayGroups.map((g) => (
                <View key={g.key}>
                  <AppText style={styles.dayHeader}>{dayLabel(g.date)}</AppText>
                  {g.items.map(renderRow)}
                </View>
              ))}
            </View>
          )}

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
  countPill: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, ...shadow },
  countText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },

  goalCard: { marginHorizontal: 20, marginTop: 16, padding: 14 },
  chartCard: { marginHorizontal: 20, marginTop: 14, padding: 14 },
  reminderCard: { marginHorizontal: 20, marginTop: 14, padding: 14 },
  inputCard: { marginHorizontal: 20, marginTop: 14, padding: 14 },
  listHeader: { marginHorizontal: 20, marginTop: 16 },

  sectionLabel: {
    fontSize: 12, fontWeight: "700", color: colors.textBody,
    marginBottom: 8, letterSpacing: 0.3,
  },
  filterLabel: {
    fontSize: 11, fontWeight: "600", color: colors.textBody,
    marginTop: 10, marginBottom: 6, letterSpacing: 0.3,
  },

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
  goalUnit: { fontSize: 13, fontWeight: "700", color: colors.textBody },
  summaryIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  summaryLabel: { fontSize: 14, fontWeight: "700", color: colors.textDark },
  summarySub: { fontSize: 12, fontWeight: "400", color: colors.textBody, marginTop: 2 },

  statsRow: { flexDirection: "row", gap: 10, marginTop: 6 },
  statBox: {
    flex: 1, alignItems: "center", paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.6)", borderRadius: 14,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.6)",
  },
  statValue: { fontSize: 17, fontWeight: "700", color: colors.textDark },
  statValueSub: { fontSize: 12, fontWeight: "600", color: colors.textBody },
  statLabel: { fontSize: 12, fontWeight: "400", color: colors.textBody, marginTop: 2 },

  inputRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 },
  inputWrap: {
    flex: 1,
    height: 50,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  input: { fontSize: 15, color: colors.textDark, fontFamily: "BaiJamjuree_400Regular" },
  addBtn: {
    height: 50, paddingHorizontal: 14, borderRadius: 14,
    backgroundColor: CAT.accentDeep, alignItems: "center", justifyContent: "center",
    flexDirection: "row", gap: 4, ...shadow,
  },
  addBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },

  chipsRowInner: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  chipInner: { flexDirection: "row", alignItems: "center", gap: 5 },
  chipGlass: {
    backgroundColor: "rgba(255,255,255,0.6)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
  },
  chipActive: { backgroundColor: CAT.accentDeep },
  chipText: { fontSize: 13, fontWeight: "600" },

  empty: { alignItems: "center", paddingVertical: 50 },
  emptyIcon: { marginBottom: 14 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: colors.textDark, marginBottom: 6 },
  emptySub: { fontSize: 13, fontWeight: "400", color: colors.textBody, textAlign: "center", maxWidth: 240 },

  listWrap: { marginTop: 12, paddingHorizontal: 20 },
  dayHeader: { fontSize: 13, fontWeight: "700", color: colors.textBody, marginBottom: 10, marginTop: 4 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 12, paddingVertical: 10 },
  editInput: { flex: 1, fontSize: 15, color: colors.textDark, fontFamily: "BaiJamjuree_400Regular", paddingVertical: 4, marginRight: 4 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  rowTitle: { fontSize: 15, fontWeight: "600", color: colors.textDark },
  rowSub: { fontSize: 12, fontWeight: "400", color: colors.textBody, marginTop: 2 },
  minsPill: { backgroundColor: CAT.soft, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, marginRight: 2 },
  minsText: { fontSize: 12, fontWeight: "700", color: colors.textDark },

  footer: { fontSize: 12, fontWeight: "400", color: colors.textBody, textAlign: "center", marginTop: 18 },
});

export default ActivityScreen;
