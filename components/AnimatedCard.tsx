// components/AnimatedCard.tsx
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";

export default function AnimatedCard({ children, style }: any) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: 1, useNativeDriver: true, friction: 8 }).start();
  }, []);
  return (
    <Animated.View style={[{ transform: [{ scale: anim }], opacity: anim }, styles.card, style]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "transparent",
  },
});
