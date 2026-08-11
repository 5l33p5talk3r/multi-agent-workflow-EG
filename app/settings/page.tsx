"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Key,
  User,
  Sparkles,
  RefreshCw,
  Save,
  Check,
  Cpu,
  Database,
} from "lucide-react";
import { useToast } from "@/components/Toast";

export default function SettingsPage() {
  const { showToast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [niche, setNiche] = useState("");
  const [brandVoice, setBrandVoice] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setAccounts(data.availableAccounts || []);
        if (data.user) {
          setName(data.user.name || "");
          setNiche(data.user.niche || "");
          setBrandVoice(data.user.brandVoice || "");
          try {
            const keys = typeof data.user.apiKeys === "string" ? JSON.parse(data.user.apiKeys) : data.user.apiKeys || {};
            setOpenaiKey(keys.openai || "");
            setAnthropicKey(keys.anthropic || "");
          } catch (e) {}
        }
      }
    } catch (e) {
      console.error("Error loading settings", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/auth/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          name,
          niche,
          brandVoice,
          apiKeys: { openai: openaiKey, anthropic: anthropicKey },
        }),
      });

      if (res.ok) {
        showToast("Settings and API keys saved successfully!", "success");
        await loadData();
      } else {
        showToast("Failed to save settings", "error");
      }
    } catch (e) {
      showToast("Error saving settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const seedDB = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      if (res.ok) {
        showToast("Database seeded with fresh demo data!", "success");
        window.location.reload();
      }
    } catch (e) {
      showToast("Error seeding database", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-400" />
        <p className="text-sm">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Settings className="w-4 h-4" />
          <span>Workspace Configuration</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
          Creator Persona & LLM Keys
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Manage creator profile, brand voice rules, API secrets, and workspace parameters.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Profile & Brand Voice */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center gap-3 text-indigo-400 border-b border-slate-800 pb-3">
            <User className="w-5 h-5" />
            <h2 className="text-base font-bold text-slate-100">Creator Profile & Brand Voice</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Creator Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Niche Specialty</label>
              <input
                type="text"
                required
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Brand Voice Guidelines & Tone Rules
            </label>
            <textarea
              rows={4}
              value={brandVoice}
              onChange={(e) => setBrandVoice(e.target.value)}
              placeholder="e.g. Code-first, zero corporate fluff, pragmatic, highly dense technical signal..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* API Keys */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center gap-3 text-indigo-400 border-b border-slate-800 pb-3">
            <Key className="w-5 h-5" />
            <h2 className="text-base font-bold text-slate-100">Optional LLM API Keys</h2>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            By default, SwarmFlow uses an intelligent built-in agent worker. You can optionally supply your custom OpenAI or Anthropic API keys to use live model endpoints. Keys are stored safely in PostgreSQL.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">OpenAI API Key</label>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Anthropic API Key</label>
              <input
                type="password"
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={seedDB}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
          >
            <Database className="w-4 h-4 text-indigo-400" />
            <span>Reset / Re-seed Demo DB</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
