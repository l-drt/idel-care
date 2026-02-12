/**
 * Client API IDEL Care.
 * Base URL : EXPO_PUBLIC_API_URL
 */
const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface RegisterResponse {
  user: { id: string; email: string; firstName: string; lastName: string; role: string; createdAt: string };
  message: string;
}

export interface LoginResponseMethodChoice {
  requires2FASetup: true;
  userId: string;
  needMethodChoice: true;
}

export interface LoginResponseSetup {
  requires2FASetup: true;
  userId: string;
  qrCode: string;
  secret: string;
}

export interface LoginResponseVerify {
  requires2FA: true;
  userId: string;
  method?: 'TOTP' | 'SMS' | 'EMAIL';
}

export type LoginResponse =
  | LoginResponseMethodChoice
  | LoginResponseSetup
  | LoginResponseVerify;

export interface AuthTokensResponse {
  user: { id: string; email: string; firstName: string; lastName: string; role: string };
  accessToken: string;
  refreshToken: string;
}

async function request<T>(
  path: string,
  options: RequestInit & { body?: object } = {}
): Promise<T> {
  const { body, ...rest } = options;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(rest.headers as Record<string, string>),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      (data as { message?: string }).message ??
      (typeof data === 'string' ? data : 'Erreur réseau');
    throw new Error(message);
  }

  return data as T;
}

export const api = {
  async register(payload: RegisterPayload): Promise<RegisterResponse> {
    return request<RegisterResponse>('/auth/register', { method: 'POST', body: payload });
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    return request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  },

  async choose2FAMethod(
    userId: string,
    method: 'TOTP' | 'SMS' | 'EMAIL',
  ): Promise<
    | { method: 'TOTP'; qrCode: string; secret: string }
    | { method: 'SMS' | 'EMAIL'; message: string }
  > {
    return request('/auth/choose-2fa', {
      method: 'POST',
      body: { userId, method },
    });
  },

  async verify2FA(userId: string, code: string): Promise<AuthTokensResponse> {
    return request<AuthTokensResponse>('/auth/verify-2fa', {
      method: 'POST',
      body: { userId, code },
    });
  },

  async enable2FA(userId: string, code: string): Promise<AuthTokensResponse> {
    return request<AuthTokensResponse>('/auth/enable-2fa', {
      method: 'POST',
      body: { userId, code },
    });
  },

  async refresh(refreshToken: string): Promise<AuthTokensResponse> {
    return request<AuthTokensResponse>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
    });
  },

  async unlockWithPassword(userId: string, password: string): Promise<{ success: boolean }> {
    return request('/auth/unlock-with-password', {
      method: 'POST',
      body: { userId, password },
    });
  },

  async changePassword(accessToken: string, currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return request('/auth/change-password', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: { currentPassword, newPassword },
    });
  },

  async logout(accessToken: string): Promise<void> {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },

  async exportMyData(accessToken: string): Promise<ExportMyDataResponse> {
    if (!accessToken?.trim()) {
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }
    const headers: Record<string, string> = {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    };
    const res = await fetch(`${API_BASE}/auth/me/export`, { method: 'GET', headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message =
        (data as { message?: string }).message ??
        (typeof data === 'string' ? data : 'Erreur réseau');
      throw new Error(message);
    }
    return data as ExportMyDataResponse;
  },

  async deleteAccount(accessToken: string, password: string): Promise<{ message: string }> {
    return request<{ message: string }>('/auth/me/delete-account', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: { password },
    });
  },
};

export interface ExportMyDataResponse {
  exportedAt: string;
  purpose: string;
  user: Record<string, unknown>;
  patientsAssigned: unknown[];
  careActivities: unknown[];
  vitalsRecorded: unknown[];
  tours: unknown[];
}
