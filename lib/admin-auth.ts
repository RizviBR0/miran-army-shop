import { cookies } from "next/headers";

export interface AdminSession {
  id: string;
  email: string;
  role: string;
  exp: number;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("miranarmy_admin_session");

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const sessionData = JSON.parse(
      Buffer.from(sessionCookie.value, "base64").toString()
    ) as AdminSession;

    // Check if session is expired
    if (sessionData.exp < Date.now()) {
      return null;
    }

    // Check if role is ADMIN
    if (sessionData.role !== "ADMIN") {
      return null;
    }

    return sessionData;
  } catch {
    return null;
  }
}
