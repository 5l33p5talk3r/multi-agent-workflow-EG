"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Play, Sparkles, Check, Cpu } from "lucide-react";
import { useToast } from "./Toast";

interface ExecuteModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflow: any;
  userNiche?: string;
}

const PLATFORM_OPTIONS = [
  { id: "twitter", label: "X / Twitter Thread (8 Posts)", color: "text-sky-400" },
  { id: "substack", label: "Substack Newsletter Issue", color: "text-amber-400" },
  { id: "linkedin", label: "LinkedIn Carousel / Post", color: "text-blue-400" },
  { id: "youtube", label: "YouTube Shorts Script (60s)", color: "text-rose-400" },
];

export function ExecuteModal({ isOpen, onClose, workflow, userNiche }: ExecuteModalProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [topic, setTopic] = useState("");
  const [targetNiche, setTargetNiche] = useState(userNiche || workflow?.nicheCategory || "AI & Dev Tools");
  const [selectedPlatforms, setSelectedPlatforms] = useState(["twitter", "substack", "linkedin", "youtube"]);
  const [autoRun, setAutoRun] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !workflow) return null;

  const togglePlatform = (platId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platId) ? prev.filter((p) => p !== platId) : [...prev, platId]
    );
  };

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      showToast("Please enter a topic or seed prompt for the swarm", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/workflows/${workflow.id}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          targetNiche,
          targetPlatforms: selectedPlatforms,
          autoRun,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        showToast("Swarm execution initialized!", "success");
        onClose();
        router.push(`/executions/${data.executionId}`);
      } else {
        showToast("Failed to launch swarm execution", "error");
      }
    } catch (e) {
      showToast("Error launching swarm", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <Play className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Launch Swarm Run</h3>
              <p className="text-xs text-indigo-400 font-medium">{workflow.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleLaunch} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Topic / Seed Prompt / Open Source Link
            </label>
            <textarea
              rows={3}
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Local DeepSeek R1 GGUF quantized models on Apple Silicon M3 Max..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Niche</label>
              <input
                type="text"
                value={targetNiche}
                onChange={(e) => setTargetNiche(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300">
                <input
                  type="checkbox"
                  checked={autoRun}
                  onChange={(e) => setAutoRun(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span>Auto-run Step 1 immediately</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Target Multi-Platform Deliverables</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PLATFORM_OPTIONS.map((plat) => {
                const active = selectedPlatforms.includes(plat.id);
                return (
                  <button
                    type="button"
                    key={plat.id}
                    onClick={() => togglePlatform(plat.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium border transition-all ${
                      active
                        ? "bg-indigo-600/20 border-indigo-500/40 text-slate-100"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span className={plat.color}>{plat.label}</span>
                    {active && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
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
              <span>{loading ? "Initializing..." : "Start Swarm Pipeline"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
