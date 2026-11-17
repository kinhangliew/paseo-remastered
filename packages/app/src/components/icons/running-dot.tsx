import { View } from "react-native";
import { type RunningDotProps, runningDotRingStyle, runningDotStyles } from "./running-dot-styles";

/** Native running dot. It holds still; the breathing ring arrives with the motion pass. */
export function RunningDot({ backdrop }: RunningDotProps) {
  return (
    <View style={runningDotStyles.anchor} testID="running-dot">
      <View style={[runningDotStyles.dot, runningDotRingStyle(backdrop)]} />
    </View>
  );
}
