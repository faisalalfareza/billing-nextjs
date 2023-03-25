export function typeNormalization(value) {
  try {
    return JSON.parse(value);
  } catch (e) {
    return value;
  }
}

export function capitalizeFirstLetter(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
