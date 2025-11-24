export const secToTimeString = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toFixed(3).padStart(6, '0');
  return `${m}:${s}`;
};

export const timeStringToSec = (str: string) => {
  const [m, s] = str.split(":");
  return parseInt(m) * 60 + parseFloat(s);
};
