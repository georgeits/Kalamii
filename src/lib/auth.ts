export type UserRole = "admin" | "user";

export const ADMIN_EMAIL = "giorgijavakhishvili75@gmail.com";

export function getRoleForEmail(email: string): UserRole {
  return isAdminEmail(email) ? "admin" : "user";
}

export function isAdminEmail(email: string) {
  return email.trim().toLowerCase() === ADMIN_EMAIL;
}
