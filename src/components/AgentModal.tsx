"use client";

import React, { useState, useEffect } from "react";
import { X, Bot, Sparkles, Check } from "lucide-react";
import { useToast } from "./Toast";

interface AgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  agentToEdit?: any;
}

const AVAILABLE_MODELS = [
  "Claude 3.5 Sonnet",
  "GPT-4o",
  "DeepSeek-R1",
  "Llama 3.3 70B",
  "GPT-4o-mini",
  "Gemini 1.5 Pro",
];

const AVAILABLE_TOOLS = [
  { id: "web_search", name: "Web Search & Scraper" },
  { id: "github_trending", name: "GitHub Trending Signal Analyzer" },
  { id: "hook_scorer", name: "Hook Scorer & Viral Predictor" },
  { id: "fluff_detector", name: "Fluff & AI Buzzword Detector" },
  { id: "multi_format_exporter", name: "Multi-Platform Formatter" },
  { id: "code_syntax_highlighter", name: "Code Syntax Highlighter" },
  { id: "seo_analyzer", name: "SEO & Keyword Density Checker" },
];

const AVATAR_EMOJIS = ["🔍", "🪝", "📝", "🛡️", "🚀", "⚛️", "🧠", "🤖", "⚡", "🔬", "📊", "🎨"];

export function AgentModal({ isOpen, onClose, onSaved, agentToEdit }: AgentModalProps) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    avatar: "🤖",
    color: "indigo",
    model: "Claude 3.5 Sonnet",
    temperature: 0.7,
    systemPrompt: "",
    tools: [] as string[],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (agentToEdit) {
      let parsedTools: string[] = [];
      try {
        parsedTools = typeof agentToEdit.tools === "string" ? JSON.parse(agentToEdit.tools) : agentToEdit.tools || [];
      } catch (e) {}

      setFormData({
        name: agentToEdit.name || "",
        role: agentToEdit.role || "",
        avatar: agentToEdit.avatar || "🤖",
        color: agentToEdit.color || "indigo",
        model: agentToEdit.model || "Claude 3.5 Sonnet",
        temperature: agentToEdit.temperature ?? 0.7,
        systemPrompt: agentToEdit.systemPrompt || "",
        tools: parsedTools,
      });
    } else {
      setFormData({
        name: "",
        role: "",
        avatar: "🤖",
        color: "indigo",
        model: "Claude 3.5 Sonnet",
        temperature: 0.7,
        systemPrompt: "You are a specialized AI agent for niche content creation.",
        tools: ["web_search"],
      });
    }
  }, [agentToEdit, isOpen]);

  if (!isOpen) return null;

  const toggleTool = (toolId: string) => {
    setFormData((prev) => ({
      ...prev,
      tools: prev.tools.includes(toolId)
        ? prev.tools.filter((t) => t !== toolId)
        : [...prev.tools, toolId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.role) {
      showToast("Please enter an agent name and role", "error");
      return;
    }

    setLoading(true);
    try {
      const url = agentToEdit ? `/api/agents/${agentToEdit.id}` : "/api/agents";
      const method = agentToEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        showToast(agentToEdit ? "Agent updated successfully!" : "New agent created!", "success");
        onSaved();
        onClose();
      } else {
        showToast("Failed to save agent", "error");
      }
    } catch (e) {
      showToast("Error saving agent", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                {agentToEdit ? "Edit Swarm Agent" : "Create New Swarm Agent"}
              </h3>
              <p className="text-xs text-slate-400">Configure persona, system prompt, model & tools</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Name & Avatar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Agent Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Nexus Trend Hunter"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Avatar Icon</label>
              <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 bg-slate-950 border border-slate-800 rounded-xl">
                {AVATAR_EMOJIS.slice(0, 4).map((emoji) => (
                  <button
                    type="button"
                    key={emoji}
                    onClick={() => setFormData({ ...formData, avatar: emoji })}
                    className={`p-1.5 rounded-lg text-base hover:bg-slate-800 transition-all ${
                      formData.avatar === emoji ? "bg-indigo-600/30 ring-1 ring-indigo-500" : ""
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Role & Focus</label>
            <input
              type="text"
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="e.g. Niche Trend Researcher & Signal Extractor"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Model & Temperature */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">LLM Model</label>
              <select
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
              >
                {AVAILABLE_MODELS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300">Creativity (Temp)</label>
                <span className="text-xs text-indigo-400 font-mono font-bold">{formData.temperature}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                className="w-full accent-indigo-500 bg-slate-950"
              />
            </div>
          </div>

          {/* System Prompt */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">System Instructions / Persona</label>
            <textarea
              rows={4}
              required
              value={formData.systemPrompt}
              onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
              placeholder="Define agent personality, formatting constraints, tone rules, and explicit guardrails..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Assigned Tools */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Enabled Tools & Capabilities</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {AVAILABLE_TOOLS.map((tool) => {
                const active = formData.tools.includes(tool.id);
                return (
                  <button
                    type="button"
                    key={tool.id}
                    onClick={() => toggleTool(tool.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium border transition-all ${
                      active
                        ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-200"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>{tool.name}</span>
                    {active && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? "Saving..." : agentToEdit ? "Update Agent" : "Create Agent"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
