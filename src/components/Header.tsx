"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, User, ChevronDown, Check, Plus, RefreshCw, Cpu } from "lucide-react";
import { useToast } from "./Toast";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  niche: string;
  brandVoice?: string;
  avatarUrl?: string;
}

export function Header() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accounts, setAccounts] = useState<UserProfile[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setAccounts(data.availableAccounts || []);
      }
    } catch (e) {
      console.error("Error fetching user", e);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const switchAccount = async (targetId: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetId }),
      });
      if (res.ok) {
        showToast("Switched active creator workspace", "success");
        setDropdownOpen(false);
        window.location.reload();
      }
    } catch (e) {
      showToast("Failed to switch workspace", "error");
    } finally {
      setLoading(false);
    }
  };

  const seedDB = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      if (res.ok) {
        showToast("Seeded database with fresh demo data!", "success");
        window.location.reload();
      }
    } catch (e) {
      showToast("Error seeding database", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="h-16 bg-slate-900/90 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
      {/* Left: Active Workspace / Niche info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium">
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span>Active Niche:</span>
          <span className="text-indigo-300 font-semibold">{user?.niche || "AI & Dev Tools"}</span>
        </div>
      </div>

      {/* Right: Account Switcher & Seeder */}
      <div className="flex items-center gap-3">
        <button
          onClick={seedDB}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-all"
          title="Reset or seed demo data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-400" : ""}`} />
          <span className="hidden sm:inline">Seed Demo Data</span>
        </button>

        {/* Profile Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-medium transition-all"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-7 h-7 rounded-lg object-cover ring-1 ring-indigo-500/50" />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                {user?.name?.[0] || "U"}
              </div>
            )}
            <div className="flex flex-col text-left leading-none">
              <span className="font-semibold text-slate-100">{user?.name || "Alex Rivera"}</span>
              <span className="text-[10px] text-slate-400 mt-0.5">{user?.email || "alex@creator.ai"}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Creator Workspace
                </p>
              </div>

              <div className="space-y-1">
                {accounts.map((acc) => {
                  const isCurrent = acc.id === user?.id;
                  return (
                    <button
                      key={acc.id}
                      onClick={() => switchAccount(acc.id)}
                      className={`flex items-center justify-between w-full p-2.5 rounded-xl text-xs font-medium transition-all ${
                        isCurrent
                          ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                          : "text-slate-300 hover:bg-slate-800/80 hover:text-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {acc.avatarUrl ? (
                          <img src={acc.avatarUrl} alt={acc.name} className="w-6 h-6 rounded-md object-cover" />
                        ) : (
                          <div className="w-6 h-6 rounded-md bg-slate-700 flex items-center justify-center text-xs">
                            {acc.name[0]}
                          </div>
                        )}
                        <div className="flex flex-col text-left truncate">
                          <span className="font-semibold text-slate-200">{acc.name}</span>
                          <span className="text-[10px] text-slate-400">{acc.niche}</span>
                        </div>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => switchAccount("demo-user-1")}
                  className="flex items-center gap-2 w-full p-2 rounded-xl text-xs text-indigo-400 hover:bg-indigo-950/40 font-semibold transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Switch to Alex Rivera (Tech Swarm)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
