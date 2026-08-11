"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  Play,
  ArrowLeft,
  CheckCircle2,
  Clock,
  UserCheck,
  RotateCcw,
  Sparkles,
  Terminal,
  Database,
  Copy,
  Share2,
  FileText,
  AlertTriangle,
  RefreshCw,
  Zap,
} from "lucide-react";
import { useToast } from "@/components/Toast";

export default function ExecutionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { showToast } = useToast();

  const [execution, setExecution] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stepping, setStepping] = useState(false);
  const [activeTab, setActiveTab] = useState<"logs" | "scratchpad" | "outputs">("outputs");
  const [activePlatformTab, setActivePlatformTab] = useState<string>("twitter");
  const [humanFeedbackText, setHumanFeedbackText] = useState("");

  const fetchExecution = async () => {
    try {
      const res = await fetch(`/api/executions/${id}`);
      if (res.ok) {
        const data = await res.json();
        setExecution(data);
      }
    } catch (e) {
      console.error("Error fetching execution detail", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecution();
    const interval = setInterval(() => {
      fetchExecution();
    }, 4000);
    return () => clearInterval(interval);
  }, [id]);

  const handleAction = async (action: "step" | "approve" | "autorun_all" | "reject_and_revise") => {
    setStepping(true);
    try {
      const res = await fetch(`/api/executions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, feedback: humanFeedbackText }),
      });

      if (res.ok) {
        showToast(`Action '${action}' executed!`, "success");
        setHumanFeedbackText("");
        await fetchExecution();
      } else {
        showToast("Action failed", "error");
      }
    } catch (e) {
      showToast("Error executing action", "error");
    } finally {
      setStepping(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard!", "success");
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-400" />
        <p className="text-sm">Loading execution pipeline...</p>
      </div>
    );
  }

  if (!execution) {
    return (
      <div className="p-12 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 mx-auto text-amber-500" />
        <h2 className="text-xl font-bold text-slate-100">Execution Not Found</h2>
        <Link href="/executions" className="inline-block px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold">
          Back to Executions
        </Link>
      </div>
    );
  }

  const nodes = execution.workflow ? JSON.parse(execution.workflow.nodes || "[]") : [];
  const logs = execution.logsParsed || [];
  const scratchpad = execution.scratchpadParsed || {};
  const finalOutputs = execution.finalOutputsParsed || {};

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <Link
            href="/executions"
            className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Runs</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">{execution.topic}</h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                execution.status === "completed"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : execution.status === "waiting_approval"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 animate-pulse"
              }`}
            >
              {execution.status.replace("_", " ")}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Pipeline: <span className="text-slate-200 font-semibold">{execution.workflow?.title}</span> • Niche:{" "}
            <span className="text-indigo-300 font-semibold">{execution.targetNiche}</span>
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {execution.status !== "completed" && (
            <>
              <button
                onClick={() => handleAction("step")}
                disabled={stepping}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{stepping ? "Running..." : "Next Step"}</span>
              </button>

              <button
                onClick={() => handleAction("autorun_all")}
                disabled={stepping}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Auto-Run All</span>
              </button>
            </>
          )}

          <button
            onClick={fetchExecution}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh state"
          >
            <RefreshCw className={`w-4 h-4 ${stepping ? "animate-spin text-indigo-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Human Approval Banner if waiting_approval */}
      {execution.status === "waiting_approval" && (
        <div className="p-6 rounded-3xl bg-amber-950/40 border border-amber-500/40 shadow-2xl space-y-4 animate-in slide-in-from-top-3">
          <div className="flex items-center gap-3 text-amber-300">
            <UserCheck className="w-6 h-6 shrink-0" />
            <div>
              <h3 className="text-base font-bold">Human-in-the-Loop Gate Reached</h3>
              <p className="text-xs text-amber-200/80">
                The agent swarm completed a draft step and requires creator approval before proceeding to multi-platform atomization.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              value={humanFeedbackText}
              onChange={(e) => setHumanFeedbackText(e.target.value)}
              placeholder="Optional feedback for agent revision (e.g. 'Make opening hook shorter and more direct')..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-slate-100 text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleAction("approve")}
              disabled={stepping}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve & Continue</span>
            </button>

            <button
              onClick={() => handleAction("reject_and_revise")}
              disabled={stepping}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Request Revision</span>
            </button>
          </div>
        </div>
      )}

      {/* Interactive DAG Pipeline Flow */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Multi-Agent DAG Execution Graph ({nodes.length} Stages)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {nodes.map((node: any, idx: number) => {
            const isCompleted = idx < execution.currentStepIndex;
            const isCurrent = idx === execution.currentStepIndex && execution.status !== "completed";
            const isWaiting = isCurrent && execution.status === "waiting_approval";

            return (
              <div
                key={node.id || idx}
                className={`p-4 rounded-2xl border transition-all ${
                  isCompleted
                    ? "bg-slate-950 border-emerald-500/40 text-slate-200"
                    : isCurrent
                    ? isWaiting
                      ? "bg-amber-950/30 border-amber-500/50 text-amber-200 ring-2 ring-amber-500/30"
                      : "bg-indigo-950/40 border-indigo-500/50 text-indigo-200 ring-2 ring-indigo-500/30"
                    : "bg-slate-950/50 border-slate-800 text-slate-500"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                    Step {idx + 1}
                  </span>

                  {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {isCurrent && !isWaiting && <Clock className="w-4 h-4 text-indigo-400 animate-spin" />}
                  {isWaiting && <UserCheck className="w-4 h-4 text-amber-400" />}
                </div>

                <h4 className="text-xs font-bold line-clamp-1">{node.name}</h4>
                <p className="text-[10px] opacity-75 mt-1 font-mono">${node.outputKey}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Tabs Section */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        {/* Tab Navigation */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab("outputs")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "outputs"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Multi-Platform Deliverables</span>
          </button>

          <button
            onClick={() => setActiveTab("scratchpad")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "scratchpad"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Agent Scratchpad Context</span>
          </button>

          <button
            onClick={() => setActiveTab("logs")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "logs"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Execution Terminal Logs ({logs.length})</span>
          </button>
        </div>

        {/* Tab 1: Outputs */}
        {activeTab === "outputs" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-800/80 pb-3">
              {["twitter", "substack", "linkedin", "youtube"].map((plat) => (
                <button
                  key={plat}
                  onClick={() => setActivePlatformTab(plat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                    activePlatformTab === plat
                      ? "bg-slate-800 text-indigo-300 border border-indigo-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {plat === "twitter" ? "X / Twitter Thread" : plat}
                </button>
              ))}
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  Formatted Deliverable: {activePlatformTab.toUpperCase()}
                </span>

                <button
                  onClick={() => copyToClipboard(finalOutputs[activePlatformTab] || scratchpad.master_draft || "")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Text</span>
                </button>
              </div>

              <div className="font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto p-4 bg-slate-900/80 rounded-xl border border-slate-800">
                {finalOutputs[activePlatformTab] ||
                  scratchpad.master_draft ||
                  scratchpad.critique_and_refined_draft ||
                  scratchpad.research_summary ||
                  "Output will appear here as the swarm progresses..."}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Scratchpad */}
        {activeTab === "scratchpad" && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300 leading-relaxed max-h-[500px] overflow-y-auto">
            <pre>{JSON.stringify(scratchpad, null, 2)}</pre>
          </div>
        )}

        {/* Tab 3: Logs */}
        {activeTab === "logs" && (
          <div className="space-y-3 max-h-[500px] overflow-y-auto font-mono text-xs">
            {logs.map((log: any, i: number) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="text-indigo-400 font-bold">{log.agentName}</span>
                  <span>{log.durationMs}ms • {log.tokensUsed || 300} tokens</span>
                </div>
                <div className="text-slate-200 whitespace-pre-wrap">{log.output}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
