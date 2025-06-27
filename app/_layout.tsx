import { Stack } from 'expo-router';

export type RootStackParamList = {
  Home: undefined;
  Timer: { duration: number; };
};

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="timer" />
    </Stack>
  );
}
