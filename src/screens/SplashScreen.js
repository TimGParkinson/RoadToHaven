import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Image, StyleSheet } from 'react-native';
import { colors } from '../styles';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

/**
 * Full-screen JS splash overlay.
 * Sits on top of everything and fades out when `visible` becomes false.
 *
 * Props:
 *   visible  {boolean}  — pass false to trigger the fade-out
 */
export default function SplashScreen({ visible }) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) {
      Animated.timing(opacity, {
        toValue:         0,
        duration:        700,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Animated.View style={[styles.container, { opacity }]} pointerEvents="none">
      <Image
        source={require('../../assets/splash-icon.png')}
        style={styles.image}
        resizeMode="cover"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    alignItems:      'center',
    justifyContent:  'center',
    zIndex:          999,
  },
  image: {
    width:  SCREEN_W,
    height: SCREEN_H,
  },
});
