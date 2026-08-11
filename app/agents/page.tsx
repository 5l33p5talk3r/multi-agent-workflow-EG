"use client";

import React, { useState, useEffect } from "react";
import {
  Bot,
  Plus,
  Search,
  Edit2,
  Trash2,
  Cpu,
  Sparkles,
  Sliders,
  Check,
  RefreshCw,
  Terminal,
} from "lucide-react";
import { AgentModal } from "@/components/AgentModal";
import { useToast } from "@/components/Toast";

export default function AgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setAgentModalOpen] = useState(false);
  const [agentToEdit, setAgentToEdit] = useState<any>(null);
  const { showToast } = useToast();

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/agents");
      if (res.ok) {
        setAgents(await res.json());
      }
    } catch (e) {
      console.error("Error fetching agents", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this agent?")) return;

    // Optimistic delete
    const prev = [...agents];
    setAgents((a) => a.filter((item) => item.id !== id));

    try {
      const res = await fetch(`/api/agents/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Agent deleted", "success");
      } else {
        setAgents(prev);
        showToast("Failed to delete agent", "error");
      }
    } catch (e) {
      setAgents(prev);
      showToast("Error deleting agent", "error");
    }
  };

  const filteredAgents = agents.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.role.toLowerCase().includes(q) ||
      a.model.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Bot className="w-4 h-4" />
            <span>Agent Swarm Orchestration</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
            Specialized Swarm Agents
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Configure system prompts, persona instructions, LLM models, and tools for each specialized worker.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setAgentToEdit(null);
              setAgentModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Agent</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-md">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by agent name, role, or LLM model..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Showing <span className="text-slate-100 font-bold">{filteredAgents.length}</span> agents
        </div>
      </div>

      {/* Agents Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-400" />
          <p className="text-sm">Loading swarm agents...</p>
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-dashed border-slate-800 rounded-3xl space-y-3">
          <Bot className="w-10 h-10 mx-auto text-slate-600" />
          <h3 className="text-base font-bold text-slate-200">No Swarm Agents Found</h3>
          <p className="text-xs text-slate-400">
            {search ? "No agents matching search criteria." : "Create your first agent persona to get started."}
          </p>
          <button
            onClick={() => {
              setAgentToEdit(null);
              setAgentModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            Create Agent
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => {
            let toolsList: string[] = [];
            try {
              toolsList = typeof agent.tools === "string" ? JSON.parse(agent.tools) : agent.tools || [];
            } catch (e) {}

            return (
              <div
                key={agent.id}
                className="group relative flex flex-col justify-between p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 shadow-xl transition-all hover:shadow-2xl"
              >
                <div className="space-y-4">
                  {/* Top Bar: Avatar & Role */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl p-2.5 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner">
                        {agent.avatar || "🤖"}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                          {agent.name}
                        </h3>
                        <p className="text-xs text-indigo-400 font-medium">{agent.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setAgentToEdit(agent);
                          setAgentModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                        title="Edit Agent"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(agent.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Delete Agent"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Badges: Model & Temp */}
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 font-semibold flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{agent.model}</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400">
                      Temp: {agent.temperature}
                    </span>
                  </div>

                  {/* System Prompt Snippet */}
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {agent.systemPrompt}
                  </div>

                  {/* Tools Badges */}
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Capabilities & Tools ({toolsList.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {toolsList.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-md bg-indigo-950/60 border border-indigo-500/20 text-indigo-300 text-[10px] font-mono"
                        >
                          {t.replace("_", " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="text-[11px] text-slate-500">Ready for workflow execution</span>
                  <button
                    onClick={() => {
                      setAgentToEdit(agent);
                      setAgentModalOpen(true);
                    }}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    Configure
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Agent Modal */}
      <AgentModal
        isOpen={modalOpen}
        onClose={() => setAgentModalOpen(false)}
        onSaved={fetchAgents}
        agentToEdit={agentToEdit}
      />
    </div>
  );
}
