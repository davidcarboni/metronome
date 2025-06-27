import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../App';
import CircularProgress from '../components/CircularProgress';

type Props = NativeStackScreenProps<RootStackParamList, 'Timer'>;

const TimerScreen = ({ route, navigation }: Props) => {
  const { duration } = route.params;
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  const tickSound = useRef(new Audio.Sound());
  const tockSound = useRef(new Audio.Sound());
  const heartbeatSound = useRef(new Audio.Sound());

  useEffect(() => {
    const loadSounds = async () => {
      try {
        await tickSound.current.loadAsync(require('../../assets/sounds/tick.mp3'));
        await tockSound.current.loadAsync(require('../../assets/sounds/tock.mp3'));
        await heartbeatSound.current.loadAsync(require('../../assets/sounds/heartbeat.mp3'));
      } catch (error) {
        console.error("Error loading sounds", error);
      }
    };

    loadSounds();

    return () => {
      tickSound.current.unloadAsync();
      tockSound.current.unloadAsync();
      heartbeatSound.current.unloadAsync();
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else {
      if (interval) {
        clearInterval(interval);
      }
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive]);

  useEffect(() => {
    if (timeLeft === 0) {
      if (isBreak) {
        setIsBreak(false);
        setTimeLeft(duration);
      } else {
        setIsBreak(true);
        setTimeLeft(5);
      }
    }

    if (isActive) {
      if (isBreak) {
        heartbeatSound.current.replayAsync();
      } else {
        if (timeLeft % 10 === 0) {
          tockSound.current.replayAsync();
        } else {
          tickSound.current.replayAsync();
        }
      }
    }
  }, [timeLeft, isActive, isBreak, duration]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const stopTimer = () => {
    setIsActive(false);
    navigation.goBack();
  };

  const progress = isBreak ? 100 : (timeLeft / duration) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        <CircularProgress progress={progress} />
        <View style={styles.timerTextContainer}>
          {isBreak ? (
            <Text style={styles.breakText}>BREAK</Text>
          ) : (
            <Text style={styles.timerText}>{timeLeft}</Text>
          )}
        </View>
      </View>
      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={toggleTimer}>
          <Ionicons
            name={isActive ? 'pause-circle' : 'play-circle'}
            size={80}
            color="white"
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={stopTimer}>
          <Ionicons name="stop-circle" size={80} color="white" />
        </TouchableOpacity>
      </View>
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
  timerContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerTextContainer: {
    position: 'absolute',
  },
  timerText: {
    fontSize: 80,
    color: '#fff',
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  breakText: {
    fontSize: 60,
    color: '#fff',
    fontWeight: 'bold',
  },
  controlsContainer: {
    flexDirection: 'row',
    marginTop: 40,
  },
});

export default TimerScreen;