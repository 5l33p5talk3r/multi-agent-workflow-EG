"use client";

import React, { useState, useEffect } from "react";
import { X, GitFork, Plus, Trash2, ArrowDown, UserCheck, Sparkles } from "lucide-react";
import { useToast } from "./Toast";

interface WorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  workflowToEdit?: any;
  availableAgents: any[];
}

interface StepNode {
  id: string;
  agentId: string;
  name: string;
  order: number;
  humanApprovalRequired: boolean;
  promptTemplate: string;
  outputKey: string;
}

export function WorkflowModal({
  isOpen,
  onClose,
  onSaved,
  workflowToEdit,
  availableAgents,
}: WorkflowModalProps) {
  const { showToast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [nicheCategory, setNicheCategory] = useState("AI & Dev Tools");
  const [nodes, setNodes] = useState<StepNode[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (workflowToEdit) {
      setTitle(workflowToEdit.title || "");
      setDescription(workflowToEdit.description || "");
      setNicheCategory(workflowToEdit.nicheCategory || "AI & Dev Tools");
      try {
        const parsed = typeof workflowToEdit.nodes === "string" ? JSON.parse(workflowToEdit.nodes) : workflowToEdit.nodes || [];
        setNodes(parsed);
      } catch (e) {
        setNodes([]);
      }
    } else {
      setTitle("");
      setDescription("");
      setNicheCategory("AI & Dev Tools");
      const defaultAgentId = availableAgents?.[0]?.id || "";
      setNodes([
        {
          id: `step-${Date.now()}-1`,
          agentId: defaultAgentId,
          name: "Initial Research & Signal Analysis",
          order: 1,
          humanApprovalRequired: false,
          promptTemplate: "Analyze '{{topic}}' for the {{niche}} niche.",
          outputKey: "research_summary",
        },
        {
          id: `step-${Date.now()}-2`,
          agentId: availableAgents?.[1]?.id || defaultAgentId,
          name: "Draft Master Content",
          order: 2,
          humanApprovalRequired: true,
          promptTemplate: "Draft master breakdown based on:\n{{research_summary}}",
          outputKey: "master_draft",
        },
      ]);
    }
  }, [workflowToEdit, isOpen, availableAgents]);

  if (!isOpen) return null;

  const addStep = () => {
    const nextOrder = nodes.length + 1;
    const defaultAgent = availableAgents[0]?.id || "";
    setNodes([
      ...nodes,
      {
        id: `step-${Date.now()}-${nextOrder}`,
        agentId: defaultAgent,
        name: `Step ${nextOrder}: Specialized Task`,
        order: nextOrder,
        humanApprovalRequired: false,
        promptTemplate: `Process context for '{{topic}}'.`,
        outputKey: `step_${nextOrder}_output`,
      },
    ]);
  };

  const removeStep = (index: number) => {
    const updated = nodes.filter((_, i) => i !== index).map((node, i) => ({ ...node, order: i + 1 }));
    setNodes(updated);
  };

  const updateStep = (index: number, field: keyof StepNode, value: any) => {
    const updated = [...nodes];
    updated[index] = { ...updated[index], [field]: value };
    setNodes(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      showToast("Please enter a workflow title", "error");
      return;
    }
    if (nodes.length === 0) {
      showToast("Please add at least one step node to the workflow", "error");
      return;
    }

    setLoading(true);
    try {
      const url = workflowToEdit ? `/api/workflows/${workflowToEdit.id}` : "/api/workflows";
      const method = workflowToEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          nicheCategory,
          nodes,
        }),
      });

      if (res.ok) {
        showToast(workflowToEdit ? "Workflow updated!" : "Workflow created!", "success");
        onSaved();
        onClose();
      } else {
        showToast("Failed to save workflow", "error");
      }
    } catch (e) {
      showToast("Error saving workflow", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <GitFork className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                {workflowToEdit ? "Edit Swarm Workflow Pipeline" : "Build New Multi-Agent DAG"}
              </h3>
              <p className="text-xs text-slate-400">Configure sequential/parallel agent orchestration stages</p>
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Workflow Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Viral Tech Tool Breakdown Engine"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Niche Category</label>
              <input
                type="text"
                value={nicheCategory}
                onChange={(e) => setNicheCategory(e.target.value)}
                placeholder="e.g. AI & Dev Tools"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 5-agent pipeline that transforms an open source repo into multi-channel posts."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Steps Sequence */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Pipeline Stages ({nodes.length})
              </label>
              <button
                type="button"
                onClick={addStep}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Stage</span>
              </button>
            </div>

            <div className="space-y-4">
              {nodes.map((node, index) => {
                const assignedAgent = availableAgents.find((a) => a.id === node.agentId);
                return (
                  <div key={node.id} className="relative">
                    {index > 0 && (
                      <div className="flex justify-center -mt-2.5 -mb-2.5 relative z-10">
                        <div className="p-1 rounded-full bg-slate-800 text-indigo-400 border border-slate-700 shadow">
                          <ArrowDown className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    )}

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 hover:border-slate-700 transition-all space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-indigo-900/60 border border-indigo-700/50 flex items-center justify-center text-xs font-bold text-indigo-300">
                            {index + 1}
                          </span>
                          <input
                            type="text"
                            value={node.name}
                            onChange={(e) => updateStep(index, "name", e.target.value)}
                            placeholder="Stage Name"
                            className="bg-transparent text-sm font-semibold text-slate-100 focus:outline-none focus:border-b border-indigo-500 px-1"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateStep(index, "humanApprovalRequired", !node.humanApprovalRequired)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                              node.humanApprovalRequired
                                ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300"
                            }`}
                            title="Require Human Approval before proceeding"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>{node.humanApprovalRequired ? "Human Gate" : "Auto"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => removeStep(index)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Assigned Agent</label>
                          <select
                            value={node.agentId}
                            onChange={(e) => updateStep(index, "agentId", e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                          >
                            {availableAgents.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.avatar} {a.name} ({a.role})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Scratchpad Output Variable</label>
                          <input
                            type="text"
                            value={node.outputKey}
                            onChange={(e) => updateStep(index, "outputKey", e.target.value)}
                            placeholder="e.g. research_summary"
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Prompt Template (Supports variables like <code className="text-indigo-400">{"{{topic}}"}</code>, <code className="text-indigo-400">{"{{niche}}"}</code>, or outputs from previous steps)
                        </label>
                        <textarea
                          rows={2}
                          value={node.promptTemplate}
                          onChange={(e) => updateStep(index, "promptTemplate", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit */}
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
              <span>{loading ? "Saving..." : workflowToEdit ? "Update Workflow" : "Create Workflow"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
