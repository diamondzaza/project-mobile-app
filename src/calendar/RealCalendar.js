/** ปฏิทินรายเดือน**/
import { useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import AppText from "../components/AppText";

import { colors, radius } from "../theme";
import { MONTH_NAMES, WEEKDAY_LABELS } from "../data/constants";
import { isSameDate, formatGregorian } from "../utils/date";

function RealCalendar({ markedDates = [], onSelectDate, selectedDate, compact = false }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [expanded, setExpanded] = useState(false);


  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  const startWeekday = firstDayOfMonth.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };
  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };
  const goToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    onSelectDate && onSelectDate(new Date());
  };

  const isMarked = (d) => {
    if (!d) return false;
    const dateObj = new Date(viewYear, viewMonth, d);
    return markedDates.some((m) => isSameDate(m, dateObj));
  };
  const isToday = (d) => {
    if (!d) return false;
    return isSameDate(new Date(viewYear, viewMonth, d), today);
  };
  const isSelected = (d) => {
    if (!d || !selectedDate) return false;
    return isSameDate(new Date(viewYear, viewMonth, d), selectedDate);
  };

  const pillDate = selectedDate ? formatGregorian(selectedDate) : formatGregorian(today);

  const monthTable = (
    <View>
      <View style={styles.calHeaderRow}>
        <Pressable onPress={goPrevMonth} style={styles.calNavBtn}>
          <Feather name="chevron-left" size={20} color={colors.brown} />
        </Pressable>
        <Pressable onPress={goToday}>
          <AppText style={styles.monthLabel}>
            {MONTH_NAMES[viewMonth]} {viewYear}
          </AppText>
        </Pressable>
        <Pressable onPress={goNextMonth} style={styles.calNavBtn}>
          <Feather name="chevron-right" size={20} color={colors.brown} />
        </Pressable>
      </View>

      <View style={styles.calendarRow}>
        {WEEKDAY_LABELS.map((d, i) => (
          <AppText key={i} style={styles.dayLabel}>{d}</AppText>
        ))}
      </View>

      {Array.from({ length: cells.length / 7 }).map((_, rowIdx) => (
        <View key={rowIdx} style={styles.calendarRow}>
          {cells.slice(rowIdx * 7, rowIdx * 7 + 7).map((d, colIdx) => {
            if (d === null) {
              return <View key={colIdx} style={styles.dateCell} />;
            }
            const marked = isMarked(d);
            const today_ = isToday(d);
            const selected = isSelected(d);
            return (
              <Pressable
                key={colIdx}
                onPress={() => onSelectDate && onSelectDate(new Date(viewYear, viewMonth, d))}
                style={[
                  styles.dateCell,
                  marked && styles.dateActive,
                  today_ && !marked && !selected && styles.dateToday,
                  selected && styles.dateSelected,
                ]}
              >
                <AppText
                  style={[
                    styles.dateText,
                    (marked || selected) && { color: "#fff", fontWeight: "700" },
                    today_ && !marked && !selected && { color: colors.brown, fontWeight: "700" },
                  ]}
                >
                  {d}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      ))}

      <Pressable onPress={goToday} style={{ alignSelf: "center", marginTop: 8 }}>
        <AppText style={{ color: colors.textGray, fontSize: 12, fontWeight: "400", textDecorationLine: "underline" }}>
          วันนี้: {formatGregorian(today)}
        </AppText>
      </Pressable>
    </View>
  );

  return (
    <View>
      {compact && (
        <View style={styles.pillRow}>
          <View style={styles.datePill}>
            <Feather name="calendar" size={15} color={colors.brown} />
            <AppText style={styles.pillDateText}>{pillDate}</AppText>
          </View>
          <Pressable onPress={() => setExpanded((e) => !e)} style={styles.changeBtn}>
            <AppText style={styles.changeBtnText}>{expanded ? "เสร็จแล้ว" : "เปลี่ยน"}</AppText>
          </Pressable>
        </View>
      )}
      {(expanded || !compact) && monthTable}
    </View>
  );
}

const styles = StyleSheet.create({
  pillRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 },
  datePill: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.greenPastel, paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.full },
  pillDateText: { fontSize: 14, fontWeight: "700", color: colors.textDark },
  changeBtn: { backgroundColor: "#A8552E", paddingVertical: 8, paddingHorizontal: 16, borderRadius: radius.full },
  changeBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  calHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  calNavBtn: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: colors.cardTanBg },
  monthLabel: { fontWeight: "700", fontSize: 16, color: colors.textDark },
  calendarRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  dayLabel: { width: 32, textAlign: "center", fontSize: 13, fontWeight: "500", color: colors.textGray },
  dateCell: { width: 32, height: 32, borderRadius: radius.full, alignItems: "center", justifyContent: "center" },
  dateActive: { backgroundColor: "#A8552E" },
  dateToday: { borderWidth: 1.5, borderColor: colors.brown },
  dateSelected: { backgroundColor: colors.brown },
  dateText: { fontSize: 14, fontWeight: "400", color: colors.textDark },
});

export default RealCalendar;
