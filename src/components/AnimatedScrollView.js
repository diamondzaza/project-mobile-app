/** ScrollView  */
import { Animated } from "react-native";
import React, { createContext, useContext, useRef, useState } from "react";

export const ScrollContext = createContext({ scrollY: null, viewportH: 0 });
export const useScrollContext = () => useContext(ScrollContext);

export function AnimatedScrollView({ children, contentContainerStyle, onScroll, style, ...props }) {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [viewportH, setViewportH] = useState(0);
  return (
    <ScrollContext.Provider value={{ scrollY, viewportH }}>
      <Animated.ScrollView
        onScroll={(e) => {
          scrollY.setValue(e.nativeEvent.contentOffset.y);
          if (onScroll) onScroll(e);
        }}
        scrollEventThrottle={16}
        onLayout={(e) => setViewportH(e.nativeEvent.layout.height)}
        style={style}
        contentContainerStyle={contentContainerStyle}
        {...props}
      >
        {children}
      </Animated.ScrollView>
    </ScrollContext.Provider>
  );
}

export default AnimatedScrollView;
