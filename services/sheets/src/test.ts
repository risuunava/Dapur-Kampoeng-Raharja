import { appendTransaksiToSheet } from './appendTransaksi';

appendTransaksiToSheet({
  waktu: new Date().toISOString(),
  invoice: 'DKR-TEST-001',
  menu: 'Nasi Goreng',
  qty: 1,
  harga: 15000,
  total: 15000,
  kasir: 'test-kasir',
})
  .then(() => console.log('Berhasil append ke Sheet'))
  .catch(console.error);
