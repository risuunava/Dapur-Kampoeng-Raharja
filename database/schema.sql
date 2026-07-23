CREATE TABLE menu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'tersedia',
  image_url TEXT
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  pin_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'kasir'))
);

CREATE TABLE transaksi (
  id UUID PRIMARY KEY,
  invoice TEXT UNIQUE,
  items JSONB NOT NULL,
  total INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  kasir_id UUID REFERENCES users(id),
  device_id TEXT,
  sync_status TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE invoice_counter (
  date DATE PRIMARY KEY,
  last_number INTEGER NOT NULL DEFAULT 0
);
