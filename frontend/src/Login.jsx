import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [isRegistering, setIsRegistering] = useState(true);
  const [msg, setMsg] = useState({ text: '', type: null }); // type: 'success' | 'error'

  const API_URL = 'http://127.0.0.1:8000';

  // ───────────────── helpers ─────────────────
  const validatePassword = () => {
    if (password !== password2) {
      setMsg({ text: 'Passwords do not match.', type: 'error' });
      return false;
    }
    return true;
  };

  // ───────────────── submit ─────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ text: '', type: null });

    if (isRegistering && !validatePassword()) return;

    const url = isRegistering
      ? `${API_URL}/api/auth/registration/`
      : `${API_URL}/api/auth/login/`;

    const bodyPayload = isRegistering
      ? { username, email, password1: password, password2 }
      : { username, password };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      const isJson = (response.headers.get('content-type') || '')
        .includes('application/json');
      const data = isJson ? await response.json() : null;

      if (!response.ok) {
        const msgText = data
          ? Object.values(data).flat().join(' ')
          : `Server error (${response.status})`;
        throw new Error(msgText);
      }

      if (isRegistering) {
        setIsRegistering(false);
        setMsg({ text: 'Registration successful! Please log in.', type: 'success' });
      } else if (data && data.key) {
        localStorage.setItem('authToken', data.key);
        onLogin(data.key);
      }
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    }
  };

  // ───────────────── render ─────────────────
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#f5f1eb' }}
    >
      <div className="p-8 rounded-lg shadow-lg bg-white w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {isRegistering ? 'Register Account' : 'Log In'}
        </h2>

        <form onSubmit={handleSubmit}>
          {msg.text && (
            <p
              className={`text-sm mb-4 text-center ${
                msg.type === 'success' ? 'text-green-600' : 'text-red-500'
              }`}
            >
              {msg.text}
            </p>
          )}

          {/* username */}
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="username"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          {/* email only for registration */}
          {isRegistering && (
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
          )}

          {/* password */}
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          {/* confirm password only for registration */}
          {isRegistering && (
            <>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="password2"
                >
                  Confirm Password
                </label>
                <input
                  id="password2"
                  type="password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="text-xs p-2 rounded mb-4 text-gray-600 bg-gray-100">
                <p className="font-semibold">Password must contain:</p>
                <ul className="list-disc list-inside ml-2">
                  <li>At least 8 characters</li>
                </ul>
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-gray-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-800 transition"
          >
            {isRegistering ? 'Register' : 'Log In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          {isRegistering ? 'Already have an account?' : "Don't have an account?"}
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setMsg({ text: '', type: null });
            }}
            className="font-bold text-gray-700 hover:underline ml-1"
          >
            {isRegistering ? 'Log In' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  );
}
