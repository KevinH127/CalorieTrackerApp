"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { HistoryCalendar } from "../components/HistoryCalendar";
import { DailyDashboard } from "../components/DailyDashboard";
import { getEntriesForDateAction, addEntryAction, deleteEntryAction } from "../actions/entry";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [entries, setEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

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

  if (status === "loading" || !session) {
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
          <span className="text-white">Your </span>
          <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
            History
          </span>
        </h1>
        <p className="text-neutral-400 max-w-lg mx-auto text-lg">
          Review your past meals and add missing entries.
        </p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Calendar */}
        <div className="lg:col-span-5 flex flex-col gap-8 lg:sticky lg:top-8 z-10 w-full">
          <HistoryCalendar 
             selectedDate={selectedDate} 
             onSelectDate={setSelectedDate} 
             userId={session.user.id}
          />
        </div>
        
        {/* Right Column: Dashboard List */}
        <div className="lg:col-span-7 w-full overflow-hidden">
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
