import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const HomeScreen = () => {
  const router = useRouter();

  const navigateToTimer = (duration: number) => {
    router.push({ pathname: '/timer', params: { duration } });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Interval</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigateToTimer(30)}
      >
        <Text style={styles.buttonText}>30 Seconds</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigateToTimer(60)}
      >
        <Text style={styles.buttonText}>60 Seconds</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#fff',
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginVertical: 10,
  },
  buttonText: {
    color: '#000',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default HomeScreen;