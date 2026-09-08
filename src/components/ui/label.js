/** ui/Label*/
import { StyleSheet } from "react-native";

import { colors } from "../../theme";
import AppText from "../AppText";

export function Label({ children, style }) {
  return <AppText style={[styles.label, style]}>{children}</AppText>;
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    color: colors.textBody,
    marginBottom: 8,
    fontWeight: "600",
  },
});

export default Label;
