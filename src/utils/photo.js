// รูปภาพ 
import * as ImagePicker from "expo-image-picker";

const OPTIONS = {
  mediaTypes: ["images"],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.6, 
};

function extractUri(result) {
  if (result.canceled) return null;
  return result.assets?.[0]?.uri || null;
}

// ถ่ายรูปด้วยกล้อง 
export async function takePhoto() {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) return null;
  try {
    const result = await ImagePicker.launchCameraAsync(OPTIONS);
    return extractUri(result);
  } catch {
    return null;
  }
}

// เลือกรูปจากคลังภาพ
export async function choosePhoto() {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;
  try {
    const result = await ImagePicker.launchImageLibraryAsync(OPTIONS);
    return extractUri(result);
  } catch {
    return null;
  }
}
