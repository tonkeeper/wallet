export async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function jsonToUrl(obj: Record<string, any>) {
  return Object.keys(obj)
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`)
    .join("&");
}
