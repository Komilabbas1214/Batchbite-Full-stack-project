/**
 * Utility functions for Indian Rupee (INR) currency formatting
 */

export const CURRENCY_SYMBOL = '₹';

/**
 * Format a number or numeric string to INR (e.g., 1250 -> "₹1,250.00")
 * @param {number|string} amount
 * @param {boolean} showDecimals - Whether to force 2 decimal places (default: true)
 * @returns {string}
 */
export const formatCurrency = (amount, showDecimals = true) => {
  const num = Number(amount) || 0;
  return `₹${num.toLocaleString('en-IN', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
};

export default formatCurrency;
