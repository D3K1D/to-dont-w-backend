import React, { useEffect, useState } from "react";

export default function ToDontList({
  date,
  tasks,
  openModal,
  goBack,
  toggleDone,
  removeTask,
}) {
  const [jumpingTasks, setJumpingTasks] = useState([]);

  const formattedDate = new Date(date).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"

      const jumping = tasks
        .filter(
          (task) =>
            Array.isArray(task.reminders) &&
            task.reminders.includes(currentTime)
        )
        .map((task) => task.id);

      if (jumping.length > 0 && navigator.vibrate) {
        navigator.vibrate([200]);
      }

      setJumpingTasks(jumping);
    }, 30000); // check every 30s

    return () => clearInterval(interval);
  }, [tasks]);

  return (
    <div
      className="max-w-md mx-auto p-4"
      style={{ backgroundColor: "#f5f1eb", minHeight: "100vh" }}
    >
      {/* Back Button */}
      <button
        onClick={goBack}
        className="mb-4 px-3 py-1 rounded border"
        style={{
          borderColor: "#000",
          color: "#000",
          backgroundColor: "#f5f1eb",
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#e5e5e5")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#f5f1eb")}
      >
        ← Back
      </button>

      {/* Heading */}
      <h2 className="text-2xl font-bold mb-2 text-black">Daily To-Do List</h2>
      <h3 className="text-lg text-gray-600 mb-4">{formattedDate}</h3>

      {/* Add Task Button */}
      <button
        onClick={() => openModal(date, 9)}
        className="mb-4 px-4 py-2 rounded text-white"
        style={{ backgroundColor: "#000" }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#333")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#000")}
      >
        + Add Task
      </button>

      {/* Empty Message */}
      {tasks.length === 0 && (
        <div className="text-center py-12">
          <div className="speech-bubble">"I'm waiting..."</div>
          <p className="text-xl font-semibold text-black mb-2">
            Procrastination level: Expert
          </p>
          <p className="text-base text-gray-600 mb-4">
            Not a single thing on your don't-do list!
          </p>
          <div className="text-sm text-gray-500 italic">
            Time to reluctantly add a task?
          </div>
        </div>
      )}

      {/* Task List */}
      <ul className="space-y-3">
        {tasks.map((task, idx) => (
          <li
            key={idx}
            id={`task-${task.id}`}
            className={`flex justify-between items-center p-3 rounded border transition-all ${
              jumpingTasks.includes(task.id) ? "animate-bounce" : ""
            }`}
            style={{
              backgroundColor: task.color || "#ffffff",
              borderColor: "#000",
            }}
          >
            {/* Task Content */}
            <div
              onClick={() => openModal(date, parseInt(task.start), idx, task)}
              className="cursor-pointer flex-1"
            >
              <div
                className="flex items-center gap-2"
                style={{
                  color: task.color === "#000000" ? "#ffffff" : "#000000",
                }}
              >
                <span
                  className={`${
                    task.done ? "line-through" : ""
                  } break-words whitespace-normal`}
                >
                  {task.title}
                  {task.recurrence?.length > 0 && (
                    <span className="ml-1" style={{ color: "green" }}>
                      ♻️
                    </span>
                  )}{" "}
                  ({task.start} - {task.end})
                </span>
                {task.priority && (
                  <span
                    className="ml-2 px-2 py-0.5 text-xs rounded"
                    style={{
                      backgroundColor:
                        task.priority === "High"
                          ? "#dc2626"
                          : task.priority === "Medium"
                          ? "#facc15"
                          : "#10b981",
                      color: task.priority === "Medium" ? "#000" : "#fff",
                    }}
                  >
                    {task.priority}
                  </span>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="ml-2 flex-shrink-0 space-x-1">
              <button
                onClick={() => toggleDone(task.id)}
                className="text-green-700 hover:text-green-900 text-lg"
                title="Mark Complete"
              >
                ✔
              </button>
              <button
                onClick={() => removeTask(task.id)}
                className="text-red-600 hover:text-red-800 text-lg"
                title="Delete Task"
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
