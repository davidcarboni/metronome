import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export type RootStackParamList = {
  Home: undefined;
  Timer: { duration: number; };
};

export default function RootLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="timer" />
      </Stack>
    </SafeAreaView>
  );
}
