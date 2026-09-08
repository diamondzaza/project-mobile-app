/** progress bar */
import { View, StyleSheet } from "react-native";

import { colors } from "../theme";
import AppText from "./AppText";

function ProgressBar({ value, max, accent = colors.greenDark, label, showNumbers = true, unit = "" }) {
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  const over = max > 0 && value > max;

  return (
    <View>
      {(label || showNumbers) && (
        <View style={styles.row}>
          {label ? <AppText style={styles.label}>{label}</AppText> : <View style={{ flex: 1 }} />}
          {showNumbers && (
            <AppText style={[styles.numbers, over && { color: colors.red }]}>
              {Math.round(value)}{unit} / {Math.round(max)}{unit}
            </AppText>
          )}
        </View>
      )}
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${Math.round(pct * 100)}%`, backgroundColor: over ? colors.red : accent },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  label: { fontSize: 13, fontWeight: "500", color: colors.textDark },
  numbers: { fontSize: 12, fontWeight: "700", color: colors.textGray },
  track: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.55)",
    borderColor: "rgba(255,255,255,0.6)",
    borderWidth: 1,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: 999 },
});

export default ProgressBar;
