import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TimerStep } from "../../utils/lessonTypes";
import { TimeModal } from "../modals/TimeModal";

interface Props {
  step: TimerStep;
}

export default function Timer({ step }: Props) {
  const [isActive, setIsActive] = useState(false);
  const [duration, setDuration] = useState(step.duration);
  const [seconds, setSeconds] = useState(duration);
  const [currentSet, setCurrentSet] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const totalSets = step.sets || 1;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate progress smoothly over 1 second to match the state update
    Animated.timing(progressAnim, {
      toValue: (duration - seconds) / duration,
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: false, // 'width' is not supported by the native driver
    }).start();

    let interval: any = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((s) => s - 1);
      }, 1000);
    } else if (isActive && seconds === 0) {
      setIsActive(false); // Automatically pause when a set is finished
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds, duration]);

  const toggle = () => {
    setIsActive(!isActive);
  };

  const reset = () => {
    progressAnim.setValue(0);
    setSeconds(duration);
    setCurrentSet(1);
    setIsActive(false);
  };

  const handleNextSet = () => {
    if (currentSet < totalSets) {
      setCurrentSet((c) => c + 1);
      setSeconds(duration);
      setIsActive(false);
      progressAnim.setValue(0);
    }
  };

  const handleSaveTime = (newDuration: number) => {
    setDuration(newDuration);
    setSeconds(newDuration);
    progressAnim.setValue(0);
  };

  const formatTime = (timeInSeconds: number) => {
    const mins = Math.floor(timeInSeconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (timeInSeconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const canPlay = seconds > 0;
  const canGoToNextSet = currentSet < totalSets && !isActive && seconds === 0;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.timerContainer}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.timerText}>{formatTime(seconds)}</Text>
        {totalSets > 1 && (
          <Text style={styles.setsText}>
            Set {currentSet} of {totalSets}
          </Text>
        )}
      </TouchableOpacity>

      <View style={styles.progressBar}>
        <Animated.View
          style={[styles.progressFill, { width: progressWidth }]}
        />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.buttonSecondary} onPress={reset}>
          <Ionicons name="refresh" size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, !canPlay && styles.buttonDisabled]}
          onPress={toggle}
          disabled={!canPlay}
        >
          <Ionicons name={isActive ? "pause" : "play"} size={32} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.buttonSecondary,
            !canGoToNextSet && styles.buttonDisabled,
          ]}
          onPress={handleNextSet}
          disabled={!canGoToNextSet}
        >
          <Ionicons name="play-skip-forward" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
      <TimeModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSaveTime}
        initialValue={duration}
        timeOptions={step.timeOptions}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  timerContainer: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  timerText: {
    color: "#fff",
    fontSize: 56,
    fontWeight: "600",
  },
  setsText: {
    color: "#666",
    fontSize: 20,
    fontWeight: "600",
    marginTop: 8,
  },
  progressBar: {
    width: "80%",
    height: 8,
    backgroundColor: "#222",
    borderRadius: 4,
    marginBottom: 40,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#9ACD32",
    borderRadius: 4,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  button: {
    backgroundColor: "#9ACD32",
    borderRadius: 50,
    padding: 20,
    marginHorizontal: 15,
  },
  buttonSecondary: {
    backgroundColor: "#222",
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 15,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
});
