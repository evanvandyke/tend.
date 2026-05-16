export function detectPlatform(userAgent: string, isStandalone: boolean) {
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isAndroid = /Android/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
  const isChrome = /Chrome/.test(userAgent);
  return { isIOS, isAndroid, isSafari, isChrome, isStandalone };
}
