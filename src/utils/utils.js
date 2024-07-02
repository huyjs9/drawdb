export function dataURItoBlob(dataUrl) {
  const byteString = atob(dataUrl.split(",")[1]);
  const mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0];
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const intArray = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteString.length; i++) {
    intArray[i] = byteString.charCodeAt(i);
  }

  return new Blob([intArray], { type: mimeString });
}

export function arrayIsEqual(arr1, arr2) {
  return JSON.stringify(arr1) === JSON.stringify(arr2);
}

export function strHasQuotes(str) {
  if (str.length < 2) return false;

  return (
    (str[0] === str[str.length - 1] && str[0] === "'") ||
    (str[0] === str[str.length - 1] && str[0] === '"') ||
    (str[0] === str[str.length - 1] && str[0] === "`")
  );
}

const keywords = ["CURRENT_TIMESTAMP", "NULL"];

export function isKeyword(str) {
  return keywords.includes(str.toUpperCase());
}

export function isFunction(str) {
  return /\w+\([^)]*\)$/.test(str);
}

export function encodeBase64(str, urlSafe = false) {
  const uriEncodedStr = encodeURIComponent(str);
  const utf8Str = uriEncodedStr.replace(/%([0-9A-F]{2})/g, (_, p1) =>
    String.fromCharCode(`0x${p1}`),
  );
  const result = btoa(utf8Str);
  if (!urlSafe) {
    return result;
  }
  return result
    .replace(/\//g, "_") // Replace `/` with `_`
    .replace(/\+/g, "-") // Replace `+` with `-`
    .replace(/=+$/, ""); // Remove trailing `=`
}

export function decodeBase64(str) {
  // In case of URL safe base64
  const sanitizedStr = str.replace(/_/g, "/").replace(/-/g, "+");
  const utf8Str = atob(sanitizedStr);
  const uriEncodedStr = utf8Str
    .split("")
    .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
    .join("");
  return decodeURIComponent(uriEncodedStr);
}
