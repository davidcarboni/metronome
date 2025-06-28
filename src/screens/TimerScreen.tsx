import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import CircularProgress from '../components/CircularProgress';

const TimerScreen = () => {
  const { duration: durationString } = useLocalSearchParams();
  const duration = Number(durationString);
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [breakTextColor, setBreakTextColor] = useState('white');

  const soundObjects = useRef<{
    tick: Audio.Sound | null;
    tock: Audio.Sound | null;
    heartbeat: Audio.Sound | null;
  }>({
    tick: null,
    tock: null,
    heartbeat: null,
  }).current;

  const [soundsLoaded, setSoundsLoaded] = useState(false);

  useEffect(() => {
    const loadSounds = async () => {
      try {
        const { sound: tick } = await Audio.Sound.createAsync(
          require('../../assets/sounds/tick.mp3')
        );
        soundObjects.tick = tick;

        const { sound: tock } = await Audio.Sound.createAsync(
          require('../../assets/sounds/tock.mp3')
        );
        soundObjects.tock = tock;

        const { sound: heartbeat } = await Audio.Sound.createAsync(
          require('../../assets/sounds/heartbeat.mp3')
        );
        soundObjects.heartbeat = heartbeat;

        setSoundsLoaded(true);
      } catch (error) {
        console.error('Error loading sounds', error);
      }
    };

    loadSounds();

    return () => {
      soundObjects.tick?.unloadAsync();
      soundObjects.tock?.unloadAsync();
      soundObjects.heartbeat?.unloadAsync();
    };
  }, []);

  useEffect(() => {
    let interval: number | null = null;
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
        soundObjects.heartbeat?.stopAsync();
        setIsBreak(false);
        setTimeLeft(duration);
      } else {
        soundObjects.tick?.stopAsync();
        soundObjects.tock?.stopAsync();
        setIsBreak(true);
        setTimeLeft(6);
      }
    }

    if (isActive && soundsLoaded) {
      if (isBreak) {
        if (timeLeft === 5) {
          soundObjects.heartbeat?.playFromPositionAsync(0);
        }
      } else {
        if (timeLeft % 5 === 0) {
          soundObjects.tock?.playFromPositionAsync(0);
        } else {
          soundObjects.tick?.playFromPositionAsync(0);
        }
      }
    } else if (soundsLoaded) {
      soundObjects.tick?.stopAsync();
      soundObjects.tock?.stopAsync();
      soundObjects.heartbeat?.stopAsync();
    }
  }, [timeLeft, isActive, isBreak, duration, soundsLoaded, soundObjects]);

  useEffect(() => {
    let interval: number | null = null;
    if (isBreak) {
      interval = setInterval(() => {
        setBreakTextColor((prev) => (prev === 'white' ? 'black' : 'white'));
      }, 500);
    } else {
      setBreakTextColor('white');
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isBreak]);

  useEffect(() => {
    if (isActive) {
      activateKeepAwakeAsync();
    } else {
      deactivateKeepAwake();
    }
    return () => {
      deactivateKeepAwake();
    };
  }, [isActive]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const stopTimer = () => {
    setIsActive(false);
    router.back();
  };

  const progress = isBreak ? 100 : (timeLeft / duration) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        <CircularProgress progress={progress} size={220} />
        <View style={styles.timerTextContainer}>
          {isBreak ? (
            <Text style={[styles.breakText, { color: breakTextColor }]}>
              {timeLeft}
            </Text>
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
      {/* <View style={styles.roundsContainer}>
        <Text style={styles.roundsText}>
          round
        </Text>
        <Text style={styles.roundsCount}>
          {roundsCount}
        </Text>
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    // flexDirection: 'row',
  },
  timerContainer: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerTextContainer: {
    position: 'absolute',
  },
  timerText: {
    fontSize: 120,
    color: '#fff',
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  breakText: {
    fontSize: 120,
    color: '#fff',
    fontWeight: 'bold',
  },
  controlsContainer: {
    flexDirection: 'row',
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: 'red',
    // paddingBottom: 20,
  },
  // roundsContainer: {
  //   marginTop: 40,
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   padding: 20,
  //   // backgroundColor: 'red',
  //   height: '100%',
  // },
  // roundsText: {
  //   fontSize: 60,
  //   color: '#fff',
  //   fontWeight: 'bold',
  //   fontVariant: ['tabular-nums'],
  // },
  // roundsCount: {
  //   fontSize: 80,
  //   color: '#fff',
  //   fontWeight: 'bold',
  //   fontVariant: ['tabular-nums'],
  // },
});

export default TimerScreen;