# Calorie and Protein Goals

## Goal
Add daily calorie and protein goals with historical snapshot tracking and dashboard/calendar integration.

## Tasks
- [ ] Update `prisma/schema.prisma` with `GoalHistory` model and `GoalMode` enum → Verify: `npx prisma migrate dev` succeeds.
- [ ] Implement `upsertGoalAction` in `app/actions/goal.js` → Verify: Goal record created in DB.
- [ ] Implement `getGoalForDateAction` in `app/actions/goal.js` → Verify: Correct goal returned for a given date.
- [ ] Add `GoalEditor` UI to `DailyDashboard.jsx` → Verify: Clicking "Set Goals" shows form.
- [ ] Update `DailyDashboard.jsx` logic for Red/Green colors based on mode → Verify: Dashboard colors match intake vs goal.
- [ ] Update `HistoryCalendar.jsx` to pull goal data for each day → Verify: Calendar tile colors reflect goal success.
- [ ] Verify persistence across goal changes (Snapshots work) → Verify: Changing today's goal doesn't change color of yesterday's goal.

## Done When
- [ ] User can set daily goals for calories and protein.
- [ ] Dashboard shows color-coded progress based on mode (Deficit, Maintain, Surplus).
- [ ] History calendar correctly reflects historical goal success using snapshots.
