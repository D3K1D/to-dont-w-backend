import React, { useState, useEffect } from "react";

export default function CategoryEditorModal({ savedCategories, setSavedCategories, onClose }) {
  const [editedCategories, setEditedCategories] = useState({ ...savedCategories });
  const [editCategory, setEditCategory] = useState(null);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#f97316");

  useEffect(() => {
    setEditedCategories({ ...savedCategories });
  }, [savedCategories]);

  const startEdit = (catName) => {
    setEditCategory(catName);
    setNewName(catName);
    setNewColor(editedCategories[catName]);
  };

  const saveEdit = () => {
    if (!newName.trim()) return;

    setEditedCategories((prev) => {
      const copy = { ...prev };
      if (editCategory !== newName) {
        delete copy[editCategory];
      }
      copy[newName.trim()] = newColor;
      return copy;
    });

    setEditCategory(null);
    setNewName("");
  };

  const handleDelete = (cat) => {
    if (window.confirm(`Delete category "${cat}"? Tasks will keep the name but lose the color.`)) {
      setEditedCategories((prev) => {
        const copy = { ...prev };
        delete copy[cat];
        return copy;
      });
      if (editCategory === cat) {
        setEditCategory(null);
        setNewName("");
      }
    }
  };

  const handleSave = () => {
    setSavedCategories(editedCategories);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 border border-gray-400 max-h-[80vh] overflow-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-700">Edit Categories</h2>

        <ul className="space-y-3 mb-6">
          {Object.entries(editedCategories).map(([cat, color]) => (
            <li
              key={cat}
              className="flex items-center justify-between border border-gray-300 rounded p-2"
            >
              {editCategory === cat ? (
                <>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 flex-grow mr-2"
                  />
                  <input
                    type="color"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="cursor-pointer ml-2"
                    title="Change color"
                  />
                  <button
                    onClick={saveEdit}
                    className="ml-2 px-3 py-1 rounded border border-gray-600 text-gray-700 hover:bg-gray-100"
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <span className="font-semibold flex items-center gap-2">
                    <span
                      className="w-4 h-4 inline-block rounded-full border border-gray-300"
                      style={{ backgroundColor: color }}
                    ></span>
                    {cat}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(cat)}
                      className="px-3 py-1 rounded border border-gray-600 text-gray-700 hover:bg-gray-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="px-3 py-1 rounded border border-red-500 text-red-600 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded border border-gray-400 text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded bg-gray-600 text-white hover:bg-gray-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
