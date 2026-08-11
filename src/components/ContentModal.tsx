"use client";

import React, { useState, useEffect } from "react";
import { X, FileText, Check, Copy, Share2, Sparkles } from "lucide-react";
import { useToast } from "./Toast";

interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  contentToEdit?: any;
}

const PLATFORMS = [
  { id: "twitter", label: "X / Twitter Thread" },
  { id: "substack", label: "Substack Newsletter" },
  { id: "linkedin", label: "LinkedIn Post" },
  { id: "youtube", label: "YouTube Shorts Script" },
  { id: "instagram", label: "Instagram Caption" },
  { id: "blog", label: "Blog Article" },
];

export function ContentModal({ isOpen, onClose, onSaved, contentToEdit }: ContentModalProps) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    platform: "twitter",
    status: "draft",
    content: "",
    niche: "AI & Dev Tools",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (contentToEdit) {
      setFormData({
        title: contentToEdit.title || "",
        platform: contentToEdit.platform || "twitter",
        status: contentToEdit.status || "draft",
        content: contentToEdit.content || "",
        niche: contentToEdit.niche || "AI & Dev Tools",
      });
    } else {
      setFormData({
        title: "",
        platform: "twitter",
        status: "draft",
        content: "",
        niche: "AI & Dev Tools",
      });
    }
  }, [contentToEdit, isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(formData.content);
    showToast("Content copied to clipboard!", "success");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      showToast("Please fill out title and content", "error");
      return;
    }

    setLoading(true);
    try {
      const url = contentToEdit ? `/api/content/${contentToEdit.id}` : "/api/content";
      const method = contentToEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        showToast(contentToEdit ? "Content updated!" : "New content piece created!", "success");
        onSaved();
        onClose();
      } else {
        showToast("Failed to save content", "error");
      }
    } catch (e) {
      showToast("Error saving content", "error");
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
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                {contentToEdit ? "Edit Content Artifact" : "Create Content Piece"}
              </h3>
              <p className="text-xs text-slate-400">Multi-channel post editor and publisher</p>
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Why Local Agent Swarms beat Cloud APIs"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Platform</label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
              >
                {PLATFORMS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Publication Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-300">Formatted Content Body</label>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Body</span>
              </button>
            </div>
            <textarea
              rows={10}
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Post content, thread text, script..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-mono focus:outline-none focus:border-indigo-500"
            />
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
              <span>{loading ? "Saving..." : contentToEdit ? "Update Artifact" : "Save Artifact"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
