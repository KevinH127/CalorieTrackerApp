"use client";

import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import { getAllUserEntriesAction } from "../actions/entry";
import { getGoalHistoryAction } from "../actions/goal";
import { format, isSameDay } from "date-fns";
import 'react-calendar/dist/Calendar.css';
import { CalendarDays } from "lucide-react";

export function HistoryCalendar({ selectedDate, onSelectDate, userId }) {
  const [entries, setEntries] = useState([]);
  const [goals, setGoals] = useState([]);
  
  useEffect(() => {
    async function loadData() {
      if (!userId) return;
      const [entriesRes, goalsRes] = await Promise.all([
        getAllUserEntriesAction(userId),
        getGoalHistoryAction(userId)
      ]);
      
      if (entriesRes.success) setEntries(entriesRes.entries);
      if (goalsRes.success) setGoals(goalsRes.goals);
    }
    loadData();
  }, [userId]);

  // Create a map of date string (YYYY-MM-DD) to total calories
  const dailyCalories = entries.reduce((acc, entry) => {
    const dateStr = format(new Date(entry.timestamp), 'yyyy-MM-dd');
    acc[dateStr] = (acc[dateStr] || 0) + entry.calories;
    return acc;
  }, {});

  const getGoalForDate = (date) => {
    // Goals are sorted by effectiveFrom desc
    // Find the first goal where effectiveFrom <= date
    return goals.find(g => new Date(g.effectiveFrom) <= date);
  };

  const isGoalMet = (date, calories) => {
    const goal = getGoalForDate(date);
    if (!goal) return null; // No goal set

    const { calorieGoal, mode } = goal;
    if (mode === "DEFICIT") return calories <= calorieGoal;
    if (mode === "MAINTAIN") return Math.abs(calories - calorieGoal) <= 100;
    if (mode === "SURPLUS") return calories >= calorieGoal;
    return null;
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = format(date, 'yyyy-MM-dd');
      const cals = dailyCalories[dateStr];
      
      if (cals !== undefined) {
        const metStatus = isGoalMet(date, cals);
        let colorClass = "text-emerald-400 bg-emerald-500/10"; // Default
        
        if (metStatus === true) colorClass = "text-emerald-400 bg-emerald-500/15 ring-1 ring-emerald-500/30";
        else if (metStatus === false) colorClass = "text-rose-400 bg-rose-500/15 ring-1 ring-rose-500/30";

        return (
          <div className="flex flex-col items-center justify-center mt-1">
            <div className={`text-[10px] font-bold ${colorClass} px-1.5 py-0.5 rounded-md transition-all`}>
              {cals}
            </div>
          </div>
        );
      }
    }
    return null;
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = format(date, 'yyyy-MM-dd');
      const isSelected = format(selectedDate, 'yyyy-MM-dd') === dateStr;
      const hasCalories = !!dailyCalories[dateStr];
      
      let classes = "rounded-xl transition-all duration-200 relative ";
      
      if (isSelected) {
        classes += "bg-emerald-600/30 font-bold border border-emerald-500/50 ";
      } else if (hasCalories) {
        classes += "hover:bg-neutral-800 ";
      } else {
        classes += "hover:bg-neutral-800 opacity-60 hover:opacity-100 ";
      }
      
      return classes;
    }
    return "";
  };

  return (
    <div className="bg-neutral-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
      
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <div className="p-2 bg-purple-500/20 rounded-xl text-purple-400">
          <CalendarDays className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-white">History</h2>
      </div>

      <style jsx global>{`
        .react-calendar {
          width: 100%;
          background: transparent;
          border: none;
          font-family: inherit;
          color: white;
        }
        .react-calendar__navigation button {
          color: white;
          min-width: 44px;
          background: none;
          border-radius: 12px;
        }
        .react-calendar__navigation button:enabled:hover,
        .react-calendar__navigation button:enabled:focus {
          background-color: rgba(255, 255, 255, 0.1);
        }
        .react-calendar__month-view__weekdays {
          text-transform: uppercase;
          font-weight: 600;
          font-size: 0.75rem;
          color: #9ca3af; /* neutral-400 */
        }
        .react-calendar__month-view__weekdays__weekday abbr {
          text-decoration: none;
        }
        .react-calendar__tile {
          padding: 0.8rem 0.5rem;
          background: none;
          color: white;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          height: 64px;
        }
        .react-calendar__tile:enabled:hover,
        .react-calendar__tile:enabled:focus {
          background-color: rgba(255, 255, 255, 0.05);
        }
        .react-calendar__tile--now {
          background: transparent !important;
          color: white;
        }
        .react-calendar__tile--now > abbr {
          display: inline-block;
          border-bottom: 2px solid #34d399; /* emerald-400 */
          padding-bottom: 2px;
        }
        .react-calendar__tile--active {
          background: transparent !important;
        }
        .react-calendar__month-view__days__day--neighboringMonth {
          color: #4b5563 !important; /* neutral-600 */
        }
      `}</style>

      <div className="relative z-10">
        <Calendar 
          onChange={onSelectDate} 
          value={selectedDate}
          tileContent={tileContent}
          tileClassName={tileClassName}
          prev2Label={null}
          next2Label={null}
        />
      </div>
    </div>
  );
}
