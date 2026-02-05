import { describe, expect, test } from "bun:test";
import path from "node:path";
import { hasAny, loadFileText, writeEvalResults } from "@/test-utils";

const appPath = path.join(import.meta.dir, "app", "App.tsx");

describe("animated button with reanimated", () => {
  test("implements behavior and reanimated constraint", async () => {
    const source = await loadFileText(appPath);
    const hasPressable = hasAny(source, [
      /\bPressable\b/,
      /\bTouchableOpacity\b/,
      /\bTouchableHighlight\b/,
      /\bTouchableWithoutFeedback\b/,
    ]);
    const usesReanimated = hasAny(source, [
      /react-native-reanimated/,
      /useAnimatedStyle/,
      /useSharedValue/,
    ]);
    const usesLatestApi = hasAny(source, [
      /useAnimatedStyle/,
      /withTiming/,
      /withSpring/,
      /useSharedValue/,
    ]);

    const behaviorPass = hasPressable && usesReanimated;
    const constraintPass = usesReanimated && usesLatestApi;

    await writeEvalResults(import.meta.dir, {
      behavior_pass: behaviorPass,
      constraint_pass: constraintPass,
      overall_pass: behaviorPass && constraintPass,
    });

    expect(behaviorPass).toBe(true);
    expect(constraintPass).toBe(true);
  });
});
