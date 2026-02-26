export const formatMoney = (value: number): string => {
  return `${value.toLocaleString("fr-FR")} F`;
};

export const formatDate = (isoDate: string): string => {
  return new Date(isoDate).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatRoute = (from: string, to: string): string => {
  return `De ${from} vers ${to}`;
};
