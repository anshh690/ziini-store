export const CURRENCY_SYMBOL = '৳';
export const CURRENCY_CODE = 'BDT';

export function formatPrice(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return `${CURRENCY_SYMBOL}0.00`;
  }
  return `${CURRENCY_SYMBOL}${amount.toFixed(2)}`;
}
