export type AccessLevel = "free" | "standard" | "premium";

export function getAccessLevelLabel(accessLevel: AccessLevel) {
  return (
    {
      free: "უფასო",
      standard: "სტანდარტი",
      premium: "პრემიუმი",
    }[accessLevel] ?? accessLevel
  );
}

export function hasAccessToLevel(userPlan: AccessLevel, requiredLevel: AccessLevel) {
  const ranks: Record<AccessLevel, number> = {
    free: 0,
    standard: 1,
    premium: 2,
  };

  return ranks[userPlan] >= ranks[requiredLevel];
}
