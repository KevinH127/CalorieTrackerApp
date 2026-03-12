"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { FoodEntry } from "./FoodEntry";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Plus, Loader2 } from "lucide-react";
import { useState } from "react";

export function DailyDashboard({ entries, onDeleteEntry, selectedDate, onAddPastEntry }) {
  const displayDateFormatted = format(selectedDate || new Date(), "EEEE, MMMM do");
  const isPastDate = format(selectedDate || new Date(), "yyyy-MM-dd") !== format(new Date(), "yyyy-MM-dd");
  
  const [manualFoodName, setManualFoodName] = useState("");
  const [manualCalories, setManualCalories] = useState("");
  const [manualProtein, setManualProtein] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const totalCalories = useMemo(() => {
    return entries.reduce((sum, entry) => {
      const cals = parseInt(entry.calories, 10);
      return sum + (isNaN(cals) ? 0 : cals);
    }, 0);
  }, [entries]);

  const totalProtein = useMemo(() => {
    return entries.reduce((sum, entry) => {
      const prot = parseInt(entry.protein, 10);
      return sum + (isNaN(prot) ? 0 : prot);
    }, 0);
  }, [entries]);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualFoodName || !manualCalories) return;
    
    setIsSubmitting(true);
    await onAddPastEntry({
      foodName: manualFoodName,
      calories: parseInt(manualCalories, 10),
      protein: parseInt(manualProtein, 10) || 0,
      timestamp: selectedDate.toISOString(),
    });
    
    setManualFoodName("");
    setManualCalories("");
    setManualProtein("");
    setIsSubmitting(false);
  };

  return (
    <div className="w-full">
      {/* Total Card */}
      <div className="bg-gradient-to-br from-neutral-800/80 to-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/20 blur-[80px] rounded-full pointer-events-none" />
        
        <p className="text-neutral-400 font-medium mb-1">{displayDateFormatted}</p>
        <h2 className="text-3xl font-bold text-white mb-6">Daily Intake</h2>
        
        <div className="flex flex-col sm:flex-row sm:items-end gap-x-6 gap-y-2">
          <div className="flex items-end gap-2">
            <motion.span 
              key={"cal-" + totalCalories}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-6xl font-black tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent"
            >
              {totalCalories}
            </motion.span>
            <span className="text-xl text-neutral-400 mb-2 font-medium">calories</span>
          </div>

          <div className="flex items-end gap-2">
            <motion.span 
              key={"pro-" + totalProtein}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-4xl font-bold tracking-tight text-white/90"
            >
              {totalProtein}
            </motion.span>
            <span className="text-lg text-neutral-400 mb-1 font-medium">g protein</span>
          </div>
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white/90 flex items-center gap-2 px-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          Food Log
        </h3>
        
        {isPastDate && (
          <form onSubmit={handleManualSubmit} className="flex flex-wrap items-center gap-2 p-4 bg-neutral-800/40 border border-white/5 rounded-2xl mb-4">
            <input 
              type="text" 
              placeholder="Food name" 
              required
              value={manualFoodName}
              onChange={(e) => setManualFoodName(e.target.value)}
              className="flex-1 bg-neutral-900/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <input 
              type="number" 
              placeholder="Calories" 
              required
              min="0"
              value={manualCalories}
              onChange={(e) => setManualCalories(e.target.value)}
              className="w-24 bg-neutral-900/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <input 
              type="number" 
              placeholder="Protein (g)" 
              min="0"
              value={manualProtein}
              onChange={(e) => setManualProtein(e.target.value)}
              className="w-28 bg-neutral-900/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button 
              type="submit"
              disabled={isSubmitting || !manualFoodName || !manualCalories}
              className="bg-neutral-700 hover:bg-neutral-600 active:bg-neutral-500 text-white p-2 rounded-xl transition-colors disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            </button>
          </form>
        )}
        
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {entries.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12 px-4 rounded-3xl border border-dashed border-white/10 bg-neutral-900/30"
              >
                <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🍽️</span>
                </div>
                <p className="text-neutral-400 font-medium mb-1">No food logged yet</p>
                <p className="text-sm text-neutral-500">Log your first meal using the input above.</p>
              </motion.div>
            ) : (
              entries.map((entry) => (
                <FoodEntry 
                  key={entry.id} 
                  entry={entry} 
                  onDelete={onDeleteEntry} 
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
