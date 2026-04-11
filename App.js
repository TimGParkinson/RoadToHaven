import 'react-native-gesture-handler'; // must be first import
import { useEffect }              from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GameProvider, useGame }  from './src/context/GameContext';
import { initialiseMobileAds }   from './src/services/adService';
import AppNavigator               from './src/navigation/AppNavigator';
import { colors, MONO }           from './src/styles';

// ─────────────────────────────────────────────
// LOADING SCREEN
// Shown for the brief moment AsyncStorage is reading the save.
// ─────────────────────────────────────────────
function LoadingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>LOADING...</Text>
    </View>
  );
}

// ─────────────────────────────────────────────
// ROOT
// Inner component so it can call useGame() inside GameProvider.
// ─────────────────────────────────────────────
function Root() {
  const { isLoading } = useGame();

  useEffect(() => {
    initialiseMobileAds();
  }, []);

  if (isLoading) return <LoadingScreen />;
  return <AppNavigator />;
}

// ─────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────
export default function App() {
  return (
    <GameProvider>
      <Root />
    </GameProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: colors.background,
    alignItems:      'center',
    justifyContent:  'center',
  },
  text: {
    fontFamily:    MONO,
    fontSize:      14,
    color:         colors.primary,
    letterSpacing: 4,
  },
});
