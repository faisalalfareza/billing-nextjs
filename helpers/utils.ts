export function typeNormalization(value) {
  try {
    return JSON.parse(value);
  } catch (e) {
    return value;
  }
}
