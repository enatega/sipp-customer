export function normalizeInternationalPhone(value: string): string {
  const phone = value.trim();
  const lastPrefix = phone.lastIndexOf('+');

  if (phone.startsWith('+') && lastPrefix > 0 && /^\+\d[\d\s()-]*$/.test(phone.slice(lastPrefix))) {
    return phone.slice(lastPrefix);
  }

  return phone;
}
