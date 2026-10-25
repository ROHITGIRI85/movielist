export const money = (amount = 0, currency = 'INR') => new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount / 100);
export const dateTime = (value) => new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
