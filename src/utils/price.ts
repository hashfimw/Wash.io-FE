// src/utils/price.ts
export const calculateLaundryPrice = (weight?: number): number => {
  const pricePerKilo = 8000;
  // Return 0 jika weight undefined, NaN, atau negatif
  return weight && weight > 0 ? weight * pricePerKilo : 0;
};

export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};
