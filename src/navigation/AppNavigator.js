import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../styles';

import MainMenuScreen from '../screens/MainMenuScreen';
import TravelScreen   from '../screens/TravelScreen';
import EventScreen    from '../screens/EventScreen';
import GameOverScreen from '../screens/GameOverScreen';
import WinScreen      from '../screens/WinScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainMenu"
        screenOptions={{
          headerShown: false,
          cardStyle:   { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="MainMenu" component={MainMenuScreen} />
        <Stack.Screen name="Travel"   component={TravelScreen}   />
        <Stack.Screen name="Event"    component={EventScreen}    />
        <Stack.Screen name="GameOver" component={GameOverScreen} />
        <Stack.Screen name="Win"      component={WinScreen}      />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
