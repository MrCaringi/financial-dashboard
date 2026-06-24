"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateFireflyUrl, updateFireflyPat } from "../actions";
import { Database, Loader2, Check, AlertCircle, Save, Trash2, Eye, EyeOff } from "lucide-react";

interface ApiConnectionClientProps {
  apiUrl: string;
  urlSource: "env" | "override";
  patSource: "env" | "override" | "none";
  activePatMasked: string;
}

export function ApiConnectionClient({
  apiUrl,
  urlSource,
  patSource,
  activePatMasked,
}: ApiConnectionClientProps) {
  const router = useRouter();

  // --- API URL management states ---
  const [newUrl, setNewUrl] = useState(apiUrl);
  const [isUrlPending, startUrlTransition] = useTransition();
  const [urlStatus, setUrlStatus] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  const handleSaveUrl = () => {
    setUrlStatus(null);
    if (!newUrl.trim()) return;

    startUrlTransition(async () => {
      const result = await updateFireflyUrl(newUrl);
      if (result.success) {
        setUrlStatus({ success: true, message: "API URL updated successfully!" });
        router.refresh();
      } else {
        setUrlStatus({ success: false, message: result.error || "Failed to update URL" });
      }
    });
  };

  const handleRemoveUrl = () => {
    setUrlStatus(null);
    startUrlTransition(async () => {
      const result = await updateFireflyUrl(null);
      if (result.success) {
        setUrlStatus({ success: true, message: "Custom API URL removed. Reverted to environment config." });
        setNewUrl(process.env.NEXT_PUBLIC_DEFAULT_FIREFLY_URL || "http://localhost:8080");
        router.refresh();
      } else {
        setUrlStatus({ success: false, message: result.error || "Failed to remove URL" });
      }
    });
  };

  // --- PAT management states ---
  const [newPat, setNewPat] = useState("");
  const [showPat, setShowPat] = useState(false);
  const [isPatPending, startPatTransition] = useTransition();
  const [patStatus, setPatStatus] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  const handleSavePat = () => {
    setPatStatus(null);
    if (!newPat.trim()) return;

    startPatTransition(async () => {
      const result = await updateFireflyPat(newPat);
      if (result.success) {
        setPatStatus({ success: true, message: "Firefly token updated successfully!" });
        setNewPat("");
        router.refresh();
      } else {
        setPatStatus({ success: false, message: result.error || "Failed to update token" });
      }
    });
  };

  const handleRemovePat = () => {
    setPatStatus(null);
    startPatTransition(async () => {
      const result = await updateFireflyPat(null);
      if (result.success) {
        setPatStatus({ success: true, message: "Custom token removed. Reverted to environment config." });
        router.refresh();
      } else {
        setPatStatus({ success: false, message: result.error || "Failed to remove token" });
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. API Address section */}
      <div className="glass-card p-5 flex flex-col gap-4">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-zinc-400 uppercase tracking-wide">API Address</span>
          <span className="text-zinc-500 text-[10px]">
            Source: {urlSource === "override" ? "Custom Override" : "Environment (.env)"}
          </span>
        </div>

        <div className="flex flex-col gap-1.5 mt-1">
          <label htmlFor="new-url-input" className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
            Firefly API URL
          </label>
          <input
            id="new-url-input"
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            disabled={isUrlPending}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700"
            placeholder="e.g. http://your-server:8080"
          />
        </div>

        <div className="flex flex-wrap gap-2 justify-end mt-1">
          {urlSource === "override" && (
            <button
              type="button"
              onClick={handleRemoveUrl}
              disabled={isUrlPending}
              className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 active:scale-[0.98] transition-all px-3 py-2 rounded-xl text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5"
            >
              <Trash2 size={13} />
              <span>Remove Custom URL</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleSaveUrl}
            disabled={isUrlPending || newUrl.trim() === apiUrl}
            className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200 active:scale-[0.98] transition-all px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5"
          >
            {isUrlPending ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Save size={13} />
            )}
            <span>Save URL</span>
          </button>
        </div>

        {urlStatus && (
          <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 mt-2 ${
            urlStatus.success
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}>
            {urlStatus.success ? <Check size={14} /> : <AlertCircle size={14} />}
            <span>{urlStatus.message}</span>
          </div>
        )}
      </div>

      {/* 2. Access Token section */}
      <div className="glass-card p-5 flex flex-col gap-4">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-zinc-400 uppercase tracking-wide">Access Token Key</span>
          <span className="text-zinc-500 text-[10px]">
            Source: {patSource === "override" ? "Custom Override" : patSource === "env" ? "Environment (.env)" : "None"}
          </span>
        </div>
        
        {activePatMasked && (
          <div className="text-xs font-mono bg-zinc-900/80 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-300">
            Active key: {activePatMasked}
          </div>
        )}

        <div className="flex flex-col gap-1.5 mt-2">
          <label htmlFor="new-pat-input" className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
            Update Firefly Token (PAT)
          </label>
          <div className="relative flex items-center">
            <input
              id="new-pat-input"
              type={showPat ? "text" : "password"}
              value={newPat}
              onChange={(e) => setNewPat(e.target.value)}
              disabled={isPatPending}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-3 pr-10 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700"
              placeholder="Paste new Personal Access Token..."
            />
            <button
              type="button"
              onClick={() => setShowPat(!showPat)}
              className="absolute right-3 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              {showPat ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-end mt-2">
          {patSource === "override" && (
            <button
              type="button"
              onClick={handleRemovePat}
              disabled={isPatPending}
              className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 active:scale-[0.98] transition-all px-3 py-2 rounded-xl text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5"
            >
              <Trash2 size={13} />
              <span>Remove Custom Key</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleSavePat}
            disabled={isPatPending || !newPat.trim()}
            className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200 active:scale-[0.98] transition-all px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5"
          >
            {isPatPending ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Save size={13} />
            )}
            <span>Save Key</span>
          </button>
        </div>

        {patStatus && (
          <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 mt-2 ${
            patStatus.success
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}>
            {patStatus.success ? <Check size={14} /> : <AlertCircle size={14} />}
            <span>{patStatus.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}
