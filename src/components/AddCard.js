/** กรอบ add-form  */
import { View, StyleSheet } from "react-native";

import Card from "./Card";
import Button from "./Button";
import AppText from "./AppText";
import { colors } from "../theme";

export default function AddCard({ title, onSave, onCancel, saveLabel = "บันทึก", children }) {
  return (
    <Card style={styles.wrap}>
      <AppText style={styles.title}>{title}</AppText>
      {children}
      <View style={styles.actions}>
        <Button
          title="ยกเลิก"
          onPress={onCancel}
          style={[styles.btn, { backgroundColor: colors.cardTanBg, flex: 1 }]}
          textStyle={{ color: colors.textDark }}
        />
        <Button title={saveLabel} onPress={onSave} style={[styles.btn, { flex: 1 }]} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 16 },
  title: { fontWeight: "700", color: colors.textDark, marginBottom: 12 },
  actions: { flexDirection: "row", gap: 10, marginTop: 8 },
  btn: {},
});
