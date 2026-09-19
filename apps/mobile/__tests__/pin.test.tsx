import { fireEvent, render, screen } from "@testing-library/react-native";
import { newChildProgress } from "@coaching/core";
import { useApp } from "@/lib/store";

jest.mock("expo-router", () => ({ router: { replace: jest.fn(), back: jest.fn(), push: jest.fn() }, useLocalSearchParams: () => ({ childId: "c1" }) }));
jest.mock("expo-haptics", () => ({ selectionAsync: jest.fn(async () => {}) }));
import Pin from "../app/pin/[childId]";
import { router } from "expo-router";

beforeEach(() => {
  useApp.setState({
    children: [{ id: "c1", nickname: "Ava", birthMonth: 1, birthYear: 2016, avatar: { emoji: "🦊", color: "#fff" }, sports: [], equipment: [], spots: [],
      availability: { minutesByDow: [], reminderTime: "17:30" }, dailyGoalXp: 40, difficultyCap: 3, pin: "1234", onboarded: true, progress: newChildProgress(40) }],
    activeChildId: null,
  });
});

test("correct PIN activates child and routes to path", () => {
  render(<Pin />);
  for (const k of ["1", "2", "3", "4"]) fireEvent.press(screen.getByTestId(`key-${k}`));
  expect(useApp.getState().activeChildId).toBe("c1");
  expect(router.replace).toHaveBeenCalledWith("/(kid)/path");
});

test("wrong PIN does not activate child", () => {
  render(<Pin />);
  for (const k of ["9", "9", "9", "9"]) fireEvent.press(screen.getByTestId(`key-${k}`));
  expect(useApp.getState().activeChildId).toBeNull();
});
