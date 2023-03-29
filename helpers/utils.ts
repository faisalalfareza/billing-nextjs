export function typeNormalization(value: any) {
  try {
    return JSON.parse(value);
  } catch (e) {
    return value;
  }
}

export function capitalizeFirstLetter(value: any) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
