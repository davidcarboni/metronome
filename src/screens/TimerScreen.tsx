import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAudioPlayer } from 'expo-audio';
import { Ionicons } from '@expo/vector-icons';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import CircularProgress from '../components/CircularProgress';

const tickSound = require('../../assets/sounds/tick.mp3');
const tockSound = require('../../assets/sounds/tock.mp3');
const singingBowlSound = require('../../assets/sounds/singing-bowl.mp3');

const TICK_MS = 100;

const TimerScreen = () => {
  const tickPlayer = useAudioPlayer(tickSound);
  const tockPlayer = useAudioPlayer(tockSound);
  const singingBowlPlayer = useAudioPlayer(singingBowlSound);

  const { duration: durationString } = useLocalSearchParams();
  const duration = Number(durationString);
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(6);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(true);
  const [breakTextColor, setBreakTextColor] = useState('white');

  const phaseStartRef = useRef(0);
  const isBreakRef = useRef(isBreak);
  const durationRef = useRef(duration);
  const wasActiveRef = useRef(false);
  const pauseStartedAtRef = useRef<number | null>(null);
  const prevWorkElapsedSecRef = useRef(-1);

  isBreakRef.current = isBreak;
  durationRef.current = duration;

  /** Wall-clock anchor: pause shifts the anchor forward so elapsed time excludes paused intervals. */
  useEffect(() => {
    if (!isActive) {
      if (wasActiveRef.current) {
        pauseStartedAtRef.current = Date.now();
      }
      wasActiveRef.current = false;
      return;
    }
    wasActiveRef.current = true;
    if (pauseStartedAtRef.current !== null) {
      phaseStartRef.current += Date.now() - pauseStartedAtRef.current;
      pauseStartedAtRef.current = null;
    } else {
      phaseStartRef.current = Date.now();
    }
  }, [isActive]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const tick = () => {
      const now = Date.now();
      let limit = isBreakRef.current ? 6 : durationRef.current;

      // Catch up phase transitions without losing fractional seconds (avoids drift at boundaries).
      while (true) {
        const elapsedMs = now - phaseStartRef.current;
        if (elapsedMs < limit * 1000) {
          break;
        }
        phaseStartRef.current += limit * 1000;
        const nextBreak = !isBreakRef.current;
        isBreakRef.current = nextBreak;
        setIsBreak(nextBreak);
        prevWorkElapsedSecRef.current = -1;
        limit = nextBreak ? 6 : durationRef.current;
      }

      const isBreakNow = isBreakRef.current;
      limit = isBreakNow ? 6 : durationRef.current;
      const elapsedSec = Math.floor((now - phaseStartRef.current) / 1000);
      const nextTimeLeft = Math.max(0, limit - elapsedSec);
      setTimeLeft(nextTimeLeft);

      if (!isBreakNow) {
        const workElapsed = Math.floor((now - phaseStartRef.current) / 1000);
        if (workElapsed !== prevWorkElapsedSecRef.current) {
          prevWorkElapsedSecRef.current = workElapsed;

          if (workElapsed === durationRef.current - 4) {
            singingBowlPlayer.seekTo(0);
            tockPlayer.volume = 0.3;
            singingBowlPlayer.play();
          }

          if (workElapsed > 0) {
            const secondInCycle = (workElapsed - 1) % 5;
            if (secondInCycle < 2) {
              tickPlayer.seekTo(0);
              tickPlayer.play();
            } else {
              tockPlayer.seekTo(0);
              tockPlayer.play();
            }
          }
        }
      }
    };

    tick();
    const id = setInterval(tick, TICK_MS);
    return () => clearInterval(id);
  }, [isActive, tickPlayer, tockPlayer, singingBowlPlayer]);

  useEffect(() => {
    let interval: number | NodeJS.Timeout | null = null;
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
    if (!isActive) {
      setIsActive(true);
    } else {
      setIsActive(false);
    }
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
  },
});

export default TimerScreen;
