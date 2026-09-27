/** กราฟพื้นที่  */
import { useState, useRef, useEffect } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { Svg, Path, Defs, LinearGradient, Stop, Circle, Line, Rect, Text as SvgText } from "react-native-svg";

import AppText from "../components/AppText";
import { colors } from "../theme";

const AnimatedPath = Animated.createAnimatedComponent(Path);

const H = 130;
const PAD_X = 20;
const PAD_TOP = 20;
// เผื่อที่ว่างใต้แกน X สำหรับ label วันที่
const PAD_BOTTOM = 26;

function SimpleLineChart({ data, healthyRange, labels }) {
  const [width, setWidth] = useState(300);
  const draw = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    draw.setValue(0);
    Animated.timing(draw, {
      toValue: 1,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [draw, data]);

  if (!data || data.length === 0) return null;

  const W = width || 300;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const n = data.length;
  // ยืด domain ให้ min/max ไม่ชิดขอบบน-ล่างของกราฟ
  const domPad = range * 0.15;
  const domMin = min - domPad;
  const domMax = max + domPad;
  const stepX = n === 1 ? 0 : (W - 2 * PAD_X) / (n - 1);
  const x = (i) => PAD_X + i * stepX;
  const y = (v) => H - PAD_BOTTOM - ((v - domMin) / (domMax - domMin)) * (H - PAD_TOP - PAD_BOTTOM);
  // แสดงตัวเลขแบบตัดศูนย์ท้าย เช่น 5.8, 6
  const fmt = (v) => String(Math.round(v * 10) / 10);

  const pts = data.map((v, i) => ({ x: x(i), y: y(v) }));
  const line = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(" ");

  const area = `${line} L${pts[n - 1].x.toFixed(2)},${(H - PAD_BOTTOM).toFixed(2)} L${pts[0].x.toFixed(2)},${(H - PAD_BOTTOM).toFixed(2)} Z`;

  let totalLen = 0;
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i - 1].x;
    const dy = pts[i].y - pts[i - 1].y;
    totalLen += Math.sqrt(dx * dx + dy * dy);
  }
  if (totalLen === 0) totalLen = 1;


  const lineDashOffset = draw.interpolate({ inputRange: [0, 1], outputRange: [totalLen, 0] });

  const lateOpacity = draw.interpolate({ inputRange: [0, 0.55, 1], outputRange: [0, 0, 1] });

  const areaOpacity = draw.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0, 0.2, 1] });

  const median = (min + max) / 2;
  const gridValues = [min, median, max];


  let band = null;
  if (healthyRange && healthyRange.length === 2) {
    const [hMin, hMax] = healthyRange;
    const yTop = y(hMax);
    const yBottom = y(hMin);
    const top = Math.min(yTop, yBottom);
    const height = Math.abs(yBottom - yTop);
    if (height > 0) {
      band = (
        <Rect
          x={0}
          y={top}
          width={W}
          height={height}
          fill={colors.greenDark}
          opacity={0.14}
        />
      );
    }
  }

  return (
    <View
      style={{ width: "100%", marginVertical: 12 }}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      accessibilityLabel={`กราฟแนวโน้ม มี ${n} จุด ค่าล่าสุด ${fmt(data[n - 1])}${healthyRange && healthyRange.length === 2 ? " พร้อมช่วงสุขภาพ" : ""}`}
    >
      <Svg width={W} height={H}>
        <Defs>
          <LinearGradient id="weightArea" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.greenDark} stopOpacity="0.35" />
            <Stop offset="100%" stopColor={colors.greenDark} stopOpacity="0.03" />
          </LinearGradient>
        </Defs>
        {band}
        {gridValues.flatMap((v, i) => [
          <Line
            key={`g${i}`}
            x1={0}
            y1={y(v)}
            x2={W}
            y2={y(v)}
            stroke={colors.border}
            strokeWidth={1}
            strokeDasharray="3,3"
            opacity={0.5}
          />,
          // ตัวเลขกำกับเส้น grid ฝั่งซ้าย
          <SvgText
            key={`gl${i}`}
            x={4}
            y={y(v) + 3}
            fontSize={10}
            fontFamily="Kanit_400Regular"
            fill={colors.textGray}
            textAnchor="start"
          >
            {fmt(v)}
          </SvgText>,
        ])}
        <AnimatedPath d={area} fill="url(#weightArea)" opacity={areaOpacity} />
        <AnimatedPath
          d={line}
          fill="none"
          stroke={colors.greenDark}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={totalLen}
          strokeDashoffset={lineDashOffset}
        />
        {pts.map((p, i) => (
          <Circle key={`c${i}`} cx={p.x} cy={p.y} r={3} fill={colors.greenDark} opacity={lateOpacity} />
        ))}
        {/* ตัวเลขค่าเฉพาะจุดแรกและสุดท้าย กันข้อความซ้อนกัน */}
        {pts.map((p, i) =>
          i === 0 || i === n - 1 ? (
            <SvgText
              key={`l${i}`}
              x={p.x}
              y={p.y - 6}
              fontSize={11}
              fontFamily="Kanit_700Bold"
              fill={colors.textBody}
              textAnchor="middle"
              opacity={lateOpacity}
            >
              {fmt(data[i])}
            </SvgText>
          ) : null
        )}
        {/* label แกน X — จุดแรก/กลาง/ล่าสุด */}
        {(n === 1 ? [0] : [...new Set([0, Math.floor((n - 1) / 2), n - 1])]).map((idx, k) =>
          labels && labels[idx] ? (
            <SvgText
              key={`xl${k}`}
              x={x(idx)}
              y={H - 6}
              fontSize={10}
              fontFamily="Kanit_400Regular"
              fill={colors.textGray}
              textAnchor="middle"
            >
              {labels[idx]}
            </SvgText>
          ) : null
        )}
      </Svg>
      {/* legend ช่วงสุขภาพ — แสดงเมื่อมี healthyRange */}
      {band && (
        <View style={styles.legendRow}>
          <View style={styles.legendDot} />
          <AppText style={styles.legendText}>ช่วงสุขภาพ</AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  legendRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 3, backgroundColor: colors.greenDark, opacity: 0.3 },
  legendText: { fontSize: 11, fontWeight: "400", color: colors.textGray },
});

export default SimpleLineChart;
