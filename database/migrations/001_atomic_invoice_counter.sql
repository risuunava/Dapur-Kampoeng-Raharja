-- Fungsi untuk generate invoice number secara atomic
-- Pakai SELECT ... FOR UPDATE untuk hindari race condition
-- Jalankan di Supabase SQL Editor

CREATE OR REPLACE FUNCTION generate_invoice_number(target_date DATE)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  next_number INTEGER;
  date_str TEXT;
BEGIN
  date_str := to_char(target_date, 'YYYYMMDD');

  INSERT INTO invoice_counter (date, last_number)
  VALUES (target_date, 0)
  ON CONFLICT (date) DO NOTHING;

  SELECT last_number + 1 INTO next_number
  FROM invoice_counter
  WHERE date = target_date
  FOR UPDATE;

  UPDATE invoice_counter
  SET last_number = next_number
  WHERE date = target_date;

  RETURN 'DKR-' || date_str || '-' || LPAD(next_number::TEXT, 3, '0');
END;
$$;
