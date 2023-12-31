import getConfig from "next/config";

export function typeNormalization(value: any) {
  try {
    return JSON.parse(value);
  } catch (e) {
    return value;
  }
}

export function capitalizeFirstLetter(value: any) {
  try {
    return value.charAt(0).toUpperCase() + value.slice(1);
  } catch (e) {
    return value;
  }
}

export function getExtension(filename: string) {
  let parts = filename.split(".");
  return parts[parts.length - 1];
}
export function downloadTempFile(uri: any) {
  let fileUrl = joinUrl(uri);

  const url = getConfig().publicRuntimeConfig.apiUrl + "/" + fileUrl;
  window.open(url, "_blank"); //TODO: This causes reloading of same page in Firefox
}
function joinUrl(url: any) {
  let part = url.split("/");
  let indexTemp = part.indexOf("Temp");
  let length = part.length;
  let n = part.slice(indexTemp, length).join("/");
  return n;
}
