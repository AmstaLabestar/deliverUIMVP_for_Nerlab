import { BorderRadius, COLORS } from "@/src/shared/theme";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";

type SkeletonBlockProps = {
  width?: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

const AnimatedView = Animated.createAnimatedComponent(Animated.View);

const SkeletonBlockComponent = ({
  width = "100%",
  height,
  borderRadius = BorderRadius.md,
  style,
}: SkeletonBlockProps) => {
  const opacity = useRef(new Animated.Value(0.62)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 540,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.62,
          duration: 540,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [opacity]);

  const blockStyle = useMemo(
    () => ({
      width,
      height,
      borderRadius,
    }),
    [borderRadius, height, width],
  );

  return <AnimatedView style={[styles.base, blockStyle, style, { opacity }]} />;
};

export const SkeletonBlock = React.memo(SkeletonBlockComponent);

const styles = StyleSheet.create({
  base: {
    backgroundColor: COLORS.border,
    overflow: "hidden",
  },
});
