/** ฟอร์มเพิ่มสัตว์เลี้ยง  */
import { useState } from "react";
import { SafeAreaView, View, Pressable, Alert, Image, StyleSheet } from "react-native";
import { Camera } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";

import AppText from "../components/AppText";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button, Badge } from "../components/ui";
import Header from "../components/Header";
import Field from "../components/Field";
import PetIcon from "../components/PetIcon";
import { colors, radius } from "../theme";
import { sharedStyles } from "../theme/sharedStyles";
import AnimatedScrollView from "../components/AnimatedScrollView";
import Reveal from "../components/Reveal";
import { confirmDialog } from "../utils/confirm";
import { findBreedRange, BREED_DISCLAIMER } from "../data/breedRanges";


const PET_TYPES = [
  { key: "dog", label: "สุนัข", icon: "dog", healthyRange: [5, 7] },
  { key: "cat", label: "แมว", icon: "cat", healthyRange: [3, 4.5] },
  { key: "rabbit", label: "กระต่าย", icon: "rabbit", healthyRange: [1.5, 2.5] },
  { key: "bird", label: "นก", icon: "bird", healthyRange: [0.08, 0.12] },
  { key: "other", label: "อื่นๆ", icon: "paw", healthyRange: [3, 6] },
];

function AddPetScreen({ go, addPet, goSubscription }) {
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [photo, setPhoto] = useState(null);
  const [type, setType] = useState(PET_TYPES[0]);
  const [otherType, setOtherType] = useState("");
  const [inlineError, setInlineError] = useState(null); // ข้อความเตือนใต้ช่องน้ำหนัก
  const breedMatch = findBreedRange(breed, type.key); // ช่วงน้ำหนักอ้างอิงตามสายพันธุ์ (แสดง hint ใต้ช่อง)

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("ต้องการสิทธิ์การเข้าถึง", "กรุณาอนุญาตการเข้าถึงรูปภาพเพื่ออัปโหลดรูปสัตว์เลี้ยง");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.length) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (name.trim() === "") {
      Alert.alert("ยังไม่ได้กรอกชื่อ", "กรุณากรอกชื่อสัตว์เลี้ยง");
      return;
    }
    // น้ำหนักกรอกมาแต่ไม่ใช่ตัวเลข — เตือนใต้ช่องแทนการเดาค่า
    if (weight.trim() !== "") {
      const parsed = parseFloat(weight);
      if (isNaN(parsed) || parsed <= 0) {
        setInlineError("น้ำหนักต้องเป็นตัวเลข เช่น 5.8");
        return;
      }
    }
    setInlineError(null);
    const initialWeight = parseFloat(weight);
    const weightToSeed = !isNaN(initialWeight) && initialWeight > 0 ? initialWeight : null;
    // ช่วงสุขภาพ: จับคู่จากสายพันธุ์ก่อน ไม่เจอใช้ช่วงของประเภทสัตว์
    const breedMatch = findBreedRange(breed, type.key);
    const ok = addPet(
      {
        id: Date.now().toString(),
        name: name.trim(),
        breed: breed.trim() || "ไม่ระบุสายพันธุ์",
        age: age.trim() || "แรกเกิด",
        icon: type.icon,
        typeLabel: type.key === "other" && otherType.trim() ? otherType.trim() : type.label,
        healthyRange: breedMatch ? breedMatch.range : type.healthyRange,
        photo,
      },
      weightToSeed
    );
    if (ok !== false) {
      go("home");
      return;
    }
    // ครบจำนวนตามแพ็กเกจ — ชวนอัปเกรดและพาไปหน้าเลือกแพ็กเกจ
    confirmDialog({
      title: "จำนวนสัตว์เลี้ยงเต็มตามแพ็กเกจ",
      message: "แพ็กเกจปัจจุบันของคุณรับได้จำนวนจำกัด\nซื้อแพ็กเกจอื่นเพื่อเพิ่มจำนวนสัตว์เลี้ยงได้เลย!",
      confirmText: "ดูแพ็กเกจ",
      onConfirm: () => goSubscription?.(),
    });
  };

  return (
    <SafeAreaView style={sharedStyles.container}>
      <Header title="เพิ่มสัตว์เลี้ยง" onBack={() => go("home")} />
      <AnimatedScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 }}>
        <Reveal>
          <Pressable onPress={pickPhoto} style={({ pressed }) => [styles.avatarWrap, pressed && { opacity: 0.85 }]}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.avatarPhoto} resizeMode="cover" />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Camera size={28} color={colors.brownLight} strokeWidth={2} />
              </View>
            )}
          </Pressable>
          <AppText style={styles.uploadText}>แตะเพื่ออัปโหลดรูป</AppText>
        </Reveal>

        <Reveal>
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลสัตว์เลี้ยง</CardTitle>
            </CardHeader>
            <CardContent>
              <AppText style={sharedStyles.label}>ประเภทสัตว์เลี้ยง</AppText>
              <View style={styles.typeRow}>
                {PET_TYPES.map((t) => {
                  const active = type.key === t.key;
                  return (
                    <Pressable
                      key={t.key}
                      onPress={() => setType(t)}
                      // badge เตี้ย — เติม hitSlop ให้พื้นที่แตะรวม >= 44pt
                      hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                      style={({ pressed }) => [{ borderRadius: radius.full }, pressed && { opacity: 0.85 }]}
                    >
                      <Badge variant={active ? "default" : "outline"} icon={<PetIcon name={t.icon} size={12} color={active ? colors.white : colors.textBody} />}>
                        {t.label}
                      </Badge>
                    </Pressable>
                  );
                })}
              </View>
              
              {type.key === "other" && (
                <Field
                  label="ชื่อประเภท"
                  value={otherType}
                  onChangeText={setOtherType}
                  placeholder="เช่น แฮมสเตอร์"
                  autoFocus
                />
              )}
              <View style={{ marginTop: 6 }}>
                <Field label="ชื่อสัตว์เลี้ยง (จำเป็น)" value={name} onChangeText={setName} placeholder="เช่น Coco" />
                <Field label="สายพันธุ์ (ไม่บังคับ)" value={breed} onChangeText={setBreed} placeholder="เช่น โกลเด้นรีทรีฟเวอร์" />
                {breedMatch && (
                  <AppText style={styles.breedHint}>
                    ช่วงน้ำหนักอ้างอิง: {breedMatch.range[0]}–{breedMatch.range[1]} kg — {BREED_DISCLAIMER}
                  </AppText>
                )}
                <Field label="อายุ (ไม่บังคับ)" value={age} onChangeText={setAge} placeholder="เช่น 1 ปี" />
                <Field
                  label="น้ำหนักเริ่มต้น kg (ไม่บังคับ)"
                  value={weight}
                  onChangeText={(t) => {
                    setWeight(t);
                    setInlineError(null);
                  }}
                  placeholder="เช่น 5.8"
                  keyboardType="decimal-pad"
                  error={Boolean(inlineError)}
                  errorText={inlineError}
                />
              </View>
            </CardContent>
            <CardFooter>
              <Button title="เพิ่มสัตว์เลี้ยง" onPress={handleSave} style={{ flex: 1 }} />
            </CardFooter>
          </Card>
        </Reveal>
      </AnimatedScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  avatarWrap: { width: 100, height: 100, borderRadius: radius.full, backgroundColor: colors.cardTanBg, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center", marginTop: 10, overflow: "hidden", alignSelf: "center" },
  avatarPhoto: { width: 100, height: 100, borderRadius: radius.full },
  avatarPlaceholder: { alignItems: "center", justifyContent: "center" },
  uploadText: { color: colors.textGray, marginTop: 12, marginBottom: 16, fontSize: 14, fontWeight: "400", textAlign: "center" },
  typeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 },
  breedHint: { fontSize: 12, color: colors.textGray, marginTop: -10, marginBottom: 12 },
});

export default AddPetScreen;
