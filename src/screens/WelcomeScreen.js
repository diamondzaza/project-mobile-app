/** หน้า onboarding แสดงสไลด์แนะนำแอป เลื่อนสไลด์ด้วยปุ่ม Next หรือเลือกจากจุดด้านล่าง ถึงสไลด์สุดท้ายจะไปหน้า login */
import { useState, useRef, useEffect } from "react";
import { SafeAreaView, View, Pressable, Image, Animated, StyleSheet } from "react-native";

import AppText from "../components/AppText";
import Button from "../components/Button";
import GradientSurface from "../components/GradientSurface";
import { slides } from "../data";
import { colors, shadowLg, glass } from "../theme";
import { sharedStyles } from "../theme/sharedStyles";

function WelcomeScreen({ go }) {
  const [slideIndex, setSlideIndex] = useState(0);
  const slide = slides[slideIndex];
  const isLast = slideIndex === slides.length - 1;

  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    slideAnim.setValue(0);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 420,
      useNativeDriver: true,
    }).start();
  }, [slideIndex, slideAnim]);

  const translateY = slideAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });

  const goToNext = () => {
    if (isLast) go("login");
    else setSlideIndex((i) => i + 1);
  };

  return (
    <SafeAreaView style={sharedStyles.container}>
      <View style={styles.centerFlex}>
        <Animated.View
          style={[styles.slideContent, { opacity: slideAnim, transform: [{ translateY }] }]}
        >
          <GradientSurface variant="hero" style={styles.illustrationWrap}>
            {slide.image ? (
              <Image source={slide.image} style={styles.slideImage} resizeMode="contain" />
            ) : (
              <View style={styles.imagePlaceholder} />
            )}
          </GradientSurface>
          <AppText style={styles.title}>{slide.title}</AppText>
          <AppText style={styles.subtitle}>{slide.subtitle}</AppText>
        </Animated.View>

        <View style={styles.dotsRow}>
          {slides.map((_, i) => (
            <Pressable key={i} onPress={() => setSlideIndex(i)} hitSlop={8}>
              <View style={[styles.dot, i === slideIndex && styles.dotActive]} />
            </Pressable>
          ))}
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 24 }}>
          {!isLast && (
            <Pressable onPress={() => go("login")} hitSlop={8}>
              <AppText
                style={{
                  color: colors.textBody,
                  textDecorationLine: "underline",
                  fontWeight: "600",
                  fontSize: 15,
                }}
              >
                ข้าม
              </AppText>
            </Pressable>
          )}
          <Button
            title={isLast ? "เริ่มใช้งาน" : "ถัดไป"}
            onPress={goToNext}
            style={{ width: isLast ? 220 : 140 }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centerFlex: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },
  slideContent: { alignItems: "center" },
  illustrationWrap: { width: 200, height: 200, borderRadius: 100, alignItems: "center", justifyContent: "center", marginBottom: 32, overflow: "hidden", ...shadowLg, ...glass.strong },
  slideImage: { width: 200, height: 200, borderRadius: 100 },
  imagePlaceholder: { width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(255,255,255,0.25)" },
  title: { fontSize: 28, fontWeight: "700", color: colors.textDark, textAlign: "center", marginBottom: 12 },
  subtitle: { fontSize: 14, fontWeight: "400", color: colors.textGray, textAlign: "center", lineHeight: 22, marginBottom: 24 },
  dotsRow: { flexDirection: "row", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.6)" },
  dotActive: { backgroundColor: colors.greenDark, width: 20 },
});

export default WelcomeScreen;
