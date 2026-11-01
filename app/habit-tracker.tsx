"use client";

import { FormEvent, useState, useSyncExternalStore } from "react";
import styles from "./habit-tracker.module.css";

type Habit = {
  id: string;
  name: string;
  doneDates: string[];
};

const STORAGE_KEY = "habits";
const DAYS_SHOWN = 7;

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY) ?? "[]";
}

function getServerSnapshot() {
  return null;
}

function parseHabits(raw: string): Habit[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHabits(habits: Habit[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  listeners.forEach((listener) => listener());
}

// Dates are keyed in local time so a day rolls over at the user's midnight, not UTC's.
function toDateKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function daysAgo(count: number) {
  const date = new Date();
  date.setDate(date.getDate() - count);
  return date;
}

function getStreak(habit: Habit) {
  const done = new Set(habit.doneDates);
  // An unchecked today doesn't break the streak until the day is over.
  let offset = done.has(toDateKey(daysAgo(0))) ? 0 : 1;
  let streak = 0;
  while (done.has(toDateKey(daysAgo(offset)))) {
    streak++;
    offset++;
  }
  return streak;
}

export default function HabitTracker() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [name, setName] = useState("");

  // localStorage and the user's date are unavailable during server rendering.
  if (raw === null) {
    return <p className={styles.empty}>Loading…</p>;
  }

  const habits = parseHabits(raw);
  const days = Array.from({ length: DAYS_SHOWN }, (_, i) =>
    daysAgo(DAYS_SHOWN - 1 - i),
  );

  function addHabit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    saveHabits([
      ...habits,
      { id: crypto.randomUUID(), name: trimmed, doneDates: [] },
    ]);
    setName("");
  }

  function toggleDay(id: string, dateKey: string) {
    saveHabits(
      habits.map((habit) => {
        if (habit.id !== id) return habit;
        const doneDates = habit.doneDates.includes(dateKey)
          ? habit.doneDates.filter((date) => date !== dateKey)
          : [...habit.doneDates, dateKey];
        return { ...habit, doneDates };
      }),
    );
  }

  function deleteHabit(id: string) {
    saveHabits(habits.filter((habit) => habit.id !== id));
  }

  return (
    <>
      <form className={styles.form} onSubmit={addHabit}>
        <input
          className={styles.input}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="New habit, e.g. Read 10 pages"
          aria-label="New habit name"
          maxLength={60}
        />
        <button className={styles.addButton} type="submit">
          Add
        </button>
      </form>

      {habits.length === 0 ? (
        <p className={styles.empty}>No habits yet. Add your first one above.</p>
      ) : (
        <ul className={styles.list}>
          {habits.map((habit) => {
            const streak = getStreak(habit);
            return (
              <li className={styles.habit} key={habit.id}>
                <div className={styles.habitHeader}>
                  <span className={styles.habitName}>{habit.name}</span>
                  <span className={styles.streak}>
                    {streak} day{streak === 1 ? "" : "s"} streak
                  </span>
                  <button
                    className={styles.deleteButton}
                    type="button"
                    onClick={() => deleteHabit(habit.id)}
                    aria-label={`Delete ${habit.name}`}
                  >
                    ×
                  </button>
                </div>
                <div className={styles.days}>
                  {days.map((day) => {
                    const dateKey = toDateKey(day);
                    const label = day.toLocaleDateString(undefined, {
                      weekday: "short",
                    });
                    return (
                      <label className={styles.day} key={dateKey}>
                        <span className={styles.dayLabel}>{label}</span>
                        <input
                          className={styles.checkbox}
                          type="checkbox"
                          checked={habit.doneDates.includes(dateKey)}
                          onChange={() => toggleDay(habit.id, dateKey)}
                          aria-label={`${habit.name} on ${day.toLocaleDateString()}`}
                        />
                      </label>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
