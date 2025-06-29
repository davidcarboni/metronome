import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAudioPlayer } from 'expo-audio';
import { Ionicons } from '@expo/vector-icons';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import CircularProgress from '../components/CircularProgress';

const tickSound = require('../../assets/sounds/tick.mp3');
const tockSound = require('../../assets/sounds/tock.mp3');
const singingBowlSound = require('../../assets/sounds/singing-bowl.mp3');

const TimerScreen = () => {
  const tickPlayer = useAudioPlayer(tickSound);
  const tockPlayer = useAudioPlayer(tockSound);
  const singingBowlPlayer = useAudioPlayer(singingBowlSound);

  const { duration: durationString } = useLocalSearchParams();
  const duration = Number(durationString);
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [breakTextColor, setBreakTextColor] = useState('white');

  const tick = () => {
    tickPlayer.seekTo(0);
    tickPlayer.play();
  };
  const tock = () => {
    tockPlayer.seekTo(0);
    tockPlayer.play();
  };
  const singingBowl = () => {
    singingBowlPlayer.seekTo(0);
    tockPlayer.volume = 0.3;
    singingBowlPlayer.play();
  };

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
        setIsBreak(false);
        setTimeLeft(duration);
      } else {
        // soundObjects.tick?.stopAsync();
        // soundObjects.tock?.stopAsync();
        // soundObjects.singingBowl?.stopAsync();
        setIsBreak(true);
        setTimeLeft(6);
      }
    }

    if (isActive && !isBreak) {
      if (timeLeft === 5) {
        singingBowl();
      }
      const elapsedSeconds = duration - timeLeft;
      if (elapsedSeconds > 0) {
        // 0-indexed second in a 5-second cycle (0, 1, 2, 3, 4)
        const secondInCycle = (elapsedSeconds - 1) % 5;
        if (secondInCycle < 2) {
          // This covers the 1st and 2nd seconds of the cycle
          tick();
        } else {
          // This covers the 3rd, 4th, and 5th seconds
          tock();
        }
      }
    } //else if (soundsLoaded) {
    // tick.stop();
    // tock.stop();
    // soundObjects.singingBowl?.stopAsync();
    // }
  }, [timeLeft, isActive, isBreak, duration]);

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