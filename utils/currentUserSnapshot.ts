import type { CurrentUser } from "@/types/user";

export const CURRENT_USER_COOKIE = "tg-current-user";

export function serializeCurrentUserSnapshot(user: CurrentUser) {
  return encodeURIComponent(JSON.stringify(user));
}

export function deserializeCurrentUserSnapshot(
  value: string | undefined,
): CurrentUser | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as CurrentUser;

    if (
      typeof parsed?.id !== "string" ||
      typeof parsed?.username !== "string" ||
      typeof parsed?.full_name !== "string" ||
      typeof parsed?.avatar_url !== "string"
    ) {
      return null;
    }

    return {
      id: parsed.id,
      username: parsed.username,
      full_name: parsed.full_name,
      avatar_url: parsed.avatar_url,
      email: typeof parsed.email === "string" || parsed.email === null
        ? parsed.email
        : null,
    };
  } catch {
    return null;
  }
}
