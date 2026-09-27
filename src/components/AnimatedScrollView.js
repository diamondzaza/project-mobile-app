/** ScrollView ที่ publish scrollY + รองรับ ref (scrollToTop) */
import { Animated } from "react-native";
import React, { createContext, useContext, useRef, useState } from "react";

export const ScrollContext = createContext({ scrollY: null, viewportH: 0 });
export const useScrollContext = () => useContext(ScrollContext);

export const AnimatedScrollView = React.forwardRef(function AnimatedScrollView(
  { children, contentContainerStyle, onScroll, style, ...props },
  ref
) {
  const scrollY = useRef(new Animated.Value(0)).current;
  const innerRef = useRef(null);
  const [viewportH, setViewportH] = useState(0);

  React.useImperativeHandle(ref, () => ({
    scrollTo: (opts) => innerRef.current?.scrollTo(opts),
    scrollToTop: () => innerRef.current?.scrollTo({ y: 0, animated: true }),
  }));

  return (
    <ScrollContext.Provider value={{ scrollY, viewportH }}>
      <Animated.ScrollView
        ref={innerRef}
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
});

export default AnimatedScrollView;
