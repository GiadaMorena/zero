import type { GoalItem } from "@/context/AppContext";
export function goalProgress(goal: Pick<GoalItem, "current" | "target">) {
  const current = Number.isFinite(goal.current) ? Math.max(0, Math.round(goal.current * 100)) : 0;
  const target = Number.isFinite(goal.target) ? Math.max(1, Math.round(goal.target * 100)) : 1;
  return { percent: Math.min(100, Math.floor(current / target * 100)), remaining: Math.max(0, target - current) / 100, completed: current >= target };
}
export function mainGoal(goals: GoalItem[], preferredId: string | null) {
  const active = goals.filter(goal => !goalProgress(goal).completed);
  return active.find(goal => goal.id === preferredId) || active[0] || null;
}
export function validGoal(title: string, target: number, current: number) {
  return !!title.trim() && Number.isFinite(target) && target >= .01 && Number.isFinite(current) && current >= 0;
}
