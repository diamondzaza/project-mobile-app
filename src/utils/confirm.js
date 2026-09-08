/** กล่องยืนยัน*/
import { Alert, Platform } from "react-native";

export function confirmDialog({ title = "ยืนยันหรือไม่?", message = "", confirmText = "ยืนยัน", destructive = false, onConfirm }) {
  if (Platform.OS === "web") {
    if (window.confirm(message ? `${title}\n\n${message}` : title)) onConfirm?.();
    return;
  }
  Alert.alert(title, message, [
    { text: "ยกเลิก", style: "cancel" },
    { text: confirmText, style: destructive ? "destructive" : "default", onPress: onConfirm },
  ]);
}

export function confirmDelete({ title = "ลบ", message = "ยืนยันหรือไม่?", onConfirm }) {
  confirmDialog({ title, message, confirmText: "ลบ", destructive: true, onConfirm });
}
