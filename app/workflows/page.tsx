"use client";

import React, { useState, useEffect } from "react";
import {
  GitFork,
  Plus,
  Play,
  Edit2,
  Trash2,
  Sparkles,
  ArrowRight,
  UserCheck,
  RefreshCw,
  Search,
} from "lucide-react";
import { WorkflowModal } from "@/components/WorkflowModal";
import { ExecuteModal } from "@/components/ExecuteModal";
import { useToast } from "@/components/Toast";

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [wfModalOpen, setWfModalOpen] = useState(false);
  const [wfToEdit, setWfToEdit] = useState<any>(null);

  const [execWfToLaunch, setExecWfToLaunch] = useState<any>(null);

  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [wRes, aRes] = await Promise.all([fetch("/api/workflows"), fetch("/api/agents")]);
      if (wRes.ok) setWorkflows(await wRes.json());
      if (aRes.ok) setAgents(await aRes.json());
    } catch (e) {
      console.error("Error loading workflows", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this workflow?")) return;

    const prev = [...workflows];
    setWorkflows((w) => w.filter((item) => item.id !== id));

    try {
      const res = await fetch(`/api/workflows/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Workflow deleted", "success");
      } else {
        setWorkflows(prev);
        showToast("Failed to delete workflow", "error");
      }
    } catch (e) {
      setWorkflows(prev);
      showToast("Error deleting workflow", "error");
    }
  };

  const filteredWorkflows = workflows.filter((w) => {
    const q = search.toLowerCase();
    return (
      w.title.toLowerCase().includes(q) ||
      (w.description && w.description.toLowerCase().includes(q)) ||
      (w.nicheCategory && w.nicheCategory.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <GitFork className="w-4 h-4" />
            <span>Multi-Agent Workflow Engine</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
            Swarm Workflows & DAG Pipelines
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Build multi-stage orchestration chains that pass context from researcher to writer, critic, and multi-channel atomizer.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setWfToEdit(null);
              setWfModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Workflow</span>
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-md">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workflows by title or category..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Total Workflows: <span className="text-slate-100 font-bold">{filteredWorkflows.length}</span>
        </div>
      </div>

      {/* Workflows List */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-400" />
          <p className="text-sm">Loading workflows...</p>
        </div>
      ) : filteredWorkflows.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-dashed border-slate-800 rounded-3xl space-y-3">
          <GitFork className="w-10 h-10 mx-auto text-slate-600" />
          <h3 className="text-base font-bold text-slate-200">No Workflows Found</h3>
          <p className="text-xs text-slate-400">Build your first multi-agent workflow pipeline.</p>
          <button
            onClick={() => {
              setWfToEdit(null);
              setWfModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            Create Workflow
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredWorkflows.map((wf) => {
            let nodesList: any[] = [];
            try {
              nodesList = typeof wf.nodes === "string" ? JSON.parse(wf.nodes) : wf.nodes || [];
            } catch (e) {}

            return (
              <div
                key={wf.id}
                className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-xl transition-all space-y-5"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold uppercase tracking-wider">
                        {wf.nicheCategory}
                      </span>
                      {wf.isTemplate && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase">
                          Template
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-slate-100">{wf.title}</h2>
                    <p className="text-xs text-slate-400 max-w-2xl">{wf.description}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setExecWfToLaunch(wf)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-105"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Run Pipeline</span>
                    </button>

                    <button
                      onClick={() => {
                        setWfToEdit(wf);
                        setWfModalOpen(true);
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                      title="Edit Workflow"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(wf.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete Workflow"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Pipeline Flow Steps Preview */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2.5">
                    Execution DAG Graph ({nodesList.length} Stages)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {nodesList.map((step, idx) => {
                      const assignedAgent = agents.find((a) => a.id === step.agentId);
                      return (
                        <div
                          key={step.id || idx}
                          className="relative p-3.5 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="w-5 h-5 rounded-md bg-indigo-900/80 text-indigo-300 text-[10px] font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            {step.humanApprovalRequired && (
                              <span
                                className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-semibold flex items-center gap-1"
                                title="Requires Human Gate"
                              >
                                <UserCheck className="w-3 h-3" />
                                <span>Gate</span>
                              </span>
                            )}
                          </div>

                          <div className="space-y-0.5">
                            <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{step.name}</h4>
                            <p className="text-[10px] text-indigo-400 font-medium">
                              {assignedAgent ? `${assignedAgent.avatar} ${assignedAgent.name}` : "Swarm Agent"}
                            </p>
                          </div>

                          <div className="text-[9px] font-mono text-slate-500 truncate pt-1 border-t border-slate-900">
                            Output: ${step.outputKey}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <WorkflowModal
        isOpen={wfModalOpen}
        onClose={() => setWfModalOpen(false)}
        onSaved={loadData}
        workflowToEdit={wfToEdit}
        availableAgents={agents}
      />

      {execWfToLaunch && (
        <ExecuteModal
          isOpen={!!execWfToLaunch}
          onClose={() => setExecWfToLaunch(null)}
          workflow={execWfToLaunch}
        />
      )}
    </div>
  );
}
