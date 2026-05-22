import type { AccessLevel } from "@/src/lib/access";

export type PaidPlan = Exclude<AccessLevel, "free">;

export const PLAN_PRICES: Record<PaidPlan, number> = {
  standard: 5,
  premium: 10,
};

export const PLAN_FEATURES: Record<AccessLevel, string[]> = {
  free: ["უფასო წვდომა", "თავდაპირველი მასალები"],
  standard: ["ავტორები", "ნაწარმოებები", "შინაარსები", "ანალიზები", "გეგმები"],
  premium: ["სრული ბიბლიოთეკა", "ტესტები", "სავარჯიშოები", "გამოცდის რეჟიმი", "ტექსტის რედაქტირება", "წაკითხულის გააზრება"],
};

export function isPaidPlan(value: string): value is PaidPlan {
  return value === "standard" || value === "premium";
}

export function getPlanLabel(plan: AccessLevel) {
  return {
    free: "უფასო",
    standard: "სტანდარტი",
    premium: "პრემიუმი",
  }[plan];
}

export function getPlanPriceLabel(plan: PaidPlan) {
  return `${PLAN_PRICES[plan]}₾ / თვე`;
}
