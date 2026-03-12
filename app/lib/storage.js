/**
 * Utility functions for managing local storage entries
 */

export const STORAGE_KEY = "calorie_tracker_entries";

// Helper to format Date into YYYY-MM-DD
export function getTodayKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Loads entries for a specific date from localStorage
 * @param {string} dateKey - YYYY-MM-DD string
 * @returns {Array} List of food entries
 */
export function loadEntries(dateKey = getTodayKey()) {
  if (typeof window === "undefined") return [];
  
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) return [];
    
    const allData = JSON.parse(rawData);
    return allData[dateKey] || [];
  } catch (e) {
    console.error("Failed to load entries from localStorage", e);
    return [];
  }
}

/**
 * Saves entries for a specific date to localStorage
 * @param {Array} entries - List of food entries
 * @param {string} dateKey - YYYY-MM-DD string
 */
export function saveEntries(entries, dateKey = getTodayKey()) {
  if (typeof window === "undefined") return;
  
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    let allData = {};
    
    if (rawData) {
      allData = JSON.parse(rawData);
    }
    
    allData[dateKey] = entries;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
  } catch (e) {
    console.error("Failed to save entries to localStorage", e);
  }
}
