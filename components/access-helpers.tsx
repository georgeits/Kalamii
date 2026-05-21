import { LockedOverlay, Pill, PremiumButton } from "@/components/ui";
import { getAccessLevelLabel, hasAccessToLevel, type AccessLevel } from "@/src/lib/access";

export function AccessBadge({
  userPlan,
  requiredLevel,
}: {
  userPlan: AccessLevel;
  requiredLevel: AccessLevel;
}) {
  if (requiredLevel === "free") {
    return null;
  }

  const hasAccess = hasAccessToLevel(userPlan, requiredLevel);
  return (
    <Pill tone={hasAccess ? "success" : "gold"}>
      {hasAccess ? `${getAccessLevelLabel(requiredLevel)} ხელმისაწვდომია` : `${getAccessLevelLabel(requiredLevel)} • ჩაკეტილია`}
    </Pill>
  );
}

export function LockedContent({
  requiredLevel,
}: {
  requiredLevel: AccessLevel;
}) {
  return (
    <div className="space-y-4 rounded-[20px] border border-[rgba(244,177,93,0.2)] bg-[rgba(244,177,93,0.08)] p-5">
      <LockedOverlay label={getAccessLevelLabel(requiredLevel)} />
      <p className="text-sm text-white">
        {requiredLevel === "premium"
          ? "ეს მასალა ხელმისაწვდომია მხოლოდ პრემიუმ პაკეტში."
          : "ეს მასალა ხელმისაწვდომია მხოლოდ სტანდარტ ან პრემიუმ პაკეტში."}
      </p>
      <PremiumButton href="/profile">პაკეტის განახლება</PremiumButton>
    </div>
  );
}
