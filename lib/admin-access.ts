const DEFAULT_ADMIN_EMAILS = ["barber@nile.ng"];

export function getAdminEmails() {
  const configured = process.env.ADMIN_EMAILS
    ?.split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (configured && configured.length > 0) {
    return configured;
  }

  return DEFAULT_ADMIN_EMAILS;
}

export function isAdminEmail(email: string) {
  return getAdminEmails().includes(email.trim().toLowerCase());
}
