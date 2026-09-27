/** การ์ดหลัก — ครอบ ui/Card (แหล่งเดียวของแอป) โดยใส่ padding 16 ให้เหมือนพฤติกรรมเดิม */
import { StyleSheet } from "react-native";

import { Card as UICard } from "./ui/card";

export default function Card({ children, style, tan }) {
  return (
    <UICard tan={tan} style={[styles.card, style]}>
      {children}
    </UICard>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16 },
});
