import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { responsiveFont } from '@/utils/responsive';

interface ModuleSuccessOverlayProps {
  visible: boolean;
  onFinish?: () => void;
  duration?: number;
}

export function ModuleSuccessOverlay({
  visible,
  onFinish,
  duration = 750,
}: ModuleSuccessOverlayProps) {
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      opacityAnim.setValue(0);
      return;
    }

    Animated.sequence([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.delay(duration - 250),
      Animated.timing(opacityAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      onFinish?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [visible, duration, onFinish, opacityAnim]);

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="box-only"
      style={[
        styles.overlay,
        {
          opacity: opacityAnim,
        },
      ]}
    >
      <Text style={styles.checkEmoji}>✅</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#2F80ED',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
  },
  checkEmoji: {
    fontSize: responsiveFont(80, 120),
  },
});
