/** ระบบตัวอักษรกลาง: Kanit ทั้งไทย/ละติน — weight mapping จุดเดียว */
import { StyleSheet, Text } from "react-native";

const KANIT = {
  300: "Kanit_300Light",
  400: "Kanit_400Regular",
  500: "Kanit_500Medium",
  600: "Kanit_600SemiBold",
  700: "Kanit_700Bold",
};

function resolveWeight(value) {
  if (value === "bold") return 700;
  if (value === "normal") return 400;
  const n = typeof value === "number" ? value : parseInt(value, 10);
  if (!n || Number.isNaN(n)) return 400;
  if (n <= 350) return 300;
  if (n <= 450) return 400;
  if (n <= 550) return 500;
  if (n <= 650) return 600;
  return 700;
}

function collectText(node) {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(collectText).join("");
  if (typeof node === "object" && node.props) return collectText(node.props.children);
  return "";
}

export default function AppText({ style, children, ...rest }) {
  const flat = style ? StyleSheet.flatten(style) || {} : {};
  const weight = resolveWeight(flat.fontWeight);
  const fontFamily = KANIT[weight];
  // ขนาดต่ำสุด 12pt — ตัวอักษรเล็กกว่านี้อ่านยากบนมือถือ (เดิมมี 10.5/11/11.5 หลุดมาในบางหน้า)
  const fontSize = Math.max(12, flat.fontSize || 14);
  // สเกลมืออาชีพ: หัวข้อใหญ่ 1.3 / เนื้อความ 1.55
  const lineHeight = flat.lineHeight || Math.round(fontSize * (fontSize >= 18 ? 1.3 : 1.55));
  const { fontFamily: _ignored, fontWeight: _weight, ...restStyle } = flat;

  return (
    <Text {...rest} style={[restStyle, { fontFamily, lineHeight }]}>
      {children}
    </Text>
  );
}
