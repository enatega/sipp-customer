const configuredOrigin = process.env.EXPO_PUBLIC_STORE_WEB_BASE_URL?.trim()
  || 'https://sipp-delivery.netlify.app';

function webOrigin() {
  if (!configuredOrigin) return null;
  try {
    const url = new URL(configuredOrigin);
    return url.protocol === 'https:' ? url.origin : null;
  } catch {
    return null;
  }
}

const storeIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isStoreId = (value: string) => storeIdPattern.test(value);

export function storeShareUrl(storeId: string) {
  const origin = webOrigin();
  return origin && storeIdPattern.test(storeId)
    ? `${origin}/restaurants/${encodeURIComponent(storeId)}`
    : null;
}

export function storePathFromLink(value: string) {
  try {
    const url = new URL(value);
    const origin = webOrigin();
    const isWebLink = origin !== null && url.origin === origin;
    const isAppLink = url.protocol === 'sipp:' && url.hostname === 'restaurants';
    if (!isWebLink && !isAppLink) return null;
    const parts = url.pathname.split('/').filter(Boolean);
    const id = isAppLink && parts.length === 1
      ? parts[0]
      : isWebLink && parts.length === 2 && parts[0] === 'restaurants'
        ? parts[1]
        : null;
    return id && /^[a-z0-9_-]{1,100}$/i.test(id) ? id : null;
  } catch {
    return null;
  }
}
