"use client";

import { useState } from "react";
import { X, Save, Target, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function GoalEditor({ currentGoal, onSave, onCancel }) {
  const [calorieGoal, setCalorieGoal] = useState(currentGoal?.calorieGoal || 2000);
  const [proteinGoal, setProteinGoal] = useState(currentGoal?.proteinGoal || 150);
  const [mode, setMode] = useState(currentGoal?.mode || "MAINTAIN");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave({ calorieGoal, proteinGoal, mode });
    setIsSaving(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-neutral-800/60 border border-emerald-500/20 rounded-3xl p-6 mb-8 overflow-hidden"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-white text-lg">Set Daily Goals</h3>
        </div>
        <button 
          onClick={onCancel}
          className="p-1 hover:bg-white/5 rounded-full text-neutral-400"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 ml-1">Calorie Goal</label>
            <div className="relative">
              <input 
                type="number"
                value={calorieGoal}
                onChange={(e) => setCalorieGoal(e.target.value)}
                className="w-full bg-neutral-900/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                placeholder="2000"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">kcal</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 ml-1">Protein Goal</label>
            <div className="relative">
              <input 
                type="number"
                value={proteinGoal}
                onChange={(e) => setProteinGoal(e.target.value)}
                className="w-full bg-neutral-900/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                placeholder="150"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">g</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 ml-1">Calorie Strategy</label>
          <div className="grid grid-cols-3 gap-2">
            {["DEFICIT", "MAINTAIN", "SURPLUS"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  mode === m 
                    ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" 
                    : "bg-neutral-900/50 text-neutral-400 border border-white/5 hover:border-white/10"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-neutral-500 mt-2 px-1">
            {mode === "DEFICIT" && "Stay under your goal to stay Green."}
            {mode === "MAINTAIN" && "Stay within ±100 kcal of your goal to stay Green."}
            {mode === "SURPLUS" && "Exceed your goal to stay Green."}
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/10 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : <><Save className="w-4 h-4" /> Save Goals</>}
        </button>
      </form>
    </motion.div>
  );
}
