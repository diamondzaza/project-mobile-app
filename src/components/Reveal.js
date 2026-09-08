/** Reveal  */
import { useState, useRef, useEffect } from "react";
import { Animated, View } from "react-native";

import { useScrollContext } from "./AnimatedScrollView";

export function Reveal({ children, style, distance = 26 }) {
  const { scrollY, viewportH } = useScrollContext();
  const [y, setY] = useState(null);
  const anim = useRef(new Animated.Value(0)).current;
  const fired = useRef(false);

  
  const fire = () => {
    if (fired.current) return;
    fired.current = true;
    Animated.timing(anim, {
      toValue: 1,
      duration: 480,
      useNativeDriver: true,
    }).start();
  };

  const onLayout = (e) => {
    const ny = e.nativeEvent.layout.y;
    setY((prev) => (prev === ny ? prev : ny));
  };

  
  useEffect(() => {
    if (y == null || viewportH === 0) return;
    if (y < viewportH * 0.9) fire();
  }, [y, viewportH]);


  useEffect(() => {
    if (y == null || viewportH === 0 || !scrollY) return;
    const check = (value) => {
      if (value + viewportH * 0.85 >= y) fire();
    };
    const id = scrollY.addListener(({ value }) => check(value));
    return () => scrollY.removeListener(id);
  }, [y, viewportH, scrollY]);

  const opacity = anim;
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] });

  
  if (!scrollY) {
    return (
      <View style={style} onLayout={onLayout}>
        {children}
      </View>
    );
  }

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]} onLayout={onLayout}>
      {children}
    </Animated.View>
  );
}

export default Reveal;
