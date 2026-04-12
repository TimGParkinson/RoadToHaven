import 'react-native-gesture-handler'; // must be first import
import { useEffect, useState }    from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider }       from 'react-native-safe-area-context';
import { GameProvider, useGame }  from './src/context/GameContext';
import { initialiseMobileAds }   from './src/services/adService';
import AppNavigator               from './src/navigation/AppNavigator';
import JSSplash                   from './src/screens/SplashScreen';
import { colors }                 from './src/styles';
import * as NativeSplash from 'expo-splash-screen';

NativeSplash.preventAutoHideAsync();
// ─────────────────────────────────────────────
// ROOT
// Inner component so it can call useGame() inside GameProvider.
// ─────────────────────────────────────────────
function Root() {
  const { isLoading } = useGame();
  const [splashVisible, setSplashVisible] = useState(true);

  useEffect(() => {
    // Hand off from the native splash to our JS splash immediately
    NativeSplash.hideAsync();
    initialiseMobileAds();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      // Keep JS splash visible for at least 1.5 s so it's actually seen
      const timer = setTimeout(() => setSplashVisible(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <View style={styles.container}>
      {!isLoading && <AppNavigator />}
      <JSSplash visible={splashVisible} />
    </View>
  );
}

// ─────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────
export default function App() {
  return (
    <SafeAreaProvider>
      <GameProvider>
        <Root />
      </GameProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: colors.background,
  },
});
