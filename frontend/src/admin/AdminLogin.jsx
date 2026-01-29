import React, { useState } from "react";
import api, { setAuthToken } from "../api/axios";
import { saveTokens } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const resp = await api.post("/token/", { username, password });
      const data = resp.data;
      saveTokens(data);
      setAuthToken(data.access);
      navigate("/admin/dashboard");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || "Login failed");
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl mb-4">Admin Login</h2>
      <form onSubmit={submit} className="space-y-4">
        <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="username" className="w-full p-2 border rounded" />
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" type="password" className="w-full p-2 border rounded" />
        <button className="px-4 py-2 bg-blue-600 text-white rounded">Login</button>
        {error && <div className="text-red-600">{error}</div>}
      </form>
    </div>
  );
}