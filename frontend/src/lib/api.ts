const BASE = '/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('rv_token');
}

export function setToken(token: string) {
  localStorage.setItem('rv_token', token);
}

export function clearToken() {
  localStorage.removeItem('rv_token');
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data as T;
}

// ─── Auth ──────────────────────────────────────────────────────────────────

export const api = {
  auth: {
    signup:    (body: object) => request('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
    verifyOTP: (body: object) => request('/auth/verify-otp', { method: 'POST', body: JSON.stringify(body) }),
    login:     (body: object) => request<{ token: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    resendOTP: (email: string) => request('/auth/resend-otp', { method: 'POST', body: JSON.stringify({ email }) }),
    me:        () => request<User>('/auth/me'),
  },

  merchants: {
    list:       (params?: object) => request<MerchantList>(`/merchants?${new URLSearchParams(params as Record<string, string>)}`),
    get:        (slug: string) => request<Merchant>(`/merchants/${slug}`),
    categories: () => request<Category[]>('/categories'),
  },

  track: {
    click:   (merchant_id: string) => request<{ redirect_url: string; click_id: string }>('/track/click', { method: 'POST', body: JSON.stringify({ merchant_id }) }),
    webhook: (body: object) => request('/track/webhook', { method: 'POST', body: JSON.stringify(body) }),
  },

  wallet: {
    get:          () => request<Wallet>('/wallet'),
    transactions: (params?: object) => request<TxList>(`/wallet/transactions?${new URLSearchParams(params as Record<string, string>)}`),
    withdraw:     (body: object) => request('/wallet/withdraw', { method: 'POST', body: JSON.stringify(body) }),
    withdrawals:  () => request<Withdrawal[]>('/wallet/withdrawals'),
  },

  notifications: {
    list: () => request<Notification[]>('/notifications'),
    read: (id: string) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  },

  admin: {
    analytics:           () => request<AdminStats>('/admin/analytics'),
    users:               (params?: object) => request(`/admin/users?${new URLSearchParams(params as Record<string, string>)}`),
    withdrawals:         (status?: string) => request(`/admin/withdrawals?status=${status || 'pending'}`),
    processWithdrawal:   (id: string, body: object) => request(`/admin/withdrawals/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    confirmTransaction:  (id: string) => request(`/admin/transactions/${id}/confirm`, { method: 'POST' }),
    createMerchant:      (body: object) => request('/admin/merchants', { method: 'POST', body: JSON.stringify(body) }),
    updateMerchant:      (id: string, body: object) => request(`/admin/merchants/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  },
};

// ─── Types ──────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  avatar_url?: string;
  referral_code?: string;
  pending: number;
  confirmed: number;
  withdrawn: number;
  currency: string;
  created_at: string;
}

export interface Merchant {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url?: string;
  cashback_type: 'percent' | 'flat';
  cashback_value: number;
  min_purchase: number;
  is_featured: boolean;
  is_active: boolean;
  popularity: number;
  category_name: string;
  category_slug: string;
  category_icon: string;
  terms?: string;
}

export interface MerchantList {
  merchants: Merchant[];
  total: number;
  page: number;
  limit: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  merchant_count: number;
}

export interface Wallet {
  pending: number;
  confirmed: number;
  withdrawn: number;
  total_earned: number;
  currency: string;
}

export interface Transaction {
  id: string;
  purchase_amount: number;
  cashback_amount: number;
  cashback_type: string;
  status: 'pending' | 'confirmed' | 'paid' | 'rejected';
  order_ref?: string;
  pending_at: string;
  confirmed_at?: string;
  paid_at?: string;
  merchant_name: string;
  merchant_logo?: string;
  merchant_slug: string;
}

export interface TxList {
  transactions: Transaction[];
  total: number;
}

export interface Withdrawal {
  id: string;
  amount: number;
  method: string;
  status: string;
  requested_at: string;
  processed_at?: string;
  admin_note?: string;
}

export interface AdminStats {
  users: { total: string; new_this_month: string };
  merchants: { total: string; active: string };
  transactions: { total: string; total_cashback: string; pending: string; confirmed: string; paid: string };
  withdrawals: { total: string; pending_amount: string; paid_amount: string };
  top_merchants: Array<{ name: string; click_count: string; cashback_paid: string; logo_url: string }>;
  recent_transactions: Array<{ id: string; cashback_amount: number; status: string; pending_at: string; email: string; full_name: string; merchant_name: string }>;
}