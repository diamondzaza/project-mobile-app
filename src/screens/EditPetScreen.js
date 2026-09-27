/** ฟอร์มแก้ไขข้อมูลสัตว์เลี้ยง — prefill ค่าเดิม, บันทึกผ่าน updatePet (patch บางส่วน)
 *  น้ำหนักไม่อยู่ในฟอร์มนี้ — น้ำหนักเป็นประวัติย้อนหลัง จัดการที่หน้าน้ำหนัก */
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
import { findBreedRange, BREED_DISCLAIMER } from "../data/breedRanges";

const PET_TYPES = [
  { key: "dog", label: "สุนัข", icon: "dog", healthyRange: [5, 7] },
  { key: "cat", label: "แมว", icon: "cat", healthyRange: [3, 4.5] },
  { key: "rabbit", label: "กระต่าย", icon: "rabbit", healthyRange: [1.5, 2.5] },
  { key: "bird", label: "นก", icon: "bird", healthyRange: [0.08, 0.12] },
  { key: "other", label: "อื่นๆ", icon: "paw", healthyRange: [3, 6] },
];

/** หาประเภทเดิมของสัตว์เลี้ยงจาก icon/typeLabel เพื่อ prefill */
function resolveInitialType(pet) {
  const byKey = PET_TYPES.find((t) => t.key === pet.icon);
  if (byKey) return { type: byKey, otherType: "" };
  const byLabel = PET_TYPES.find((t) => t.label === pet.typeLabel);
  if (byLabel) return { type: byLabel, otherType: "" };
  return { type: PET_TYPES[PET_TYPES.length - 1], otherType: pet.typeLabel || "" };
}

function EditPetScreen({ go, activePet, onSave, onSavePhoto }) {
  const initial = resolveInitialType(activePet);
  const [name, setName] = useState(activePet.name || "");
  const [breed, setBreed] = useState(activePet.breed || "");
  const [age, setAge] = useState(activePet.age || "");
  const [photo, setPhoto] = useState(activePet.photo || null);
  const [photoChanged, setPhotoChanged] = useState(false);
  const [type, setType] = useState(initial.type);
  const [otherType, setOtherType] = useState(initial.otherType);
  const [inlineError, setInlineError] = useState(null);
  const breedMatch = findBreedRange(breed, type.key); // ช่วงน้ำหนักอ้างอิงตามสายพันธุ์

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("ต้องการสิทธิ์การเข้าถึง", "กรุณาอนุญาตการเข้าถึงรูปภาพเพื่อเปลี่ยนรูปสัตว์เลี้ยง");
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
      setPhotoChanged(true);
    }
  };

  const handleSave = () => {
    if (name.trim() === "") {
      setInlineError("กรุณากรอกชื่อสัตว์เลี้ยง");
      return;
    }
    setInlineError(null);
    onSave(activePet.id, {
      name: name.trim(),
      breed: breed.trim(),
      age: age.trim(),
      icon: type.icon,
      typeLabel: type.key === "other" && otherType.trim() ? otherType.trim() : type.label,
      // ช่วงสุขภาพ: จับคู่จากสายพันธุ์ก่อน ไม่เจอใช้ช่วงของประเภทสัตว์
      healthyRange: breedMatch ? breedMatch.range : type.healthyRange,
    });
    if (photoChanged && photo) onSavePhoto(activePet.id, photo);
    go("petProfile");
  };

  return (
    <SafeAreaView style={sharedStyles.container}>
      <Header title={`แก้ไขข้อมูล ${activePet.name}`} onBack={() => go("petProfile")} />
      <AnimatedScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 40 }}>
        <Pressable onPress={pickPhoto} style={({ pressed }) => [styles.avatarWrap, pressed && { opacity: 0.85 }]}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.avatarPhoto} resizeMode="cover" />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Camera size={28} color={colors.brownLight} strokeWidth={2} />
            </View>
          )}
          <View style={styles.cameraBadge}>
            <Camera size={14} color={colors.white} strokeWidth={2.4} />
          </View>
        </Pressable>
        <AppText style={styles.uploadText}>แตะรูปเพื่อเปลี่ยน</AppText>

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
              <Field label="ชื่อประเภท" value={otherType} onChangeText={setOtherType} placeholder="เช่น แฮมสเตอร์" />
            )}
            <View style={{ marginTop: 6 }}>
              <Field
                label="ชื่อสัตว์เลี้ยง (จำเป็น)"
                value={name}
                onChangeText={(t) => {
                  setName(t);
                  setInlineError(null);
                }}
                placeholder="เช่น Coco"
                error={Boolean(inlineError)}
                errorText={inlineError}
              />
              <Field label="สายพันธุ์ (ไม่บังคับ)" value={breed} onChangeText={setBreed} placeholder="เช่น โกลเด้นรีทรีฟเวอร์" />
              {breedMatch && (
                <AppText style={styles.breedHint}>
                  ช่วงน้ำหนักอ้างอิง: {breedMatch.range[0]}–{breedMatch.range[1]} kg — {BREED_DISCLAIMER}
                </AppText>
              )}
              <Field label="อายุ (ไม่บังคับ)" value={age} onChangeText={setAge} placeholder="เช่น 1 ปี" />
            </View>
            <AppText style={styles.weightNote}>
              น้ำหนักเป็นประวัติย้อนหลัง — เพิ่ม/แก้ได้ที่หน้า "น้ำหนัก" ของสัตว์เลี้ยง
            </AppText>
          </CardContent>
          <CardFooter>
            <Button title="บันทึกการเปลี่ยนแปลง" onPress={handleSave} style={{ flex: 1 }} />
          </CardFooter>
        </Card>
      </AnimatedScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  avatarWrap: {
    width: 100, height: 100, borderRadius: radius.full, backgroundColor: colors.cardTanBg,
    borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center",
    marginTop: 10, overflow: "hidden", alignSelf: "center",
  },
  avatarPhoto: { width: 100, height: 100, borderRadius: radius.full },
  avatarPlaceholder: { alignItems: "center", justifyContent: "center" },
  cameraBadge: {
    position: "absolute", right: 4, bottom: 4, width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.accentDeep, alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: colors.white,
  },
  uploadText: { color: colors.textGray, marginTop: 12, marginBottom: 16, fontSize: 14, fontWeight: "400", textAlign: "center" },
  typeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 },
  breedHint: { fontSize: 12, color: colors.textGray, marginTop: -10, marginBottom: 12 },
  weightNote: { fontSize: 12, color: colors.textGray, marginTop: 4 },
});

export default EditPetScreen;
