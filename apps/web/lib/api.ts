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

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

async function fetchApi<T>(path: string): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_URL}${path}`, { cache: 'no-store' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { data: null as T, error: body.error || `HTTP ${res.status}` };
    }
    return await res.json();
  } catch (err: unknown) {
    return { data: null as T, error: err instanceof Error ? err.message : 'Network error' };
  }
}

export async function getMenu(params?: {
  date?: string;
  status?: string;
  category?: string;
}): Promise<ApiResponse<MenuItem[]>> {
  const qs = new URLSearchParams();
  if (params?.date) qs.set('date', params.date);
  if (params?.status) qs.set('status', params.status);
  if (params?.category) qs.set('category', params.category);
  const query = qs.toString();
  return fetchApi<MenuItem[]>(`/menu${query ? `?${query}` : ''}`);
}

export async function getCategories(): Promise<string[]> {
  const result = await getMenu();
  if (!result.data) return [];
  const cats = new Set(result.data.map((m) => m.category));
  return Array.from(cats).sort();
}
