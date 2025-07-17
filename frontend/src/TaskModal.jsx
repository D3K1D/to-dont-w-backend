import React, { useState, useEffect } from "react";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatTime12(hour) {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  const ampm = hour < 12 ? "AM" : "PM";
  return `${h}:00 ${ampm}`;
}

export default function TaskModal({
  date,
  hour,
  onClose,
  onSave,
  onDelete,
  taskToEdit,
  taskIndex,
  savedCategories,
}) {
  const numericHour =
    typeof hour === "string" ? parseInt(hour.split(":")[0], 10) || 0 : hour || 0;

  // --- State for all form fields ---
  const [title, setTitle] = useState(taskToEdit?.title || "");
  const [startTime, setStartTime] = useState(
    taskToEdit?.start || `${numericHour.toString().padStart(2, "0")}:00`
  );
  const [endTime, setEndTime] = useState(
    taskToEdit?.end || `${Math.min(numericHour + 1, 23).toString().padStart(2, "0")}:00`
  );
  const [notes, setNotes] = useState(taskToEdit?.notes || "");
  
  // This logic is now more robust to handle existing vs. new categories when editing
  const [category, setCategory] = useState(() => taskToEdit?.category && savedCategories[taskToEdit.category] ? taskToEdit.category : "");
  const [customCategory, setCustomCategory] = useState(() => taskToEdit?.category && !savedCategories[taskToEdit.category] ? taskToEdit.category : "");
  const [color, setColor] = useState(taskToEdit?.color || "#f97316");

  const [priority, setPriority] = useState(taskToEdit?.priority || "");
  const [recurrence, setRecurrence] = useState(taskToEdit?.recurrence || []);
  const [reminders, setReminders] = useState(taskToEdit?.reminders || []);

  // --- useEffect hooks for form logic ---
  useEffect(() => {
    if (endTime <= startTime) {
      const startHourNum = parseInt(startTime.split(":")[0], 10);
      const newEnd = `${Math.min(startHourNum + 1, 23).toString().padStart(2, "0")}:00`;
      setEndTime(newEnd);
    }
  }, [startTime]);

  useEffect(() => {
    if (category && savedCategories[category]) {
      setColor(savedCategories[category].color);
    } else if (category === "") {
      setColor("#f97316");
    }
  }, [category, savedCategories]);

  // --- Helper functions ---
  function addReminder() {
    setReminders([...reminders, "09:00"]);
  }

  function updateReminder(index, value) {
    const newReminders = [...reminders];
    newReminders[index] = value;
    setReminders(newReminders);
  }

  function removeReminder(index) {
    setReminders(reminders.filter((_, i) => i !== index));
  }

  function toggleDay(day) {
    setRecurrence((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  // --- Main Submit Handler ---
  function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter a task title");
      return;
    }
    if (endTime <= startTime) {
      alert("End time must be after start time");
      return;
    }

    const finalCategoryName = category === "__custom" ? customCategory.trim() : category;

    const taskData = {
      title: title.trim(),
      start: startTime,
      end: endTime,
      notes: notes.trim(),
      category: finalCategoryName,
      color: color,
      priority: priority,
      recurrence: recurrence,
      reminders: reminders,
    };

    onSave(date, taskData);
  }

  function handleDeleteClick() {
    if (!taskToEdit || taskIndex === null) return;
    const confirmed = window.confirm("Are you sure you want to delete this task?");
    if (confirmed) {
      onDelete(date, taskIndex);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 border border-gray-400 overflow-auto max-h-[90vh]"
      >
        <h2 className="text-xl font-bold mb-4 text-gray-700">
          {taskToEdit ? "Edit Task" : "Add Task"} for {date}
        </h2>

        {/* Title */}
        <label className="block mb-2 text-sm font-semibold text-gray-700">
          Title
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full border border-gray-300 rounded px-2 py-1" required autoFocus />
        </label>

        {/* Time Selectors */}
        <div className="flex gap-4 mb-4">
          <label className="flex-1 flex flex-col text-sm font-semibold text-gray-700">
            Start Time
            <select value={startTime} onChange={(e) => setStartTime(e.target.value)} className="mt-1 border border-gray-300 rounded px-2 py-1">
              {HOURS.map((h) => {
                const value = `${h.toString().padStart(2, "0")}:00`;
                return <option key={h} value={value}>{formatTime12(h)}</option>;
              })}
            </select>
          </label>
          <label className="flex-1 flex flex-col text-sm font-semibold text-gray-700">
            End Time
            <select value={endTime} onChange={(e) => setEndTime(e.target.value)} className="mt-1 border border-gray-300 rounded px-2 py-1">
              {HOURS.map((h) => {
                const value = `${h.toString().padStart(2, "0")}:00`;
                return <option key={h} value={value}>{formatTime12(h)}</option>;
              })}
              <option value="24:00">12:00 AM (next day)</option>
            </select>
          </label>
        </div>

        {/* Notes */}
        <label className="block mb-4 text-sm font-semibold text-gray-700">
          Notes
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-1 w-full border border-gray-300 rounded px-2 py-1 resize-none" />
        </label>

        {/* Category */}
        <label className="block mb-2 text-sm font-semibold text-gray-700">
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full border border-gray-300 rounded px-2 py-1">
            <option value="">-- Select or Create --</option>
            {Object.entries(savedCategories).map(([name]) => (
              <option key={name} value={name}>{name}</option>
            ))}
            <option value="__custom">+ Create New</option>
          </select>
        </label>

        {category === "__custom" && (
          <div className="flex gap-4 items-end mb-4">
            <label className="flex-grow block text-sm font-semibold text-gray-700">
              New Category Name
              <input type="text" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} className="mt-1 w-full border border-gray-300 rounded px-2 py-1" placeholder="e.g. School, Work" />
            </label>
            <label className="block text-sm font-semibold text-gray-700">
              Color
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="mt-1 w-16 h-8 border border-gray-300 rounded" />
            </label>
          </div>
        )}
        
        {/* Reminders */}
        <fieldset className="mb-4">
            <legend className="font-semibold text-gray-700 mb-1">Reminders</legend>
            {reminders.map((reminder, index) => (
                <div key={index} className="flex items-center gap-2 mb-1">
                    <input type="time" value={reminder} onChange={(e) => updateReminder(index, e.target.value)} className="border border-gray-300 rounded px-2 py-1" />
                    <button type="button" onClick={() => removeReminder(index)} className="text-red-500 hover:text-red-700 font-bold">Remove</button>
                </div>
            ))}
            <button type="button" onClick={addReminder} className="text-sm text-blue-600 hover:underline">+ Add Reminder Time</button>
        </fieldset>

        {/* Priority */}
        <label className="block mb-4 text-sm font-semibold text-gray-700">
          Priority
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="mt-1 w-full border border-gray-300 rounded px-2 py-1">
            <option value="">Select priority (optional)</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </label>

        {/* Recurrence */}
        <fieldset className="mb-4">
          <legend className="font-semibold text-gray-700 mb-1">Recurring Days</legend>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((day) => (
              <label key={day} className="flex items-center gap-1 text-sm cursor-pointer select-none">
                <input type="checkbox" checked={recurrence.includes(day)} onChange={() => toggleDay(day)} className="cursor-pointer" />
                {day}
              </label>
            ))}
          </div>
        </fieldset>

        {/* Buttons */}
        <div className="flex justify-between gap-3 pt-4 border-t">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded border border-gray-400 text-gray-600 hover:bg-gray-100">Cancel</button>
          {taskToEdit && (
            <button type="button" onClick={handleDeleteClick} className="px-4 py-2 rounded border border-red-500 text-red-600 hover:bg-red-100">Delete</button>
          )}
          <button type="submit" className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700">Save</button>
        </div>
      </form>
    </div>
  );
}
