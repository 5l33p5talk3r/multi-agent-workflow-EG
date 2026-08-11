"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Zap,
  Plus,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Flame,
} from "lucide-react";
import { ExecuteModal } from "@/components/ExecuteModal";
import { useToast } from "@/components/Toast";

export default function TrendsPage() {
  const [trends, setTrends] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userNiche, setUserNiche] = useState("AI & Dev Tools");

  const [execWfToLaunch, setExecWfToLaunch] = useState<any>(null);
  const [topicToLaunch, setTopicToLaunch] = useState("");

  const [newTopic, setNewTopic] = useState("");
  const [newSummary, setNewSummary] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [tRes, wRes, uRes] = await Promise.all([
        fetch("/api/trends"),
        fetch("/api/workflows"),
        fetch("/api/auth/me"),
      ]);

      if (tRes.ok) setTrends(await tRes.json());
      if (wRes.ok) setWorkflows(await wRes.json());
      if (uRes.ok) {
        const uData = await uRes.json();
        if (uData.user?.niche) setUserNiche(uData.user.niche);
      }
    } catch (e) {
      console.error("Error loading trend data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddTrend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    try {
      const res = await fetch("/api/trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: newTopic,
          summary: newSummary || "High velocity signal added by creator.",
          niche: userNiche,
          score: 95,
          suggestedHooks: [
            `Why ${newTopic} is changing everything for technical creators.`,
            `We benchmarked ${newTopic}. Here are the results.`
          ]
        }),
      });

      if (res.ok) {
        showToast("New trend signal added!", "success");
        setNewTopic("");
        setNewSummary("");
        setIsAdding(false);
        loadData();
      }
    } catch (e) {
      showToast("Failed adding trend", "error");
    }
  };

  const triggerSwarmForTrend = (topicName: string) => {
    if (workflows.length === 0) {
      showToast("Please create a workflow first", "error");
      return;
    }
    setTopicToLaunch(topicName);
    setExecWfToLaunch(workflows[0]);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Niche Signal Radar</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
            Trend Signals for <span className="text-emerald-400">{userNiche}</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Scanned viral signals, emerging technical repositories, and high-engagement topics.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Signal</span>
        </button>
      </div>

      {/* Add Custom Signal Form */}
      {isAdding && (
        <form
          onSubmit={handleAddTrend}
          className="p-6 rounded-3xl bg-slate-900 border border-emerald-500/30 shadow-2xl space-y-4 animate-in slide-in-from-top-3"
        >
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Flame className="w-4 h-4 text-emerald-400" />
            <span>Submit Topic / GitHub Repo for Swarm Scanning</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Topic / Repository Title</label>
              <input
                type="text"
                required
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="e.g. Supabase local development with Docker & Drizzle"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Signal Summary / Details</label>
              <input
                type="text"
                value={newSummary}
                onChange={(e) => setNewSummary(e.target.value)}
                placeholder="Key takeaways or architecture shift..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
            >
              Save Signal
            </button>
          </div>
        </form>
      )}

      {/* Trends List */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-emerald-400" />
          <p className="text-sm">Scanning trend signals...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trends.map((trend) => {
            let hooksList: string[] = [];
            let sourcesList: string[] = [];
            try {
              hooksList = typeof trend.suggestedHooks === "string" ? JSON.parse(trend.suggestedHooks) : trend.suggestedHooks || [];
              sourcesList = typeof trend.sources === "string" ? JSON.parse(trend.sources) : trend.sources || [];
            } catch (e) {}

            return (
              <div
                key={trend.id}
                className="flex flex-col justify-between p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 shadow-xl transition-all space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{trend.score} Viral Score</span>
                    </span>

                    <span className="text-xs text-slate-400 font-medium">{trend.niche}</span>
                  </div>

                  <h2 className="text-lg font-bold text-slate-100">{trend.topic}</h2>
                  <p className="text-xs text-slate-300 leading-relaxed">{trend.summary}</p>

                  {/* Sources */}
                  {sourcesList.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Sources:</span>
                      {sourcesList.map((src, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 text-[10px] font-mono">
                          {src}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Hooks */}
                  {hooksList.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1.5">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                        Suggested Viral Hooks
                      </span>
                      {hooksList.map((hook, i) => (
                        <p key={i} className="text-xs text-slate-300 font-medium italic">
                          "{hook}"
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => triggerSwarmForTrend(trend.topic)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Launch Swarm Run</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Execute Modal */}
      {execWfToLaunch && (
        <ExecuteModal
          isOpen={!!execWfToLaunch}
          onClose={() => setExecWfToLaunch(null)}
          workflow={{ ...execWfToLaunch, defaultTopic: topicToLaunch }}
          userNiche={userNiche}
        />
      )}
    </div>
  );
}
