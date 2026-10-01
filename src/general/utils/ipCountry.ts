import type { PhoneInputProps } from 'react-native-phone-number-input';

type CountryCode = NonNullable<PhoneInputProps['defaultCode']>;

let cachedCountry: CountryCode | null = null;
let pendingLookup: Promise<CountryCode | null> | null = null;

async function lookupCountry(url: string, field: 'country' | 'country_code'): Promise<CountryCode | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2_500);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return null;
    const data: Record<string, unknown> = await response.json();
    const value = data[field];
    if (data.error || typeof value !== 'string') return null;
    const code = value.toUpperCase();
    return /^[A-Z]{2}$/.test(code) ? code as CountryCode : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export function getIpCountryCode(): Promise<CountryCode | null> {
  if (cachedCountry) return Promise.resolve(cachedCountry);
  if (pendingLookup) return pendingLookup;

  pendingLookup = (async () => {
    try {
      // IPinfo resolves the requesting device's public IP, so no IP collection call is needed.
      const country = await lookupCountry('https://ipinfo.io/json', 'country')
        ?? await lookupCountry('https://ipapi.co/json/', 'country_code');
      if (country) cachedCountry = country;
      return country;
    } finally {
      pendingLookup = null;
    }
  })();

  return pendingLookup;
}
