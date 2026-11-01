import HabitTracker from "./habit-tracker";

export default function Home() {
  return (
    <main
      style={{
        width: "100%",
        maxWidth: 560,
        margin: "0 auto",
        padding: "48px 16px",
      }}
    >
      <h1 style={{ marginBottom: 24 }}>Habits</h1>
      <HabitTracker />
    </main>
  );
}
