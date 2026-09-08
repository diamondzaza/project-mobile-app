/** หน้าจอบันทึกน้ำหนัก */
import { useState } from "react";
import { SafeAreaView, View, TextInput, Alert, StyleSheet } from "react-native";

import AppText from "../components/AppText";
import Header from "../components/Header";
import Card from "../components/Card";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import RealCalendar from "../calendar/RealCalendar";
import SimpleLineChart from "../calendar/SimpleLineChart";
import { Card as ShadCard, CardHeader, CardTitle, CardContent, Badge } from "../components/ui";
import { colors } from "../theme";
import { sharedStyles } from "../theme/sharedStyles";
import { formatGregorian } from "../utils/date";
import AnimatedScrollView from "../components/AnimatedScrollView";
import Reveal from "../components/Reveal";

function WeightScreen({ go, activePet, weightData, addWeightEntry }) {
  const data = (weightData[activePet.id] || [])
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const latestWeight = data.length ? data[data.length - 1].value : "—";
  const prevWeight = data.length > 1 ? data[data.length - 2].value : "—";
  const [newWeight, setNewWeight] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const trend =
    data.length > 1
      ? data[data.length - 1].value > data[data.length - 2].value
        ? "up"
        : data[data.length - 1].value < data[data.length - 2].value
        ? "down"
        : "steady"
      : null;

  const handleAdd = () => {
    const val = parseFloat(newWeight);
    if (isNaN(val) || val <= 0) {
      Alert.alert("น้ำหนักไม่ถูกต้อง", "กรุณากรอกตัวเลขที่มากกว่า 0");
      return;
    }
    addWeightEntry(activePet.id, val, selectedDate);
    setNewWeight("");
  };

  return (
    <SafeAreaView style={sharedStyles.container}>
      <Header title={`น้ำหนักของ ${activePet.name}`} onBack={() => go("petProfile")} />
      <AnimatedScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 30 }}>
        <Reveal>
          <Card style={{ marginBottom: 16 }}>
            <RealCalendar
              compact
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              markedDates={[new Date()]}
            />
          </Card>
        </Reveal>

        <Reveal>
          <ShadCard>
            <CardHeader>
              <View style={styles.titleRow}>
                <CardTitle>แนวโน้มน้ำหนัก (kg)</CardTitle>
                {trend && (
                  <Badge variant={trend === "up" ? "warning" : trend === "down" ? "success" : "secondary"}>
                    {trend === "up" ? "▲ เพิ่มขึ้น" : trend === "down" ? "▼ ลดลง" : "— คงที่"}
                  </Badge>
                )}
              </View>
            </CardHeader>
            <CardContent>
              {data.length > 0 ? (
                <SimpleLineChart data={data.map((e) => e.value)} healthyRange={activePet.healthyRange} />
              ) : (
                <EmptyState category="weight" />
              )}
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <AppText style={styles.latestLabel}>ปัจจุบัน</AppText>
                  <AppText style={styles.latestValue}>{latestWeight} kg</AppText>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <AppText style={styles.latestLabel}>ก่อนหน้า</AppText>
                  <AppText style={styles.prevValue}>{prevWeight} kg</AppText>
                </View>
              </View>
            </CardContent>
          </ShadCard>
        </Reveal>

        <Reveal>
          <ShadCard style={{ marginTop: 16 }}>
            <CardHeader>
              <CardTitle>บันทึกน้ำหนักวันที่ {formatGregorian(selectedDate)}</CardTitle>
            </CardHeader>
            <CardContent>
              <View style={[sharedStyles.inputWrap, { height: 44, marginBottom: 12 }]}>
                <TextInput
                  style={sharedStyles.input}
                  placeholder="เช่น 5.8"
                  placeholderTextColor={colors.textGray}
                  keyboardType="decimal-pad"
                  value={newWeight}
                  onChangeText={setNewWeight}
                />
              </View>
              <Button title="บันทึกน้ำหนัก" onPress={handleAdd} style={{ width: "100%" }} />
            </CardContent>
          </ShadCard>
        </Reveal>
      </AnimatedScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  statsRow: { flexDirection: "row", alignItems: "center", marginTop: 14 },
  statBox: { flex: 1, alignItems: "center" },
  statDivider: { width: 1, height: 38, backgroundColor: colors.border },
  latestLabel: { color: colors.textGray, fontSize: 13, fontWeight: "400", marginBottom: 4 },
  latestValue: { fontSize: 26, fontWeight: "700", color: colors.textDark },
  prevValue: { fontSize: 22, fontWeight: "500", color: colors.brown },
});

export default WeightScreen;
