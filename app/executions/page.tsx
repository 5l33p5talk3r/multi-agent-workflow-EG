"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Play,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
} from "lucide-react";
import { useToast } from "@/components/Toast";

export default function ExecutionsPage() {
  const [executions, setExecutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { showToast } = useToast();

  const fetchExecutions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/executions");
      if (res.ok) {
        setExecutions(await res.json());
      }
    } catch (e) {
      console.error("Error fetching executions", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutions();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm("Are you sure you want to delete this execution log?")) return;

    const prev = [...executions];
    setExecutions((ex) => ex.filter((item) => item.id !== id));

    try {
      const res = await fetch(`/api/executions/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Execution log deleted", "success");
      } else {
        setExecutions(prev);
        showToast("Failed to delete execution", "error");
      }
    } catch (err) {
      setExecutions(prev);
      showToast("Error deleting execution", "error");
    }
  };

  const filtered = executions.filter((ex) => {
    const matchesSearch =
      ex.topic.toLowerCase().includes(search.toLowerCase()) ||
      (ex.workflowTitle && ex.workflowTitle.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "all" || ex.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Play className="w-4 h-4 fill-current" />
            <span>Swarm Execution Tracker</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
            Executions & Swarm Runs
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Inspect real-time DAG steps, agent logs, human-in-the-loop approvals, and multi-channel deliverables.
          </p>
        </div>

        <button
          onClick={fetchExecutions}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-400" : ""}`} />
          <span>Refresh Runs</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-md">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topic or workflow..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="running">Running</option>
            <option value="waiting_approval">Waiting Approval</option>
            <option value="queued">Queued</option>
          </select>
        </div>
      </div>

      {/* Executions List */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-400" />
          <p className="text-sm">Loading execution logs...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-dashed border-slate-800 rounded-3xl space-y-3">
          <Play className="w-10 h-10 mx-auto text-slate-600" />
          <h3 className="text-base font-bold text-slate-200">No Executions Found</h3>
          <p className="text-xs text-slate-400">Launch a workflow run from the Overview or Workflows tab.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((exec) => {
            let logsList: any[] = [];
            try {
              logsList = typeof exec.logs === "string" ? JSON.parse(exec.logs) : exec.logs || [];
            } catch (e) {}

            return (
              <Link
                key={exec.id}
                href={`/executions/${exec.id}`}
                className="group flex flex-col md:flex-row md:items-center justify-between p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all shadow-lg hover:shadow-2xl gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                      {exec.topic}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="text-indigo-400 font-medium">
                      Pipeline: {exec.workflowTitle || "Swarm Workflow"}
                    </span>
                    <span>•</span>
                    <span>Niche: {exec.targetNiche || "Tech"}</span>
                    <span>•</span>
                    <span>{logsList.length} steps executed</span>
                    <span>•</span>
                    <span>{new Date(exec.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize flex items-center gap-2 ${
                      exec.status === "completed"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : exec.status === "running"
                        ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 animate-pulse"
                        : exec.status === "waiting_approval"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {exec.status === "completed" && <CheckCircle2 className="w-4 h-4" />}
                    {exec.status === "waiting_approval" && <AlertCircle className="w-4 h-4" />}
                    {exec.status === "running" && <Clock className="w-4 h-4 animate-spin" />}
                    <span>{exec.status.replace("_", " ")}</span>
                  </span>

                  <button
                    onClick={(e) => handleDelete(exec.id, e)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Delete execution"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="p-2 rounded-xl bg-slate-800 text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
