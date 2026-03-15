-- CreateEnum
CREATE TYPE "GoalMode" AS ENUM ('DEFICIT', 'MAINTAIN', 'SURPLUS');

-- CreateTable
CREATE TABLE "GoalHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "calorieGoal" INTEGER NOT NULL,
    "proteinGoal" INTEGER NOT NULL,
    "mode" "GoalMode" NOT NULL DEFAULT 'MAINTAIN',
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoalHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GoalHistory_userId_effectiveFrom_idx" ON "GoalHistory"("userId", "effectiveFrom");

-- AddForeignKey
ALTER TABLE "GoalHistory" ADD CONSTRAINT "GoalHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
