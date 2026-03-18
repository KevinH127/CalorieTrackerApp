import { Trash2, Utensils, Pencil, Check, X, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export function FoodEntry({ entry, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editName, setEditName] = useState(entry.foodName);
  const [editCalories, setEditCalories] = useState(entry.calories.toString());
  const [editProtein, setEditProtein] = useState(entry.protein.toString());

  // Format the timestamp to a readable time
  const timeString = entry.timestamp 
    ? format(new Date(entry.timestamp), "h:mm a")
    : "";

  const handleUpdate = async () => {
    if (!editName || !editCalories) return;
    
    setIsUpdating(true);
    const result = await onUpdate(entry.id, {
      foodName: editName,
      calories: parseInt(editCalories, 10),
      protein: parseInt(editProtein, 10) || 0,
    });
    
    if (result?.success) {
      setIsEditing(false);
    }
    setIsUpdating(false);
  };

  const handleCancel = () => {
    setEditName(entry.foodName);
    setEditCalories(entry.calories.toString());
    setEditProtein(entry.protein.toString());
    setIsEditing(false);
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="group flex items-center justify-between p-4 bg-neutral-800/40 hover:bg-neutral-800/60 transition-colors border border-white/5 rounded-2xl"
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
          <Utensils className="w-5 h-5" />
        </div>
        
        <div className="flex-1">
          {isEditing ? (
            <div className="flex flex-col gap-2 pr-4">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-neutral-900/50 border border-white/10 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full"
                placeholder="Food name"
                autoFocus
              />
              <div className="flex gap-2">
                <div className="flex items-center gap-1 bg-neutral-900/50 border border-white/10 rounded-lg px-2 py-1">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase">CAL</span>
                  <input
                    type="number"
                    value={editCalories}
                    onChange={(e) => setEditCalories(e.target.value)}
                    className="bg-transparent text-sm text-white focus:outline-none w-16"
                  />
                </div>
                <div className="flex items-center gap-1 bg-neutral-900/50 border border-white/10 rounded-lg px-2 py-1">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase">PRO</span>
                  <input
                    type="number"
                    value={editProtein}
                    onChange={(e) => setEditProtein(e.target.value)}
                    className="bg-transparent text-sm text-white focus:outline-none w-14"
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              <h4 className="font-medium text-white capitalize break-words">{entry.foodName}</h4>
              <p className="text-sm text-neutral-400">
                {entry.calories} calories • {entry.protein}g protein {timeString && `• ${timeString}`}
              </p>
            </>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        {isEditing ? (
          <>
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all"
              aria-label="Save changes"
            >
              {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
            </button>
            <button
              onClick={handleCancel}
              disabled={isUpdating}
              className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
              aria-label="Cancel editing"
            >
              <X className="w-5 h-5" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-neutral-500 hover:text-white opacity-40 group-hover:opacity-100 transition-all rounded-xl hover:bg-neutral-700/50"
              aria-label="Edit entry"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(entry.id)}
              className="p-2 text-neutral-500 hover:text-red-400 opacity-40 group-hover:opacity-100 transition-all rounded-xl hover:bg-neutral-700/50"
              aria-label="Delete entry"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
