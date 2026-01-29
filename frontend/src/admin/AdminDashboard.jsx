import React, { useEffect, useState } from "react";
import api from "../api/axios";
// eslint-disable-next-line no-unused-vars
import { clearTokens, getUserFromToken } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [siteData, setSiteData] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSite();
  }, []);

  async function fetchSite() {
    try {
      const resp = await api.get("/site/");
      setSiteData(resp.data);
    } catch (err) {
      console.error(err);
    }
  }

  function logout() {
    clearTokens();
    navigate("/admin/login");
    window.location.reload();
  }

  async function save() {
    setSaving(true);
    try {
      await api.patch("/site/1/", siteData);
      alert("Saved");
    } catch (err) {
      console.error(err);
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (!siteData) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl">Admin Dashboard</h1>
        <div>
          <button onClick={logout} className="px-3 py-1 border rounded">Logout</button>
        </div>
      </div>

      <div className="space-y-4 max-w-2xl">
        <label className="block">
          <div className="text-sm">Site Title</div>
          <input className="w-full p-2 border rounded" value={siteData.title || ""} onChange={e=>setSiteData({...siteData, title: e.target.value})} />
        </label>

        <label className="block">
          <div className="text-sm">Description</div>
          <textarea className="w-full p-2 border rounded" rows="4" value={siteData.description || ""} onChange={e=>setSiteData({...siteData, description: e.target.value})} />
        </label>

        <div>
          <button onClick={save} disabled={saving} className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
        </div>
      </div>
    </div>
  );
}