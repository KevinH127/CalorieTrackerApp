import { Trash2, Utensils } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export function FoodEntry({ entry, onDelete }) {
  // Format the timestamp to a readable time
  const timeString = entry.timestamp 
    ? format(new Date(entry.timestamp), "h:mm a")
    : "";

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="group flex items-center justify-between p-4 bg-neutral-800/40 hover:bg-neutral-800/60 transition-colors border border-white/5 rounded-2xl"
    >
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
          <Utensils className="w-5 h-5" />
        </div>
        
        <div>
          <h4 className="font-medium text-white capitalize">{entry.foodName}</h4>
          <p className="text-sm text-neutral-400">
            {entry.calories} calories • {entry.protein}g protein {timeString && `• ${timeString}`}
          </p>
        </div>
      </div>
      
      <button
        onClick={() => onDelete(entry.id)}
        className="p-2 text-neutral-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-xl hover:bg-neutral-700/50"
        aria-label="Delete entry"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </motion.div>
  );
}
