-- Ubah model menu dari rentang tanggal (start_date/end_date) ke single date
-- Jalankan di Supabase SQL Editor

ALTER TABLE menu ADD COLUMN date DATE;
UPDATE menu SET date = start_date;
ALTER TABLE menu ALTER COLUMN date SET NOT NULL;
ALTER TABLE menu ALTER COLUMN date SET DEFAULT CURRENT_DATE;
