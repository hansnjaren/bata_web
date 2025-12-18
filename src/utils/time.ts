export const secToTimeString = (seconds: number) => {
  const sign = seconds < 0 ? "-" : "";
  const abs = Math.abs(seconds);

  const m = Math.floor(abs / 60)
    .toString()
    .padStart(2, "0");
  const s = (abs % 60).toFixed(3).padStart(6, "0");

  return `${sign}${m}:${s}`;
};

export const timeStringToSec = (str: string) => {
  const sign = str.startsWith("-") ? -1 : 1;
  const withoutSign = sign === -1 ? str.slice(1) : str;

  const [m, s] = withoutSign.split(":");
  return sign * (parseInt(m, 10) * 60 + parseFloat(s));
};
