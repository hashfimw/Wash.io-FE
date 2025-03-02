export const getTimeDifferenceString = (date: string) => {
  const now = new Date();
  const nowNumber = now.getTime();
  const target = toLocalTime(date);
  const result = nowNumber - target;

  let time = "";
  let isDate = false;

  if (result < 1000) time = "a moment ago";
  else if (result >= 1000 && result < 2000) time = `1 second ago`;
  else if (result >= 2000 && result < 60000) time = `${Math.floor(result / 1000)} seconds ago`;
  else if (result >= 60000 && result < 120000) time = `1 minute ago`;
  else if (result >= 120000 && result < 3600000) time = `${Math.floor(result / 60000)} minutes ago`;
  else if (result >= 3600000 && result < 7200000) time = `1 hour ago`;
  else if (result >= 7200000 && result < 86400000) time = `${Math.floor(result / 3600000)} hours ago`;
  else if (result >= 86400000 && result < 172800000) time = `1 day ago`;
  else if (result >= 172800000 && result < 604800000) time = `${Math.floor(result / 86400000)} days ago`;
  else if (result >= 604800000) {
    time = new Date(target).toLocaleString();
    isDate = true;
  }

  return { time, isDate };
};

export const toLocalTime = (date: string) => {
  const tzo = new Date().getTimezoneOffset() * 60000;
  return new Date(date).getTime() - tzo;
};

export const toUTCtime = (date: string | null) => {
  const tzo = new Date().getTimezoneOffset();
  if (date) return new Date(new Date(date).getTime() + tzo * 60000).toISOString();
};

export const toLocalTimeString = (date: Date) => {
  return new Date(toLocalTime(date.toISOString())).toISOString().split("T")[0];
};
