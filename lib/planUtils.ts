import type { Plan } from "@/services/plan.service";

export const UNLIMITED_PLAN_CONTACT_EMAIL = "info@aistein.it";

/** User-facing: enterprise / unlimited tier — no self-serve checkout. */
export function isUnlimitedPlan(plan: Pick<Plan, "slug" | "name" | "price" | "features">): boolean {
  const slug = (plan.slug || "").toLowerCase();
  const name = (plan.name || "").toLowerCase();
  if (slug.includes("unlimited") || name.includes("unlimited")) {
    return true;
  }
  const f = plan.features;
  const allUnlimited =
    f?.callMinutes === -1 &&
    f?.chatConversations === -1 &&
    f?.automations === -1 &&
    f?.users === -1;
  return allUnlimited && plan.price >= 500;
}

export function unlimitedPlanContactMailto(): string {
  return `mailto:${UNLIMITED_PLAN_CONTACT_EMAIL}?subject=${encodeURIComponent("Unlimited Plan inquiry")}`;
}
