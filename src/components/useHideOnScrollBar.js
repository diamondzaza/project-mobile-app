/** Hook ซ่อน/แสดง bottom bar  */
import { useRef, useCallback } from "react";
import { Animated, Easing } from "react-native";


const DIRECTION_DISTANCE = 24;

const TOP_OFFSET = 8;

const OVERSCROLL_SLACK = 16;

export function useHideOnScrollBar() {
  const anim = useRef(new Animated.Value(0)).current;
  const state = useRef({ lastY: 0, anchorY: 0, direction: 0, hidden: false });

  const animateTo = useCallback(
    (toValue) => {
      Animated.timing(anim, {
        toValue,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    },
    [anim]
  );

  const onScroll = useCallback(
    (e) => {
      const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
      const y = contentOffset.y;
      const s = state.current;
      const dy = y - s.lastY;
      s.lastY = y;
      if (dy === 0) return;

      
      const dir = dy > 0 ? 1 : -1;
      if (dir !== s.direction) {
        s.direction = dir;
        s.anchorY = y - dy;
      }

      // ใกล้บนสุด → แสดงเสมอ
      if (y <= TOP_OFFSET) {
        if (s.hidden) {
          s.hidden = false;
          animateTo(0);
        }
        return;
      }

      
      const maxY = Math.max(0, contentSize.height - layoutMeasurement.height);
      if (y > maxY + OVERSCROLL_SLACK) return;

      
      const travelled = y - s.anchorY;
      if (travelled > DIRECTION_DISTANCE && !s.hidden) {
        s.hidden = true;
        animateTo(1);
      } else if (travelled < -DIRECTION_DISTANCE && s.hidden) {
        s.hidden = false;
        animateTo(0);
      }
    },
    [animateTo]
  );

  return { onScroll, anim };
}

export default useHideOnScrollBar;
