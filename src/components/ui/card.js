/** ui/Card */
import { View, StyleSheet } from "react-native";

import { radius, glass, colors } from "../../theme";
import AppText from "../AppText";


export function Card({ children, style, tan, ...props }) {
  return (
    <View
      style={[styles.card, tan ? glass.warm : null, style]}
      {...props}
    >
      {children}
    </View>
  );
}


export function CardHeader({ children, style }) {
  return <View style={[styles.header, style]}>{children}</View>;
}

export function CardTitle({ children, style }) {
  return <AppText style={[styles.title, style]}>{children}</AppText>;
}

export function CardDescription({ children, style }) {
  return <AppText style={[styles.desc, style]}>{children}</AppText>;
}


export function CardContent({ children, style }) {
  return <View style={[styles.content, style]}>{children}</View>;
}


export function CardFooter({ children, style }) {
  return <View style={[styles.footer, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    ...glass.surface,
  },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 16, fontWeight: "600", color: colors.textDark },
  desc: { fontSize: 13, fontWeight: "400", color: colors.textGray, marginTop: 2 },
  content: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8 },
  footer: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8, flexDirection: "row", gap: 10 },
});
