const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  start_date: string;
  end_date: string;
  status: 'tersedia' | 'habis';
}

export interface TransaksiData {
  id: string;
  invoice: string | null;
  items: Array<{ menu_id: string; name: string; qty: number; price: number }>;
  total: number;
  created_at: string;
  kasir_id: string;
  device_id: string;
  sync_status: string;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('token');
}

async function fetchApi<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_URL}${path}`, { ...options, headers });
    const body = await res.json();
    if (!res.ok) {
      return { data: null as T, error: body.error || `HTTP ${res.status}` };
    }
    return body;
  } catch (err: unknown) {
    return { data: null as T, error: err instanceof Error ? err.message : 'Network error' };
  }
}

export async function login(
  username: string,
  pin: string
): Promise<ApiResponse<{ token: string; user: { id: string; name: string; role: string } }>> {
  return fetchApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, pin }),
  });
}

export async function getMenu(params?: {
  date?: string;
  status?: string;
}): Promise<ApiResponse<MenuItem[]>> {
  const qs = new URLSearchParams();
  if (params?.date) qs.set('date', params.date);
  if (params?.status) qs.set('status', params.status);
  const query = qs.toString();
  return fetchApi<MenuItem[]>(`/menu${query ? `?${query}` : ''}`);
}

export async function getAllMenu(): Promise<ApiResponse<MenuItem[]>> {
  return fetchApi<MenuItem[]>('/menu');
}

export async function createMenu(data: {
  name: string;
  price: number;
  category: string;
  start_date: string;
  end_date: string;
  status: 'tersedia' | 'habis';
}): Promise<ApiResponse<MenuItem>> {
  return fetchApi<MenuItem>('/menu', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateMenu(
  id: string,
  data: Partial<{
    name: string;
    price: number;
    category: string;
    start_date: string;
    end_date: string;
    status: 'tersedia' | 'habis';
  }>
): Promise<ApiResponse<MenuItem>> {
  return fetchApi<MenuItem>(`/menu/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteMenu(id: string): Promise<ApiResponse<null>> {
  return fetchApi<null>(`/menu/${id}`, { method: 'DELETE' });
}

export async function createTransaksi(data: {
  id: string;
  items: Array<{ menu_id: string; name: string; qty: number; price: number }>;
  total: number;
  kasir_id: string;
  device_id: string;
}): Promise<ApiResponse<TransaksiData>> {
  return fetchApi<TransaksiData>('/transaksi', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
