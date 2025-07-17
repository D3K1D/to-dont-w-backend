import React, { useState, useEffect } from "react";
import WeeklyPlanner from "./WeeklyPlanner";
import TaskModal from "./TaskModal";
import CategoryEditorModal from "./CategoryEditorModal";
import Login from "./Login"; // Handles login/registration
import ToDontList from "./ToDontList";
import myImage3 from "../image3.png";
import myAnimation1 from "../animation1.gif";

// The address of your Django backend
const API_URL = "http://127.0.0.1:8000";

export default function App() {
  // --- STATE MANAGEMENT ---
  const [authToken, setAuthToken] = useState(localStorage.getItem("authToken"));
  const [tasksByDate, setTasksByDate] = useState({});
  const [savedCategories, setSavedCategories] = useState({});
  const [modalData, setModalData] = useState(null);
  const [view, setView] = useState("main");
  const [dailyDate, setDailyDate] = useState(null);
  const [showCategories, setShowCategories] = useState(false);


  // --- DATA FETCHING from Backend ---
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setAuthToken(null);
    setTasksByDate({});
    setSavedCategories({});
  };

  const fetchData = (token) => {
    if (!token) return;

    // Fetch Tasks for the logged-in user
    fetch(`${API_URL}/api/tasks/`, {
      headers: { Authorization: `Token ${token}` },
    })
    .then(res => {
      if (res.status === 401) handleLogout(); // If token is invalid, log out
      return res.ok ? res.json() : Promise.reject(res);
    })
    .then(tasks => {
        const formatted = {};
        tasks.forEach(task => {
            const taskForState = {
                ...task,
                start: task.start_time.slice(0, 5),
                end: task.end_time.slice(0, 5),
                category: task.category?.name,
                color: task.category?.color,
                reminders: task.reminders ? task.reminders.split(',') : [],
            };
            if (!formatted[task.date]) formatted[task.date] = [];
            formatted[task.date].push(taskForState);
        });
        setTasksByDate(formatted);
    }).catch(() => {});

    // Fetch Categories for the logged-in user
    fetch(`${API_URL}/api/categories/`, {
        headers: { Authorization: `Token ${token}` },
    })
    .then(res => res.ok ? res.json() : Promise.reject(res))
    .then(categories => {
        const formatted = {};
        categories.forEach(cat => {
            formatted[cat.name] = { id: cat.id, color: cat.color };
        });
        setSavedCategories(formatted);
    }).catch(() => {});
  };

  useEffect(() => {
    fetchData(authToken);
  }, [authToken]);


  // --- AUTHENTICATION ---
  const handleLogin = (token) => {
    localStorage.setItem("authToken", token);
    setAuthToken(token);
  };

  
  // --- MODAL AND TASK LOGIC (API-driven) ---
  const openModal = (date, hour, taskIndex = null, task = null) => {
    setModalData({ date, hour, taskIndex, task });
  };

  const closeModal = () => setModalData(null);

  // This function now handles creating a category before creating the task
  const saveTask = async (date, newTask) => {
    const categoryName = newTask.category;
    let categoryId = null;

    // First, check if a category is selected and if it's a new one
    if (categoryName && !savedCategories[categoryName]) {
        try {
            // Create the new category on the backend
            const categoryResponse = await fetch(`${API_URL}/api/categories/`, {
                method: 'POST',
                headers: { "Content-Type": "application/json", Authorization: `Token ${authToken}` },
                body: JSON.stringify({ name: categoryName, color: newTask.color })
            });
            if (!categoryResponse.ok) throw new Error('Failed to create new category');
            
            const newCategory = await categoryResponse.json();
            categoryId = newCategory.id;
        } catch (error) {
            alert(error.message);
            closeModal();
            return; // Stop if category creation fails
        }
    } else if (categoryName) {
        // If it's an existing category, get its ID from the state
        categoryId = savedCategories[categoryName].id;
    }

    // Now, proceed with saving the task with the correct category ID
    const isUpdate = modalData.taskIndex !== null && modalData.task?.id;
    const url = isUpdate ? `${API_URL}/api/tasks/${modalData.task.id}/` : `${API_URL}/api/tasks/`;
    const method = isUpdate ? "PUT" : "POST";

    const payload = {
      title: newTask.title,
      notes: newTask.notes,
      date: date,
      start_time: newTask.start,
      end_time: newTask.end,
      priority: newTask.priority || '',
      recurrence: newTask.recurrence ? newTask.recurrence.join(',') : '',
      reminders: newTask.reminders ? newTask.reminders.join(',') : '',
      category: categoryId,
    };

    try {
        const taskResponse = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json", Authorization: `Token ${authToken}` },
            body: JSON.stringify(payload),
        });

        if (!taskResponse.ok) throw new Error('Failed to save task.');
        
        fetchData(authToken); // Refresh all data from backend
        closeModal();
    } catch (error) {
        alert(error.message);
        closeModal();
    }
  };

  const deleteTask = (date, taskIndex) => {
    const taskToDelete = tasksByDate[date]?.[taskIndex];
    if (!taskToDelete || !taskToDelete.id) return;

    fetch(`${API_URL}/api/tasks/${taskToDelete.id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Token ${authToken}` },
    })
    .then(res => {
        if (res.ok) {
            fetchData(authToken);
        } else {
            alert('Failed to delete task.');
        }
        closeModal();
    });
  };

  // This function is called from the CategoryEditorModal.
  // A full implementation would need to handle creating, updating, and deleting.
  // For now, we'll just refresh the category list from the server.
  const handleCategorySave = () => {
     fetchData(authToken);
  };

  const dailyTasks = dailyDate ? tasksByDate[dailyDate] || [] : [];
  
  // --- RENDER LOGIC ---
  if (!authToken) {
    return <Login onLogin={handleLogin} />;
  }

  if (view === "main") {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-4"
        style={{ backgroundColor: "#f5f1eb", textAlign: "center" }}
      >
        <div style={{ width: "100%", maxWidth: "1200px" }}>
           <button onClick={handleLogout} className="absolute top-4 right-4 px-4 py-2 rounded bg-black text-white hover:bg-gray-800">Logout</button>
          <div style={{ marginBottom: "2rem" }}>
            <h1 className="title-text text-7xl md:text-8xl lg:text-9xl mb-2" style={{ color: "#000" }}>TO-DON'T</h1>
            <img src={myImage3} alt="Cartoon image" className="center-image" />
            <p className="text-2xl md:text-3xl uppercase font-black text-gray-600">YOUR ANTI-TO-DO LIST</p>
          </div>

          <div className="flex gap-8 justify-center flex-wrap mt-4">
            <div className="paper-note rounded-lg" style={{width: "320px", height: "256px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
              onClick={() => {
                const today = new Date().toISOString().split("T")[0];
                setDailyDate(today);
                setView("daily");
              }}
            >
              <h2 className="note-text text-xl text-center leading-relaxed m-0 p-0">MY DAILY<br />PLANNER</h2>
            </div>
            <div className="paper-note rounded-lg" style={{ width: "320px", height: "256px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setView("weekly")}>
              <h2 className="note-text text-xl text-center leading-relaxed m-0 p-0">MY WEEKLY<br />PLANNER</h2>
            </div>
          </div>

          <button onClick={() => setShowCategories(true)} className="mt-8 px-4 py-2 rounded bg-black text-white hover:bg-gray-800">
            Manage Categories
          </button>

          <div className="text-center mt-12">
            <p className="text-lg uppercase font-black text-gray-600">BECAUSE NOBODY ACTUALLY WANTS TO DO CHORES...</p>
          </div>
        </div>

        {showCategories && (
          <CategoryEditorModal savedCategories={savedCategories} setSavedCategories={handleCategorySave} onClose={() => setShowCategories(false)} />
        )}
      </div>
    );
  }

  if (view === "daily") {
    return (
      <div className="min-h-screen bg-[#f5f1eb]">
        <ToDontList
          date={dailyDate}
          tasks={dailyTasks}
          openModal={openModal}
          goBack={() => setView("main")}
          toggleDone={(id) => deleteTask(dailyDate, dailyTasks.findIndex(t => t.id === id))}
          removeTask={(id) => deleteTask(dailyDate, dailyTasks.findIndex(t => t.id === id))}
        />

        {modalData && (
          <TaskModal
            date={modalData.date}
            hour={modalData.hour}
            onClose={closeModal}
            onSave={saveTask}
            onDelete={deleteTask}
            taskToEdit={modalData.task}
            taskIndex={modalData.taskIndex}
            savedCategories={savedCategories}
            // TaskModal no longer needs to set categories directly
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f1eb]">
      <div
        className="p-4 border-b"
        style={{ backgroundColor: "#f5f1eb", borderColor: "#000" }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView("main")}
            className="px-3 py-1 rounded border border-black text-black hover:bg-gray-100"
          >
            ← Back
          </button>

          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-black">Weekly Planner</h1>
            <h2 className="text-xl font-semibold text-black">
              (Click a Date/Time to Add Your Next "To-Don't")
            </h2>
          </div>

          <img
            src={myAnimation1}
            alt="Animated Feather"
            className="center-image"
          />
        </div>
      </div>

      <WeeklyPlanner
        tasksByDate={tasksByDate}
        openModal={openModal}
        onComplete={(date, index) => deleteTask(date, index)}
        onDelete={deleteTask}
      />

      {modalData && (
        <TaskModal
          date={modalData.date}
          hour={modalData.hour}
          onClose={closeModal}
          onSave={saveTask}
          onDelete={deleteTask}
          taskToEdit={modalData.task}
          taskIndex={modalData.taskIndex}
          savedCategories={savedCategories}
           // TaskModal no longer needs to set categories directly
        />
      )}
    </div>
  );
}
