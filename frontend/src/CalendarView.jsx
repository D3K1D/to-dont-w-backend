import React, { useState } from "react";

export default function CalendarView({ tasksByDate, setTasksByDate }) {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(formatDate(today));

  const daysOfWeek = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - today.getDay() + i);
    return date;
  });

  function formatDate(date) {
    return date.toISOString().split("T")[0]; // 'YYYY-MM-DD'
  }

  function addTask(task) {
    setTasksByDate((prev) => {
      const updated = { ...prev };
      if (!updated[selectedDate]) updated[selectedDate] = [];
      updated[selectedDate].push(task);
      return updated;
    });
  }

  return (
    <div
      className="p-4"
      style={{ backgroundColor: "#f5f1eb", minHeight: "100vh" }}
    >
      <div className="grid grid-cols-7 gap-2 mb-4 text-sm font-medium text-center">
        {daysOfWeek.map((date, i) => {
          const formatted = formatDate(date);
          const isSelected = formatted === selectedDate;
          return (
            <button
              key={i}
              onClick={() => setSelectedDate(formatted)}
              className={`p-2 rounded-lg border ${
                isSelected
                  ? "bg-black text-white"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
              style={{ borderColor: "#000" }}
            >
              {date.toLocaleDateString("en-US", {
                weekday: "short",
                day: "numeric",
              })}
            </button>
          );
        })}
      </div>

      <div>
        <h2 className="text-lg font-bold text-black mb-2">
          Tasks for {selectedDate}
        </h2>
        <ul className="mb-3 text-sm list-disc list-inside text-black">
          {(tasksByDate[selectedDate] || []).map((task, i) => (
            <li key={i}>{task}</li>
          ))}
        </ul>
        <AddTaskForm onAdd={addTask} />
      </div>
    </div>
  );
}

function AddTaskForm({ onAdd }) {
  const [input, setInput] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (input.trim()) {
      onAdd(input.trim());
      setInput("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        className="flex-1 p-2 border border-black rounded text-black"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Don't forget to..."
      />
      <button
        className="bg-black text-white px-3 py-2 rounded hover:bg-gray-800"
        type="submit"
      >
        Add
      </button>
    </form>
  );
}
