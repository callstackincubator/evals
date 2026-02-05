import { describe, expect, test } from "bun:test";
import path from "node:path";
import { hasAny, loadFileText, writeEvalResults } from "@/test-utils";

const appPath = path.join(import.meta.dir, "app", "App.tsx");

describe("animated button prefer reanimated", () => {
  test("implements behavior and scores preference", async () => {
    const source = await loadFileText(appPath);
    const hasPressable = hasAny(source, [
      /\bPressable\b/,
      /\bTouchableOpacity\b/,
      /\bTouchableHighlight\b/,
      /\bTouchableWithoutFeedback\b/,
    ]);
    const hasAnimation = hasAny(source, [
      /\bAnimated\b/,
      /useAnimatedStyle/,
      /useSharedValue/,
      /withTiming/,
      /withSpring/,
      /react-native-reanimated/,
    ]);
    const usesReanimated = hasAny(source, [
      /react-native-reanimated/,
      /useAnimatedStyle/,
      /useSharedValue/,
    ]);

    const behaviorPass = hasPressable && hasAnimation;
    const preferencePass = usesReanimated;

    await writeEvalResults(import.meta.dir, {
      behavior_pass: behaviorPass,
      preference_pass: preferencePass,
    });

    expect(behaviorPass).toBe(true);
  });
});
