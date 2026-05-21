export type UserRole = "admin" | "user";

export function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function getRoleForEmail(email: string): UserRole {
  return getAdminEmails().includes(email.trim().toLowerCase()) ? "admin" : "user";
}
