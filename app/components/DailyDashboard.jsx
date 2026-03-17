"use client";

import { useMemo, useEffect, useState } from "react";
import { format } from "date-fns";
import { FoodEntry } from "./FoodEntry";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Plus, Loader2, Target, Settings2 } from "lucide-react";
import { GoalEditor } from "./GoalEditor";
import { getGoalForDateAction, upsertGoalAction } from "../actions/goal";

export function DailyDashboard({ entries, onDeleteEntry, onUpdateEntry, selectedDate, onAddPastEntry, userId }) {
  const displayDateFormatted = format(selectedDate || new Date(), "EEEE, MMMM do");
  const isPastDate = format(selectedDate || new Date(), "yyyy-MM-dd") !== format(new Date(), "yyyy-MM-dd");
  
  const [manualFoodName, setManualFoodName] = useState("");
  const [manualCalories, setManualCalories] = useState("");
  const [manualProtein, setManualProtein] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [currentGoal, setCurrentGoal] = useState(null);
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [isLoadingGoal, setIsLoadingGoal] = useState(false);
  
  // Load goal for selected date
  useEffect(() => {
    async function loadGoal() {
      if (!userId) return;
      setIsLoadingGoal(true);
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      const result = await getGoalForDateAction(userId, formattedDate);
      if (result.success) {
        setCurrentGoal(result.goal);
      }
      setIsLoadingGoal(false);
    }
    loadGoal();
  }, [userId, selectedDate]);

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

  const handleSaveGoal = async (goalData) => {
    if (!userId) return;
    const result = await upsertGoalAction(userId, {
      ...goalData,
      effectiveFrom: selectedDate.toISOString()
    });
    if (result.success) {
      setCurrentGoal(result.goal);
      setIsEditingGoals(false);
    }
  };

  const getCalorieColor = () => {
    if (!currentGoal) return "from-emerald-400 to-teal-300";
    
    const goal = currentGoal.calorieGoal;
    const mode = currentGoal.mode;
    
    let isMet = false;
    if (mode === "DEFICIT") isMet = totalCalories <= goal;
    else if (mode === "MAINTAIN") isMet = Math.abs(totalCalories - goal) <= 100;
    else if (mode === "SURPLUS") isMet = totalCalories >= goal;
    
    return isMet ? "from-emerald-400 to-teal-300" : "from-rose-400 to-orange-400";
  };

  const getProteinColor = () => {
    if (!currentGoal) return "text-white/90";
    const isMet = totalProtein >= currentGoal.proteinGoal;
    return isMet ? "text-emerald-400" : "text-rose-400";
  };

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
      <AnimatePresence>
        {isEditingGoals && (
          <GoalEditor 
            currentGoal={currentGoal} 
            onSave={handleSaveGoal} 
            onCancel={() => setIsEditingGoals(false)} 
          />
        )}
      </AnimatePresence>

      {!currentGoal && !isEditingGoals && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setIsEditingGoals(true)}
          className="w-full mb-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl group hover:bg-emerald-500/15 transition-all text-left flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Personalize Your Progress</h3>
              <p className="text-emerald-400/60 text-sm font-medium">Set daily calorie and protein goals to stay on track.</p>
            </div>
          </div>
          <div className="bg-emerald-500 text-black font-bold px-4 py-2 rounded-xl text-sm shadow-lg shadow-emerald-500/20 group-hover:translate-x-1 transition-transform">
            Set Goals
          </div>
        </motion.button>
      )}

      {/* Total Card */}
      <div className="bg-gradient-to-br from-neutral-800/80 to-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden group">
        <div className={`absolute -right-10 -top-10 w-40 h-40 ${currentGoal ? (getCalorieColor().includes("rose") ? "bg-rose-500/10" : "bg-emerald-500/20") : "bg-emerald-500/20"} blur-[80px] rounded-full pointer-events-none transition-colors duration-500`} />
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-neutral-400 font-medium mb-1">{displayDateFormatted}</p>
            <h2 className="text-3xl font-bold text-white">Daily Intake</h2>
          </div>
          <button 
            onClick={() => setIsEditingGoals(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-neutral-400 hover:text-white transition-all border border-white/5"
            title="Edit Goals"
          >
            <Settings2 className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Goals</span>
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-end gap-x-12 gap-y-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-end gap-2">
              <motion.span 
                key={"cal-" + totalCalories}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`text-6xl font-black tracking-tight bg-gradient-to-r ${getCalorieColor()} bg-clip-text text-transparent transition-all duration-500`}
              >
                {totalCalories}
              </motion.span>
              <span className="text-xl text-neutral-400 mb-2 font-medium">kcal</span>
            </div>
            {currentGoal && (
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 ml-1">
                <span>Goal: {currentGoal.calorieGoal}</span>
                <span className="w-1 h-1 bg-neutral-700 rounded-full" />
                <span className={getCalorieColor().includes("rose") ? "text-rose-500/80" : "text-emerald-500/80"}>
                  {currentGoal.mode}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-end gap-2">
              <motion.span 
                key={"pro-" + totalProtein}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`text-4xl font-bold tracking-tight transition-colors duration-500 ${getProteinColor()}`}
              >
                {totalProtein}
              </motion.span>
              <span className="text-lg text-neutral-400 mb-1 font-medium">g protein</span>
            </div>
            {currentGoal && (
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 ml-1">
                Goal: {currentGoal.proteinGoal}g
              </div>
            )}
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
                  onUpdate={onUpdateEntry}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
