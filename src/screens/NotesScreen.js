/** หน้า Notes*/
import { useState } from "react";
import { SafeAreaView, View, TextInput, Pressable, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

import Card from "../components/Card";
import AppText from "../components/AppText";
import IconButton from "../components/IconButton";
import { colors, shadow } from "../theme";
import { timeAgo, formatGregorianShort } from "../utils/date";
import { NOTE_CATEGORIES, NOTE_REMINDER_OPTIONS } from "../data/constants";
import { takePhoto, choosePhoto } from "../utils/photo";
import { confirmDelete } from "../utils/confirm";
import AnimatedScrollView from "../components/AnimatedScrollView";
import Reveal from "../components/Reveal";

const CAT = {
  accent: "#C97B5A",
  accentDeep: "#A8552E",
  soft: "#F5E0CF", grad: ["#F3D9C2", "#F5E0CF"],
  emptyTitle: "ยังไม่มีโน้ต",
  footer: "ปักหมุดโน้ตสำคัญ (เช่น เรื่องแพ้อาหาร) ให้อยู่บนสุดเสมอ",
};


const FILTERS = [{ key: "All", label: "ทั้งหมด" }, ...NOTE_CATEGORIES];

const catOf = (key) => NOTE_CATEGORIES.find((c) => c.key === key);


function reminderDateFromOption(opt) {
  const d = new Date();
  if (opt.special === "tomorrow9") {
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
  } else {
    d.setHours(d.getHours() + opt.hoursFromNow);
  }
  return d;
}

function NotesScreen({ go, activePet, items, onAdd, onEdit, onRemove }) {
  const [text, setText] = useState("");
  const [activeCategory, setActiveCategory] = useState(NOTE_CATEGORIES[0].key);
  const [filter, setFilter] = useState("All");
  const [pendingPhoto, setPendingPhoto] = useState(null);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [pendingReminder, setPendingReminder] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const list = items || [];
  const filterLabel = FILTERS.find((f) => f.key === filter)?.label || filter;


  const visible = list
    .filter((it) => filter === "All" || it.category === filter)
    .sort((a, b) => {
      if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const handleAdd = () => {
    if (!text.trim()) return;
    onAdd(activePet.id, {
      id: `${Date.now()}`,
      text: text.trim(),
      category: activeCategory,
      photo: pendingPhoto,
      reminderAt: pendingReminder?.date || null,
      createdAt: new Date(),
    });
    setText("");
    setPendingPhoto(null);
    setPendingReminder(null);
    setReminderOpen(false);
  };

  const handlePhoto = async (mode) => {
    const uri = mode === "camera" ? await takePhoto() : await choosePhoto();
    if (uri) setPendingPhoto(uri);
  };

  const togglePin = (it) => onEdit(activePet.id, it.id, { pinned: !it.pinned });

  const startEdit = (it) => {
    setEditingId(it.id);
    setEditText(it.text);
  };

  const saveEdit = () => {
    if (!editText.trim()) return;
    onEdit(activePet.id, editingId, { text: editText.trim() });
    setEditingId(null);
  };

  const handleDelete = (it) => {
    confirmDelete({
      title: "ลบโน้ตนี้?",
      message: `"${it.text}" จะถูกลบอย่างถาวร`,
      onConfirm: () => onRemove(activePet.id, it.id),
    });
  };

  const reminderLabel = (d) =>
    `${formatGregorianShort(d)} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

  const renderRow = (it) =>
    editingId === it.id ? (
      <Reveal key={it.id}>
        <Card style={styles.row}>
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
        <Card style={[styles.row, it.pinned && styles.rowPinned]}>
          {it.photo ? (
            <Image source={{ uri: it.photo }} style={styles.thumb} />
          ) : (
            <View style={styles.catIconWrap}>
              <Feather name={catOf(it.category)?.icon || "file-text"} size={18} color={CAT.accentDeep} />
            </View>
          )}
          <View style={{ flex: 1, marginLeft: 10 }}>
            <AppText style={styles.rowTitle} numberOfLines={2}>{it.text}</AppText>
            <AppText style={styles.rowSub} numberOfLines={1}>
              {[
                catOf(it.category)?.label || it.category,
                it.createdAt ? timeAgo(new Date(it.createdAt)) : null,
                it.reminderAt ? `แจ้งเตือน · ${reminderLabel(new Date(it.reminderAt))}` : null,
              ].filter(Boolean).join(" · ")}
            </AppText>
          </View>
          <IconButton
            icon="bookmark"
            color={it.pinned ? CAT.accentDeep : colors.textBody}
            accessibilityLabel={it.pinned ? "เลิกปักหมุดโน้ต" : "ปักหมุดโน้ตนี้ไว้บนสุด"}
            onPress={() => togglePin(it)}
          />
          {onEdit && (
            <IconButton icon="edit-2" color={colors.brown} accessibilityLabel="แก้ไขโน้ต" onPress={() => startEdit(it)} />
          )}
          <IconButton icon="trash-2" color="#B23A22" style={styles.deleteBtn} accessibilityLabel="ลบโน้ต" onPress={() => handleDelete(it)} />
        </Card>
      </Reveal>
    );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <AnimatedScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          <LinearGradient colors={CAT.grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
            <Pressable onPress={() => go("petProfile")} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="กลับไปหน้าโปรไฟล์สัตว์เลี้ยง">
              <Feather name="chevron-left" size={22} color={colors.textDark} />
            </Pressable>
            <AppText style={styles.headerTitle}>โน้ต · {activePet.name}</AppText>
            <View style={styles.countPill}>
              <AppText style={styles.countText}>{list.length} โน้ต</AppText>
            </View>
          </LinearGradient>

          <Reveal>
            <Card style={styles.composerCard}>
              <View style={styles.inputRow}>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.input}
                    value={text}
                    onChangeText={setText}
                    placeholder="เช่น แพ้เนื้อไก่"
                    placeholderTextColor={colors.textGray}
                    onSubmitEditing={handleAdd}
                    accessibilityLabel="ข้อความโน้ตใหม่"
                  />
                </View>
                <Pressable
                  onPress={handleAdd}
                  style={styles.addBtn}
                  accessibilityRole="button"
                  accessibilityLabel="เพิ่มโน้ตนี้"
                >
                  <Feather name="plus" size={14} color="#FFFFFF" />
                  <AppText style={styles.addBtnText}>เพิ่ม</AppText>
                </Pressable>
              </View>

              <View style={styles.toolRow}>
                <IconButton icon="camera" size={16} color={CAT.accentDeep} accessibilityLabel="ถ่ายรูป" onPress={() => handlePhoto("camera")} />
                <IconButton icon="image" size={16} color={CAT.accentDeep} accessibilityLabel="เลือกรูปจากคลังภาพ" onPress={() => handlePhoto("gallery")} />
                <Pressable
                  onPress={() => setReminderOpen((v) => !v)}
                  style={[styles.reminderChip, (pendingReminder || reminderOpen) && styles.reminderChipActive]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: !!pendingReminder }}
                  accessibilityLabel="ตั้งเวลาแจ้งเตือนสำหรับโน้ตนี้"
                >
                  <Feather name="bell" size={13} color={pendingReminder || reminderOpen ? "#FFFFFF" : CAT.accentDeep} />
                  <AppText style={[styles.reminderChipText, (pendingReminder || reminderOpen) && { color: "#FFFFFF" }]}>
                    {pendingReminder ? `แจ้งเตือน · ${NOTE_REMINDER_OPTIONS.find((o) => o.key === pendingReminder.optKey)?.label}` : "แจ้งเตือน"}
                  </AppText>
                </Pressable>
              </View>

              {(pendingPhoto || pendingReminder) && (
                <View style={styles.previewRow}>
                  {pendingPhoto && (
                    <View style={styles.previewWrap}>
                      <Image source={{ uri: pendingPhoto }} style={styles.pendingThumb} />
                      <Pressable onPress={() => setPendingPhoto(null)} style={styles.previewRemove} accessibilityRole="button" accessibilityLabel="เอารูปที่แนบออก">
                        <Feather name="x" size={13} color="#FFFFFF" />
                      </Pressable>
                    </View>
                  )}
                  {pendingReminder && (
                    <View style={styles.previewHintRow}>
                      <Feather name="bell" size={13} color={colors.textBody} />
                      <AppText style={styles.previewHint}>{reminderLabel(pendingReminder.date)}</AppText>
                    </View>
                  )}
                </View>
              )}

              {reminderOpen && (
                <View style={styles.quickRow}>
                  {NOTE_REMINDER_OPTIONS.map((opt) => {
                    const active = pendingReminder?.optKey === opt.key;
                    return (
                      <Pressable
                        key={opt.key}
                        onPress={() =>
                          setPendingReminder((prev) =>
                            prev?.optKey === opt.key ? null : { optKey: opt.key, date: reminderDateFromOption(opt) }
                          )
                        }
                        style={[styles.quickChip, active ? styles.chipActive : styles.chipGlass]}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        accessibilityLabel={`ตั้งแจ้งเตือน${opt.label}`}
                      >
                        <AppText style={[styles.quickChipText, { color: active ? "#FFFFFF" : colors.textDark, fontWeight: active ? "600" : "400" }]}>
                          {opt.label}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              )}

              <AppText style={styles.composerLabel}>หมวดหมู่</AppText>
              <View style={styles.quickRow}>
                {NOTE_CATEGORIES.map((c) => {
                  const active = activeCategory === c.key;
                  return (
                    <Pressable
                      key={c.key}
                      onPress={() => setActiveCategory(c.key)}
                      style={[styles.quickChip, active ? styles.chipActive : styles.chipGlass]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      accessibilityLabel={`หมวดหมู่โน้ตใหม่: ${c.label}`}
                    >
                      <AppText style={[styles.quickChipText, { color: active ? "#FFFFFF" : colors.textDark, fontWeight: active ? "600" : "400" }]}>
                        {c.label}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </Card>
          </Reveal>

          <View style={styles.listHeader}>
            <AppText style={styles.sectionLabel}>กรอง</AppText>
            <View style={styles.quickRow}>
              {FILTERS.map((f) => {
                const active = filter === f.key;
                return (
                  <Pressable
                    key={f.key}
                    onPress={() => setFilter(f.key)}
                    style={[styles.quickChip, active ? styles.chipActive : styles.chipGlass]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={`กรองโน้ต: ${f.label}`}
                  >
                    <AppText style={[styles.quickChipText, { color: active ? "#FFFFFF" : colors.textDark, fontWeight: active ? "600" : "400" }]}>
                      {f.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {visible.length === 0 ? (
            <Reveal>
              <Card style={styles.emptyCard}>
                <View style={styles.emptyCircle}>
                  <Feather name="file-text" size={44} color={CAT.accentDeep} strokeWidth={1.8} />
                </View>
                <AppText style={styles.emptyTitle}>
                  {filter === "All" ? CAT.emptyTitle : `ยังไม่มีโน้ตหมวด${filterLabel}`}
                </AppText>
                <AppText style={styles.emptySub}>
                  {filter === "All"
                    ? "เพิ่มเรื่องแพ้อาหาร นิสัย นัดหมาย หรือเรื่องที่อยากจดจำ — ปักหมุดเรื่องสำคัญให้อยู่บนสุด"
                    : `แตะ "${filterLabel}" ในแถวหมวดหมู่ด้านบนเพื่อเพิ่มโน้ตแรกของคุณ`}
                </AppText>
              </Card>
            </Reveal>
          ) : (
            <View style={styles.listWrap}>{visible.map(renderRow)}</View>
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
  countPill: { backgroundColor: CAT.accentDeep, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, ...shadow },
  countText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },

  composerCard: { marginHorizontal: 20, marginTop: 16, padding: 14 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  inputWrap: {
    flex: 1,
    height: 48,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  input: { fontSize: 15, color: colors.textDark, fontFamily: "BaiJamjuree_400Regular" },
  addBtn: {
    height: 48, paddingHorizontal: 14, borderRadius: 14,
    backgroundColor: CAT.accentDeep, alignItems: "center", justifyContent: "center",
    flexDirection: "row", gap: 4, ...shadow,
  },
  addBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },

  toolRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
  reminderChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(255,255,255,0.6)", borderWidth: 1, borderColor: "rgba(255,255,255,0.6)",
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8,
  },
  reminderChipActive: { backgroundColor: CAT.accentDeep, borderColor: CAT.accentDeep },
  reminderChipText: { fontSize: 12, fontWeight: "600", color: colors.textDark },

  previewRow: { flexDirection: "row", alignItems: "center", marginTop: 10, gap: 10 },
  previewWrap: { width: 54, height: 54 },
  previewRemove: {
    position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: 10,
    backgroundColor: "#B23A22", alignItems: "center", justifyContent: "center",
  },
  previewHintRow: { flex: 1, flexDirection: "row", alignItems: "center", gap: 5 },
  previewHint: { flex: 1, fontSize: 12, fontWeight: "400", color: colors.textBody },
  pendingThumb: { width: 54, height: 54, borderRadius: 12 },

  composerLabel: {
    fontSize: 12, fontWeight: "600", color: colors.textBody,
    marginTop: 12, marginBottom: 8, letterSpacing: 0.3,
  },
  sectionLabel: {
    fontSize: 12, fontWeight: "600", color: colors.textBody,
    marginBottom: 8, letterSpacing: 0.3,
  },
  quickRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  quickChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  quickChipText: { fontSize: 13, fontWeight: "600" },
  chipGlass: {
    backgroundColor: "rgba(255,255,255,0.6)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
  },
  chipActive: { backgroundColor: CAT.accentDeep },

  listHeader: { marginHorizontal: 20, marginTop: 16 },

  emptyCard: { marginHorizontal: 20, marginTop: 14, paddingVertical: 28, paddingHorizontal: 20, alignItems: "center" },
  emptyCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: CAT.soft, alignItems: "center", justifyContent: "center", marginBottom: 14,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: colors.textDark, marginBottom: 8, textAlign: "center" },
  emptySub: { fontSize: 13, fontWeight: "400", color: colors.textBody, textAlign: "center", maxWidth: 260, lineHeight: 20 },

  listWrap: { marginTop: 14, paddingHorizontal: 20 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 12, paddingVertical: 10 },
  rowPinned: { borderColor: "rgba(168,85,46,0.8)", borderWidth: 1.5 },
  editInput: { flex: 1, fontSize: 15, color: colors.textDark, fontFamily: "BaiJamjuree_400Regular", paddingVertical: 4, marginRight: 4 },
  catIconWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: CAT.soft, alignItems: "center", justifyContent: "center" },
  thumb: { width: 40, height: 40, borderRadius: 12 },
  rowTitle: { fontSize: 15, fontWeight: "600", color: colors.textDark },
  rowSub: { fontSize: 12, fontWeight: "400", color: colors.textGray, marginTop: 2 },
  // ปุ่มลบห่างจากปุ่มแก้เพิ่มขึ้น — ลดโอกาสกดพลาด (บวกกับ confirm ก่อนลบ)
  deleteBtn: { marginLeft: 4 },

  footer: { fontSize: 12, fontWeight: "400", color: colors.textBody, textAlign: "center", marginTop: 18 },
});

export default NotesScreen;
