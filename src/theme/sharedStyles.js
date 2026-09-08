/** สไตล์ร่วมที่หลายหน้า/คอมโพเนนต์ใช้ซ้ำ */
import { StyleSheet } from "react-native";

import { colors, radius, glass, shadow } from "./index";


export const sharedStyles = StyleSheet.create({
  container: { flex: 1 },
  label: { fontSize: 14, color: colors.textBody, marginBottom: 8, fontWeight: "600" },
  inputWrap: {
    width: "100%",
    borderRadius: radius.md,
    paddingHorizontal: 16,
    height: 54,
    justifyContent: "center",
    ...glass.surface,
  },
  input: { fontSize: 16, color: colors.textDark, fontFamily: "BaiJamjuree_400Regular" },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 12, padding: 14, ...glass.surface },
  rowTitle: { fontSize: 16, fontWeight: "600", color: colors.textDark },
  rowDate: { fontSize: 13, fontWeight: "400", color: colors.textGray, marginTop: 4 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.45)",
    borderColor: "rgba(255,255,255,0.55)",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    ...shadow,
  },
});
