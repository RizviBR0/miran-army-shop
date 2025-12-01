import { cookies, headers } from "next/headers";
import { SUPPORTED_COUNTRIES, getCountryByCode } from "@/lib/types/database";

const COUNTRY_COOKIE = "miranarmy_country";
const DEFAULT_COUNTRY = "US";

/**
 * Get the user's current country from cookie, Vercel geo header, or fallback
 * This is a server-side function
 */
export async function getCurrentCountry(): Promise<string> {
  const cookieStore = await cookies();
  const headersList = await headers();

  // 1. Check cookie first (user preference)
  const cookieCountry = cookieStore.get(COUNTRY_COOKIE)?.value;
  if (cookieCountry && getCountryByCode(cookieCountry)) {
    return cookieCountry;
  }

  // 2. Check Vercel geo header
  const vercelCountry = headersList.get("x-vercel-ip-country");
  if (vercelCountry && getCountryByCode(vercelCountry)) {
    return vercelCountry;
  }

  // 3. Fallback to default
  return DEFAULT_COUNTRY;
}

/**
 * Set the user's preferred country (client-side action)
 */
export async function setCountryCookie(countryCode: string) {
  "use server";

  const cookieStore = await cookies();

  if (getCountryByCode(countryCode)) {
    cookieStore.set(COUNTRY_COOKIE, countryCode, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax",
    });
  }
}

/**
 * Check if a product ships to a specific country
 */
export function shipsToCountry(
  shipping: { country_code: string; is_free: boolean }[],
  countryCode: string
): { ships: boolean; isFree: boolean } {
  // Check for exact country match
  const exactMatch = shipping.find((s) => s.country_code === countryCode);
  if (exactMatch) {
    return { ships: true, isFree: exactMatch.is_free };
  }

  // Check for worldwide shipping
  const worldwideMatch = shipping.find((s) => s.country_code === "ALL");
  if (worldwideMatch) {
    return { ships: true, isFree: worldwideMatch.is_free };
  }

  return { ships: false, isFree: false };
}
