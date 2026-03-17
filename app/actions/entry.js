"use server";

import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";

export async function addEntryAction(userId, data) {
  try {
    const entry = await prisma.entry.create({
      data: {
        userId,
        foodName: data.foodName,
        calories: parseInt(data.calories, 10),
        protein: parseInt(data.protein, 10) || 0,
        timestamp: new Date(data.timestamp || Date.now()),
      }
    });
    revalidatePath("/");
    return { success: true, entry };
  } catch (error) {
    console.error("Failed to add entry:", error);
    return { error: "Failed to add entry to database." };
  }
}

export async function deleteEntryAction(userId, entryId) {
  try {
    // Ensure the entry belongs to the user before deleting
    const entry = await prisma.entry.findUnique({
      where: { id: entryId }
    });
    
    if (!entry || entry.userId !== userId) {
      return { error: "Unauthorized or entry not found." };
    }
    
    await prisma.entry.delete({
      where: { id: entryId }
    });
    
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete entry:", error);
    return { error: "Failed to delete entry from database." };
  }
}

export async function updateEntryAction(userId, entryId, data) {
  try {
    // Ensure the entry belongs to the user before updating
    const entry = await prisma.entry.findUnique({
      where: { id: entryId }
    });
    
    if (!entry || entry.userId !== userId) {
      return { error: "Unauthorized or entry not found." };
    }
    
    const updatedEntry = await prisma.entry.update({
      where: { id: entryId },
      data: {
        foodName: data.foodName,
        calories: parseInt(data.calories, 10),
        protein: parseInt(data.protein, 10) || 0,
      }
    });
    
    revalidatePath("/");
    return { success: true, entry: updatedEntry };
  } catch (error) {
    console.error("Failed to update entry:", error);
    return { error: "Failed to update entry in database." };
  }
}

export async function getEntriesForDateAction(userId, dateString) {
  try {
    // Parse the dateString (e.g. '2023-10-25') manually to avoid UTC offset issues bridging local days
    const [year, month, day] = dateString.split('-').map(Number);
    
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
    
    const entries = await prisma.entry.findMany({
      where: {
        userId,
        timestamp: {
          gte: startOfDay,
          lte: endOfDay,
        }
      },
      orderBy: { timestamp: "desc" }
    });
    
    return { success: true, entries };
  } catch (error) {
    console.error("Failed to get entries:", error);
    return { error: "Failed to retrieve entries." };
  }
}

export async function getAllUserEntriesAction(userId) {
   try {
     const entries = await prisma.entry.findMany({
       where: { userId },
       orderBy: { timestamp: "asc" }
     });
     return { success: true, entries };
   } catch (error) {
     console.error("Failed to get all entries:", error);
     return { error: "Failed to retrieve entries." };
   }
}
