/** ช่องกรอก — compose จาก ui/Label + ui/Input (style ต้นทางอยู่ที่ ui เดียว) */
import { View, StyleSheet } from "react-native";

import { colors } from "../theme";
import AppText from "./AppText";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function Field({ label, hint, error, errorText, style, ...props }) {
  return (
    <View style={styles.wrap}>
      {label ? <Label>{label}</Label> : null}
      <Input style={style} error={error} {...props} />
      {hint ? <AppText style={styles.hint}>{hint}</AppText> : null}
      {error && errorText ? <AppText style={styles.errorText}>{errorText}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 18, width: "100%" },
  hint: { fontSize: 12, color: colors.textGray, marginTop: 6 },
  errorText: { fontSize: 12, color: colors.danger, marginTop: 6 },
});
