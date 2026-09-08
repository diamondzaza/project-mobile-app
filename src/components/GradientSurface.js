/** gradient  **/
import { LinearGradient } from "expo-linear-gradient";

import { gradient } from "../theme";

export default function GradientSurface({
  variant = "header",
  colors: overrideColors,
  start = { x: 0, y: 0 },
  end = { x: 0, y: 1 },
  style,
  children,
}) {
  const colors = overrideColors || gradient[variant] || gradient.header;
  return (
    <LinearGradient colors={colors} start={start} end={end} style={style}>
      {children}
    </LinearGradient>
  );
}
