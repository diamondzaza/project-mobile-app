/** กราฟพื้นที่  */
import { useState, useRef, useEffect } from "react";
import { View, Animated } from "react-native";
import { Svg, Path, Defs, LinearGradient, Stop, Circle, Line, Rect, Text } from "react-native-svg";

import { colors } from "../theme";

const AnimatedPath = Animated.createAnimatedComponent(Path);

const H = 130;
const PAD_X = 12;
const PAD_TOP = 20; 
const PAD_BOTTOM = 10;

function SimpleLineChart({ data, healthyRange }) {
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
  const stepX = n === 1 ? 0 : (W - 2 * PAD_X) / (n - 1);
  const x = (i) => PAD_X + i * stepX;
  const y = (v) => H - PAD_BOTTOM - ((v - min) / range) * (H - PAD_TOP - PAD_BOTTOM);

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
          opacity={0.08}
        />
      );
    }
  }

  return (
    <View
      style={{ width: "100%", marginVertical: 12 }}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      <Svg width={W} height={H}>
        <Defs>
          <LinearGradient id="weightArea" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.greenDark} stopOpacity="0.35" />
            <Stop offset="100%" stopColor={colors.greenDark} stopOpacity="0.03" />
          </LinearGradient>
        </Defs>
        {band}
        {gridValues.map((v, i) => (
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
          />
        ))}
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
        {pts.map((p, i) => (
          <Text
            key={`l${i}`}
            x={p.x}
            y={p.y - 6}
            fontSize={12}
            fontFamily="BaiJamjuree_700Bold"
            fill={colors.textGray}
            textAnchor="middle"
            opacity={lateOpacity}
          >
            {String(data[i])}
          </Text>
        ))}
      </Svg>
    </View>
  );
}

export default SimpleLineChart;
