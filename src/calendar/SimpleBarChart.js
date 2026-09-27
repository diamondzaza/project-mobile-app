/** กราฟเก็บสถิติกิจกรรมรายสัปดาห์/รายเดือน */
import { useState, useRef, useEffect } from "react";
import { View, Animated, Pressable, StyleSheet } from "react-native";
import { Svg, Rect, Text as SvgText, Line } from "react-native-svg";

import AppText from "../components/AppText";
import { colors } from "../theme";

const H = 150;
const PAD_TOP = 26;
const PAD_BOTTOM = 24; 
const PAD_LEFT = 34; 
const PAD_RIGHT = 6;
const GRID_LINES = 3; 

function SimpleBarChart({ data, accent = colors.greenDark, unit = "min", todayIndex = null, mutedFill = colors.brown }) {
  const [width, setWidth] = useState(300);
  const [tooltipIndex, setTooltipIndex] = useState(null);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [anim, data]);

  const rows = data || [];
  if (rows.length === 0) return null;

  const W = width || 300;
  const max = Math.max(...rows.map((d) => d.value), 1);
  
  const axisMax = Math.ceil(max / 10) * 10 || 10;
  const slot = (W - PAD_LEFT - PAD_RIGHT) / rows.length;
  const barW = Math.min(26, slot * 0.55);
  const chartH = H - PAD_TOP - PAD_BOTTOM;
  const baseY = PAD_TOP + chartH;
  const y = (v) => baseY - (v / axisMax) * chartH;
  const barH = (v) => Math.max(v > 0 ? 3 : 0, (v / axisMax) * chartH);
  
  const fillOf = (i) => (todayIndex === i ? accent : mutedFill);

  const opacity = anim;
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });

  // แบ่ง grid เป็น GRID_LINES ช่วงเท่า ๆ กัน (เดิมหารด้วย GRID_LINES ทำเส้นบนสุดตรง axisMax)
  const gridValues = Array.from({ length: GRID_LINES }, (_, i) => axisMax * ((i + 1) / (GRID_LINES + 1)));

  const tip = tooltipIndex != null ? rows[tooltipIndex] : null;
  const toggleTip = (i) => setTooltipIndex((prev) => (prev === i ? null : i));

  return (
    <View
      style={{ width: "100%", marginVertical: 8 }}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      accessibilityLabel={`กราฟแท่งสถิติ ${rows.length} ช่วง ค่าสูงสุด ${Math.round(max)} ${unit}`}
    >
      <View style={styles.tooltipRow}>
        {tip ? (
          <View style={styles.tooltip}>
            <AppText style={styles.tooltipText}>
              {tip.dateLabel || tip.label} · {Math.round(tip.value)} {unit}
            </AppText>
          </View>
        ) : (
          <AppText style={styles.unitHint}>{unit}</AppText>
        )}
      </View>
      <Animated.View style={{ opacity, transform: [{ translateY }] }}>
        <Svg width={W} height={H}>
          {gridValues.flatMap((v, i) => [
            <Line
              key={`gl${i}`}
              x1={PAD_LEFT}
              y1={y(v)}
              x2={W}
              y2={y(v)}
              stroke={colors.border}
              strokeWidth={1}
              strokeDasharray="3,3"
              opacity={0.6}
            />,
            <SvgText key={`gt${i}`} x={PAD_LEFT - 6} y={y(v) + 3} fontSize={12} fontFamily="Kanit_400Regular" fill={colors.textBody} textAnchor="end">
              {Math.round(v)}
            </SvgText>,
          ])}
          {/* baseline */}
          <Line x1={PAD_LEFT} y1={baseY} x2={W} y2={baseY} stroke={colors.textBody} strokeWidth={1} opacity={0.4} />
          <SvgText x={PAD_LEFT - 6} y={baseY + 3} fontSize={12} fontFamily="Kanit_400Regular" fill={colors.textBody} textAnchor="end">
            0
          </SvgText>
          {rows.map((d, i) => {
            const cx = PAD_LEFT + slot * i + slot / 2;
            const h = barH(d.value);
            return (
              <Rect
                key={`b${i}`}
                x={cx - barW / 2}
                y={baseY - h}
                width={barW}
                height={h}
                rx={4}
                fill={fillOf(i)}
                opacity={d.value > 0 ? (tooltipIndex === i ? 1 : 0.85) : 0.25}
                // แท่งที่ถูกเลือกมีขอบเข้มและทึบกว่าแท่งอื่น
                stroke={tooltipIndex === i ? colors.accentDeep : "transparent"}
                strokeWidth={tooltipIndex === i ? 1.5 : 0}
                onPress={() => toggleTip(i)}
              />
            );
          })}
          {rows.map((_, i) => {
            const cx = PAD_LEFT + slot * i + slot / 2;
            return (
              <Rect
                key={`hit${i}`}
                x={cx - slot / 2}
                y={PAD_TOP - 10}
                width={slot}
                height={chartH + 10}
                fill="transparent"
                onPress={() => toggleTip(i)}
              />
            );
          })}
          {/* ตัวเลขบนแท่ง — แสดงเฉพาะเมื่อแท่งไม่เยอะ กันตัวเลขชนกัน */}
          {rows.length <= 7 &&
            rows.map((d, i) => {
              const cx = PAD_LEFT + slot * i + slot / 2;
              return (
                <SvgText
                  key={`v${i}`}
                  x={cx}
                  y={baseY - barH(d.value) - 6}
                  fontSize={12}
                  fontFamily="Kanit_700Bold"
                  fill={colors.textBody}
                  textAnchor="middle"
                >
                  {d.value > 0 ? Math.round(d.value) : ""}
                </SvgText>
              );
            })}
          {rows.map((d, i) => {
            const cx = PAD_LEFT + slot * i + slot / 2;
            return (
              <SvgText
                key={`l${i}`}
                x={cx}
                y={H - 8}
                fontSize={12}
                fontFamily={todayIndex === i ? "Kanit_600SemiBold" : "Kanit_400Regular"}
                fill={todayIndex === i ? colors.textDark : colors.textBody}
                textAnchor="middle"
              >
                {d.label}
              </SvgText>
            );
          })}
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  tooltipRow: { minHeight: 26, justifyContent: "center", alignItems: "flex-start" },
  tooltip: {
    backgroundColor: colors.textDark,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tooltipText: { color: colors.white, fontSize: 12, fontWeight: "600" },
  unitHint: { color: colors.textBody, fontSize: 12, fontWeight: "400" },
});

export default SimpleBarChart;
