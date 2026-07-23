export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getLocalDateString(date = new Date()): string {
  // Pad function
  const pad = (num: number) => num.toString().padStart(2, '0');
  
  // Create a formatter for Asia/Jakarta (WIB is UTC+7)
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  // Format returns YYYY-MM-DD in en-CA locale
  return formatter.format(date);
}
