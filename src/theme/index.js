// ธีมหลัก card
import { Platform } from "react-native";

export const colors = {

  background: "#F2C9A8",
  cardBg: "rgba(255,255,255,0.38)",
  cardTanBg: "rgba(232,196,160,0.42)",
  brown: "#7A5C42",
  brownLight: "#704F2E",
  greenPastel: "#F3D9C2",
  greenDark: "#C97B5A", 
  accent: "#C97B5A",
  border: "rgba(255,255,255,0.55)",
  textDark: "#5A3419",
  textBody: "#5E3F26",
  textGray: "#5E3F26",
  red: "#D9614A",
};


export const category = {
  health: { main: "#C76B61", soft: "#F6E0DC" },
  food: { main: "#C97B5A", soft: "#F3D9C2" },
  activity: { main: "#C8924A", soft: "#F3E2C8" },
  appointments: { main: "#8A6FB0", soft: "#EDE3F3" },
};


export const gradient = {
  screen: ["#FCE7D6", "#F7C9A6", "#EFA680"],
  header: ["rgba(255,255,255,0.42)", "rgba(255,255,255,0.28)"],
  cover: ["#E8C4A0", "#F3D9C2"],
  hero: ["#F3D9C2", "#E8C4A0"],
};

export const radius = { sm: 12, md: 18, lg: 24, xl: 32, full: 999 };


const glassShadowBase = Platform.select({
  web: { boxShadow: "0 4px 20px rgba(0, 0, 0, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.5)" },
  default: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
});

const glassShadowLarge = Platform.select({
  web: { boxShadow: "0 12px 32px rgba(90, 52, 25, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.55)" },
  default: {
    shadowColor: "#5A3419",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 32,
    elevation: 10,
  },
});


export const glass = {
  surface: {
    backgroundColor: "rgba(255,255,255,0.72)",
    borderColor: "rgba(255,255,255,0.5)",
    borderWidth: 1,
    ...glassShadowBase,
  },
  strong: {
    backgroundColor: "rgba(255,255,255,0.8)",
    borderColor: "rgba(201,123,90,0.4)",
    borderWidth: 1,
    ...glassShadowBase,
  },
  warm: {
    backgroundColor: "rgba(232,196,160,0.42)",
    borderColor: "rgba(255,255,255,0.5)",
    borderWidth: 1,
    ...glassShadowBase,
  },

  bar: {
    backgroundColor: "rgba(255,255,255,0.3)",
    borderColor: "rgba(255,255,255,0.5)",
    borderWidth: 1,
    ...glassShadowBase,
  },
};

export const shadow = glassShadowBase;
export const shadowLg = glassShadowLarge;
