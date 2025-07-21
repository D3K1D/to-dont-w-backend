import React, { useEffect, useState } from "react";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatHour(hour) {
  const ampm = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}:00 ${ampm}`;
}

function formatDate(baseDate, dayIndex) {
  const d = new Date(baseDate);
  const diff = dayIndex - d.getDay();
  d.setDate(d.getDate() + diff);
  return d;
}

function formatMonthDay(date) {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export default function WeeklyPlanner({
  tasksByDate,
  openModal,
  onComplete,
  onDelete,
}) {
  const [jumpingIds, setJumpingIds] = useState([]);
  const today = new Date();

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"
      const allTasks = Object.values(tasksByDate).flat();

      const jumping = allTasks
        .filter(
          (task) =>
            Array.isArray(task.reminders) &&
            task.reminders.includes(currentTime)
        )
        .map((task) => task.id);

      if (jumping.length > 0 && navigator.vibrate) {
        navigator.vibrate([200]);
      }

      setJumpingIds(jumping);
    }, 30000);

    return () => clearInterval(interval);
  }, [tasksByDate]);

  function taskOccursOnDate(task, dateObj) {
    if (task.date === dateObj.toISOString().split("T")[0]) return true;

    let recurrenceArr = [];
    if (Array.isArray(task.recurrence)) {
      recurrenceArr = task.recurrence;
    } else if (
      typeof task.recurrence === "string" &&
      task.recurrence.length > 0
    ) {
      recurrenceArr = task.recurrence.split(",").map((s) => s.trim());
    }

    if (recurrenceArr.length > 0) {
      const weekday = DAYS[dateObj.getDay()];
      return recurrenceArr.includes(weekday);
    }
    return false;
  }

  return (
    <div className="overflow-auto rounded-lg max-h-[80vh] overflow-x-auto">
      {/* Header */}
      <div
        className="grid sticky top-0 z-10 bg-[#f5f1eb] border-b border-black"
        style={{
          gridTemplateColumns: "100px repeat(7, minmax(150px, 1fr))",
        }}
      >
        <div className="p-2 bg-[#f5f1eb] border-r border-black"></div>
        {DAYS.map((day, dayIndex) => {
          const dateObj = formatDate(today, dayIndex);
          return (
            <div
              key={day}
              className="p-2 text-center font-semibold text-black border-r border-black"
            >
              {day} ({formatMonthDay(dateObj)})
            </div>
          );
        })}
      </div>

      {/* Grid */}
      <div
        className="grid bg-grid-pattern"
        style={{ gridTemplateColumns: "100px repeat(7, minmax(150px, 1fr))" }}
      >
        <div className="flex flex-col bg-[#f5f1eb] border-r border-black">
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="min-h-[48px] text-xs flex items-center justify-center text-black select-none border-b border-black"
            >
              {formatHour(hour)}
            </div>
          ))}
        </div>

        {DAYS.map((day, dayIndex) => {
          const colDateObj = formatDate(today, dayIndex);
          const colDate = colDateObj.toISOString().split("T")[0];
          const tasksForDay = Object.values(tasksByDate)
            .flat()
            .filter((task) => taskOccursOnDate(task, colDateObj));

          return (
            <div key={day} className="flex flex-col border-r border-black">
              {HOURS.map((hour) => {
                const tasksHere = tasksForDay.filter((task) => {
                  const startHour = parseInt(task.start.split(":")[0], 10);
                  const endHour = parseInt(task.end.split(":")[0], 10);
                  return hour >= startHour && hour < endHour;
                });

                return (
                  <div
                    key={hour}
                    className="min-h-[48px] p-1 text-xs bg-white text-black border-b border-black"
                  >
                    {tasksHere.length > 0 ? (
                      tasksHere.map((task, idx) => {
                        const startHour = parseInt(
                          task.start.split(":")[0],
                          10
                        );
                        const isBlackBg =
                          task.color?.toLowerCase() === "#000000" ||
                          task.color?.toLowerCase() === "black";

                        const priorityColor =
                          task.priority === "High"
                            ? "bg-red-600 text-white"
                            : task.priority === "Medium"
                            ? "bg-yellow-400 text-black"
                            : "bg-green-500 text-white";

                        return (
                          <div
                            key={idx}
                            id={`task-${task.id}`}
                            style={{
                              backgroundColor: task.color || "#e9d5ff",
                              color: isBlackBg ? "#ffffff" : "#000000",
                            }}
                            className={`mb-0.5 font-semibold rounded px-1 py-0.5 hover:opacity-90 cursor-pointer flex flex-col items-start ${
                              jumpingIds.includes(task.id)
                                ? "animate-bounce"
                                : ""
                            }`}
                          >
                            <button
                              onClick={() =>
                                openModal(
                                  colDate,
                                  startHour,
                                  tasksForDay.indexOf(task),
                                  task
                                )
                              }
                              className="text-left w-full whitespace-normal break-words flex items-center gap-1"
                              type="button"
                              title={task.notes}
                            >
                              <span>{task.title}</span>
                              {task.recurrence?.length > 0 && (
                                <span className="ml-1 text-green-600">♻️</span>
                              )}
                              {task.priority && (
                                <span
                                  className={`text-xs font-semibold px-1 rounded ${priorityColor}`}
                                >
                                  {task.priority}
                                </span>
                              )}
                            </button>

                            <div className="flex gap-1 mt-1">
                              <button
                                onClick={() =>
                                  onComplete?.(
                                    colDate,
                                    tasksForDay.indexOf(task)
                                  )
                                }
                                className="px-2 py-0.5 rounded bg-black text-white hover:bg-gray-800 text-xs"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() =>
                                  onDelete?.(colDate, tasksForDay.indexOf(task))
                                }
                                className="px-2 py-0.5 rounded bg-red-600 text-white hover:bg-red-700 text-xs"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <button
                        onClick={() => openModal(colDate, hour)}
                        className="w-full h-full cursor-pointer"
                        aria-label="Add task"
                        type="button"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
