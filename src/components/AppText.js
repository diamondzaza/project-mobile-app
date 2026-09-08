import { Platform, StyleSheet, Text } from "react-native";

const THAI = /[฀-๿]/;

const IS_WEB = Platform.OS === "web";

const BALOO = {
  400: "Baloo2_400Regular",
  500: "Baloo2_500Medium",
  600: "Baloo2_600SemiBold",
  700: "Baloo2_700Bold",
};

const BAI = {
  400: "BaiJamjuree_400Regular",
  500: "BaiJamjuree_500Medium",
  600: "BaiJamjuree_600SemiBold",
  700: "BaiJamjuree_700Bold",
};

const QUICKSAND = {
  400: "Quicksand_400Regular",
  500: "Quicksand_500Medium",
  600: "Quicksand_600SemiBold",
  700: "Quicksand_700Bold",
};

function resolveWeight(value) {
  if (value === "bold") return 700;
  if (value === "normal") return 400;
  const n = typeof value === "number" ? value : parseInt(value, 10);
  if (!n || Number.isNaN(n)) return 400;
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

function pickFamily(weight, hasThai) {
  if (IS_WEB) {
    return hasThai
      ? `${BAI[weight]}, BaiJamjuree, sans-serif`
      : `${BALOO[weight]}, ${QUICKSAND[weight]}, sans-serif`;
  }
  return hasThai ? BAI[weight] : BALOO[weight];
}

export default function AppText({ style, children, ...rest }) {
  const flat = style ? StyleSheet.flatten(style) || {} : {};
  const text = collectText(children);
  const weight = resolveWeight(flat.fontWeight);
  const hasThai = THAI.test(text);
  const fontFamily = pickFamily(weight, hasThai);
  const fontSize = flat.fontSize || 14;
  const lineHeight = flat.lineHeight || Math.round(fontSize * 1.5);
  const { fontFamily: _ignored, fontWeight: _weight, ...restStyle } = flat;

  return (
    <Text {...rest} style={[restStyle, { fontFamily, lineHeight }]}>
      {children}
    </Text>
  );
}
