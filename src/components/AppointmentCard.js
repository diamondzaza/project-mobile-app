/** การ์ดนัดหมาย **/
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { colors, category } from "../theme";
import { sharedStyles } from "../theme/sharedStyles";
import { formatDate } from "../utils/date";
import Card from "./Card";
import IconButton from "./IconButton";
import AppText from "./AppText";

export default function AppointmentCard({ data, petName, onDelete }) {
  return (
    <Card style={styles.apptCard}>
      <View style={[sharedStyles.iconWrap, { backgroundColor: category.appointments.soft }]}>
        <Feather name={data.icon} size={20} color={category.appointments.main} />
      </View>
      <View style={{ flex: 1, marginLeft: 14 }}>
        <AppText style={styles.apptTitle}>{data.title}</AppText>
        {petName ? <AppText style={styles.apptPet}>{petName}</AppText> : null}
        <View style={styles.apptSubRow}>
          <Feather name="map-pin" size={13} color={colors.textGray} />
          <AppText style={styles.apptSub}>{data.location}</AppText>
        </View>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <AppText style={styles.apptDate}>{formatDate(data.dateObj)}</AppText>
        <AppText style={styles.apptTime}>{data.time}</AppText>
      </View>
      {onDelete && (
        <IconButton icon="trash-2" color={colors.red} onPress={onDelete} style={{ marginLeft: 8 }} />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  apptCard: { flexDirection: "row", alignItems: "center", marginBottom: 14, paddingVertical: 14 },
  apptTitle: { fontSize: 16, fontWeight: "600", color: colors.textDark },
  apptPet: { fontSize: 12, fontWeight: "500", color: colors.textGray, marginTop: 2 },
  apptSubRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  apptSub: { fontSize: 13, fontWeight: "400", color: colors.textGray, flexShrink: 1 },
  apptDate: { fontSize: 14, fontWeight: "400", color: colors.brown },
  apptTime: { fontSize: 13, fontWeight: "400", color: colors.textGray, marginTop: 4 },
});
