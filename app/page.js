"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FoodInput } from "./components/FoodInput";
import { DailyDashboard } from "./components/DailyDashboard";
import { getEntriesForDateAction, addEntryAction, deleteEntryAction } from "./actions/entry";
import { format } from "date-fns";

export default function Home() {
  const { data: session } = useSession();
  const [entries, setEntries] = useState([]);
  const [selectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  
  const isToday = true;

  // Load initial data for selected date
  useEffect(() => {
    async function loadData() {
      if (!session?.user?.id) return;
      
      setIsLoading(true);
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      const result = await getEntriesForDateAction(session.user.id, formattedDate);
      
      if (result.success) {
        setEntries(result.entries);
      }
      setIsLoading(false);
    }
    
    loadData();
  }, [session, selectedDate]);

  const handleFoodLogged = async (newEntryData) => {
    if (!session?.user?.id) return;
    
    // Always log to the current timestamp for the main food input
    const entryData = {
       ...newEntryData,
       timestamp: new Date().toISOString()
    };
    
    const result = await addEntryAction(session.user.id, entryData);
    if (result.success) {
      if (isToday) {
        setEntries((prev) => [result.entry, ...prev].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)));
      }
    } else {
      alert(result.error || "Failed to save food entry to database.");
    }
  };

  const handleAddPastEntry = async (newEntryData) => {
    if (!session?.user?.id) return;
    
    const result = await addEntryAction(session.user.id, newEntryData);
    if (result.success) {
      setEntries((prev) => [result.entry, ...prev].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)));
    }
  };

  const handleDeleteEntry = async (id) => {
    if (!session?.user?.id) return;
    
    const result = await deleteEntryAction(session.user.id, id);
    if (result.success) {
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
    }
  };

  if (!session) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center pt-8 pb-20 px-4 h-full">
         <div className="animate-pulse flex flex-col items-center">
           <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
           <p className="text-neutral-400">Loading your profile...</p>
         </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col pt-4 pb-20 px-4 md:px-8 max-w-6xl w-full mx-auto sm:pt-8 sm:pb-24">
      <header className="mb-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
            Calorie
          </span>
          <span className="text-white">Tracker</span>
        </h1>
        <p className="text-neutral-400 max-w-lg mx-auto text-lg">
          Log your meals using photo or text, and let AI calculate the calories instantly.
        </p>
      </header>
      
      <div className="max-w-3xl mx-auto flex flex-col gap-12 w-full">
        <FoodInput onFoodLogged={handleFoodLogged} />
        
        {/* Dashboard List */}
        <div>
          {isLoading ? (
             <div className="w-full h-64 bg-neutral-900/50 rounded-3xl animate-pulse border border-white/5" />
          ) : (
            <DailyDashboard 
              entries={entries} 
              onDeleteEntry={handleDeleteEntry}
              selectedDate={selectedDate}
              onAddPastEntry={handleAddPastEntry}
              userId={session.user.id}
            />
          )}
        </div>
      </div>
    </main>
  );
}
