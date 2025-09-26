import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { USE_MOCK_API } from "../utils/mockAPI";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isRegisterMode) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      navigate("/");
    } catch (err) {
      setError(err.message || `${isRegisterMode ? 'Registration' : 'Login'} failed`);
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setError("");
    setName("");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="w-full max-w-sm bg-white p-8 rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {isRegisterMode ? 'Festie Admin Register' : 'Festie Admin Login'}
      </h2>
      {USE_MOCK_API && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 mb-4 text-sm">
          <strong>Development Mode:</strong> Using mock API
        </div>
      )}
      {!USE_MOCK_API && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-3 mb-4 text-sm">
          <strong>Live Mode:</strong> Connected to database
        </div>
      )}
      {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegisterMode && (
          <input
            className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <input
          className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
          type="submit"
        >
          {isRegisterMode ? 'Register' : 'Login'}
        </button>
      </form>
      <div className="mt-4 text-center">
        <button
          onClick={toggleMode}
          className="text-blue-600 hover:underline text-sm"
        >
          {isRegisterMode 
            ? 'Already have an account? Login' 
            : "Don't have an account? Register"}
        </button>
      </div>
      <div className="mt-2 text-center text-sm text-gray-600">
        {isRegisterMode 
          ? 'Create a new admin account' 
          : 'Admin panel access only'}
      </div>
    </div>
  );
};

export default Login;
