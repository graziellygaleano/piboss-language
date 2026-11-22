import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="worlds" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="levels" />
      <Stack.Screen name="animal-game/present" />
      <Stack.Screen name="animal-game/learn" />
      <Stack.Screen name="animal-game/retain" />
      <Stack.Screen name="animal-game/challenge" />
      <Stack.Screen name="habitat-game/intro" />
      <Stack.Screen name="habitat-game/ecosystem" />
      <Stack.Screen name="habitat-game/filter" />
      <Stack.Screen name="habitat-game/match" />
      <Stack.Screen name="summary" />
    </Stack>
  );
}
