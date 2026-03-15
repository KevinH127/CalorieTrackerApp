"use server";

import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Upserts a goal for the user. 
 * If a goal already exists for "today" (or the effective date), it updates it.
 * Otherwise, it creates a new snapshot.
 */
export async function upsertGoalAction(userId, data) {
  try {
    const { calorieGoal, proteinGoal, mode, effectiveFrom } = data;
    const effectiveDate = new Date(effectiveFrom || new Date().setHours(0, 0, 0, 0));

    // Check if a goal snapshot already exists for this exact day
    const startOfDay = new Date(effectiveDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(effectiveDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingGoal = await prisma.goalHistory.findFirst({
      where: {
        userId,
        effectiveFrom: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    let goal;
    if (existingGoal) {
      goal = await prisma.goalHistory.update({
        where: { id: existingGoal.id },
        data: {
          calorieGoal: parseInt(calorieGoal, 10),
          proteinGoal: parseInt(proteinGoal, 10),
          mode,
        },
      });
    } else {
      goal = await prisma.goalHistory.create({
        data: {
          userId,
          calorieGoal: parseInt(calorieGoal, 10),
          proteinGoal: parseInt(proteinGoal, 10),
          mode,
          effectiveFrom: effectiveDate,
        },
      });
    }

    revalidatePath("/");
    revalidatePath("/history");
    return { success: true, goal };
  } catch (error) {
    console.error("Failed to upsert goal:", error);
    return { error: "Failed to save goal." };
  }
}

/**
 * Retrieves the goal active for a specific date.
 * Finds the latest goal entry where effectiveFrom <= date.
 */
export async function getGoalForDateAction(userId, dateString) {
  try {
    const targetDate = new Date(dateString);
    targetDate.setHours(23, 59, 59, 999); // Look for goals effective up to the end of this day

    const goal = await prisma.goalHistory.findFirst({
      where: {
        userId,
        effectiveFrom: {
          lte: targetDate,
        },
      },
      orderBy: {
        effectiveFrom: "desc",
      },
    });

    return { success: true, goal };
  } catch (error) {
    console.error("Failed to get goal for date:", error);
    return { error: "Failed to retrieve goal." };
  }
}

/**
 * Retrieves all goal history for a user.
 */
export async function getGoalHistoryAction(userId) {
  try {
    const goals = await prisma.goalHistory.findMany({
      where: { userId },
      orderBy: { effectiveFrom: "desc" },
    });
    return { success: true, goals };
  } catch (error) {
    console.error("Failed to get goal history:", error);
    return { error: "Failed to retrieve goal history." };
  }
}
