"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bot,
  GitFork,
  Play,
  FileText,
  TrendingUp,
  Sparkles,
  Zap,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
} from "lucide-react";
import { ExecuteModal } from "@/components/ExecuteModal";
import { useToast } from "@/components/Toast";

export default function OverviewPage() {
  const [user, setUser] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [executions, setExecutions] = useState<any[]>([]);
  const [content, setContent] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedWfToLaunch, setSelectedWfToLaunch] = useState<any>(null);
  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [uRes, aRes, wRes, eRes, cRes, tRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/agents"),
        fetch("/api/workflows"),
        fetch("/api/executions"),
        fetch("/api/content"),
        fetch("/api/trends"),
      ]);

      if (uRes.ok) setUser((await uRes.json()).user);
      if (aRes.ok) setAgents(await aRes.json());
      if (wRes.ok) setWorkflows(await wRes.json());
      if (eRes.ok) setExecutions(await eRes.json());
      if (cRes.ok) setContent(await cRes.json());
      if (tRes.ok) setTrends(await tRes.json());
    } catch (e) {
      console.error("Failed loading overview data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/20 p-6 md:p-8 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Multi-Agent Swarm Workspace</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{user?.name || "Alex Rivera"}</span> 👋
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Your autonomous agent swarm is ready. Orchestrate specialized agents to research, draft, critique, and atomize content for <span className="text-indigo-300 font-medium">{user?.niche || "AI & Dev Tools"}</span>.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                if (workflows.length > 0) setSelectedWfToLaunch(workflows[0]);
                else showToast("Please create a workflow first", "info");
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Launch Swarm Run</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <Link
          href="/agents"
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all group shadow-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Swarm Agents</span>
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 group-hover:scale-110 transition-transform">
              <Bot className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100">{agents.length}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Active personas & models</span>
        </Link>

        <Link
          href="/workflows"
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all group shadow-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">DAG Workflows</span>
            <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 group-hover:scale-110 transition-transform">
              <GitFork className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100">{workflows.length}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Multi-agent pipelines</span>
        </Link>

        <Link
          href="/executions"
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all group shadow-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Runs</span>
            <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 group-hover:scale-110 transition-transform">
              <Play className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100">{executions.length}</div>
          <span className="text-[11px] text-emerald-400 mt-1 block">
            {executions.filter((e) => e.status === "completed").length} completed
          </span>
        </Link>

        <Link
          href="/content"
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all group shadow-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Atomized Posts</span>
            <div className="p-2 rounded-xl bg-amber-600/20 text-amber-400 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100">{content.length}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Across X, Substack, LinkedIn</span>
        </Link>
      </div>

      {/* Main Grid: Trends & Executions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Executions & Active Workflows */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Executions */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
                  <Play className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-100">Recent Swarm Executions</h2>
                  <p className="text-xs text-slate-400">Real-time DAG status and step logs</p>
                </div>
              </div>

              <Link
                href="/executions"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                Loading swarm executions...
              </div>
            ) : executions.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl">
                <p className="text-sm text-slate-400">No executions run yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {executions.slice(0, 4).map((exec) => (
                  <Link
                    key={exec.id}
                    href={`/executions/${exec.id}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors">
                          {exec.topic}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>Workflow: {exec.workflowTitle || "Swarm Pipeline"}</span>
                        <span>•</span>
                        <span>{new Date(exec.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize flex items-center gap-1.5 ${
                          exec.status === "completed"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : exec.status === "running"
                            ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 animate-pulse"
                            : exec.status === "waiting_approval"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {exec.status === "completed" && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {exec.status === "waiting_approval" && <AlertCircle className="w-3.5 h-3.5" />}
                        {exec.status === "running" && <Clock className="w-3.5 h-3.5 animate-spin" />}
                        <span>{exec.status.replace("_", " ")}</span>
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Workflows Launcher */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400">
                  <GitFork className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-100">Swarm Workflow Templates</h2>
                  <p className="text-xs text-slate-400">Launch pre-built multi-agent DAG pipelines</p>
                </div>
              </div>

              <Link
                href="/workflows"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <span>Manage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {workflows.map((wf) => {
                let nodesCount = 0;
                try {
                  nodesCount = (typeof wf.nodes === "string" ? JSON.parse(wf.nodes) : wf.nodes || []).length;
                } catch (e) {}

                return (
                  <div
                    key={wf.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-all"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">
                        {wf.nicheCategory} • {nodesCount} Agents
                      </span>
                      <h3 className="text-sm font-bold text-slate-100">{wf.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {wf.description}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedWfToLaunch(wf)}
                      className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold border border-indigo-500/30 transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Run Workflow</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Niche Radar & Agent Swarm Roster */}
        <div className="space-y-8">
          {/* Niche Trend Radar */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-100">Niche Trend Radar</h2>
                  <p className="text-xs text-slate-400">High-signal topics in {user?.niche || "Tech"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {trends.map((trend) => (
                <div
                  key={trend.id}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-200 line-clamp-1">{trend.topic}</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold shrink-0">
                      {trend.score} VIRAL
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{trend.summary}</p>
                  <button
                    onClick={() => {
                      if (workflows.length > 0) {
                        setSelectedWfToLaunch(workflows[0]);
                      }
                    }}
                    className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold hover:text-indigo-300 pt-1"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Generate Content Swarm</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Swarm Roster Preview */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-100">Agent Roster</h2>
                  <p className="text-xs text-slate-400">Specialized swarm workers</p>
                </div>
              </div>
              <Link href="/agents" className="text-xs text-indigo-400 font-semibold hover:text-indigo-300">
                Manage
              </Link>
            </div>

            <div className="space-y-2.5">
              {agents.slice(0, 5).map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800/80"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{agent.avatar || "🤖"}</span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{agent.name}</h4>
                      <p className="text-[10px] text-slate-400">{agent.role}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-indigo-300 border border-slate-800">
                    {agent.model}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Launch Execution Modal */}
      {selectedWfToLaunch && (
        <ExecuteModal
          isOpen={!!selectedWfToLaunch}
          onClose={() => setSelectedWfToLaunch(null)}
          workflow={selectedWfToLaunch}
          userNiche={user?.niche}
        />
      )}
    </div>
  );
}
