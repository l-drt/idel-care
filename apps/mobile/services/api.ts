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

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...rest,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    if (e instanceof TypeError && (e.message === 'Network request failed' || e.message.includes('fetch'))) {
      throw new Error(
        'Impossible de joindre l’API. Vérifiez que l’API tourne (npm run api:dev) et que sur téléphone vous avez créé apps/mobile/.env avec EXPO_PUBLIC_API_URL=http://VOTRE_IP:3000/api (IP de votre ordinateur sur le WiFi).'
      );
    }
    throw e;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const raw = (data as { message?: string | string[] }).message;
    const message = Array.isArray(raw)
      ? raw.join(' ')
      : typeof raw === 'string'
        ? raw
        : typeof data === 'string'
          ? data
          : res.status === 429
            ? 'Trop de tentatives. Réessayez dans quelques minutes.'
            : 'Erreur réseau';
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

  async createPatient(accessToken: string, payload: CreatePatientPayload): Promise<PatientResponse> {
    return request<PatientResponse>('/patients', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: payload,
    });
  },

  async getPatients(accessToken: string): Promise<PatientResponse[]> {
    return request<PatientResponse[]>('/patients', {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },

  async getPatient(accessToken: string, patientId: string): Promise<PatientResponse> {
    return request<PatientResponse>(`/patients/${patientId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },

  async updatePatient(
    accessToken: string,
    patientId: string,
    payload: UpdatePatientPayload,
  ): Promise<PatientResponse> {
    return request<PatientResponse>(`/patients/${patientId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: payload,
    });
  },

  async deletePatient(accessToken: string, patientId: string): Promise<void> {
    return request<void>(`/patients/${patientId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },
};

export interface CreatePatientPayload {
  firstName: string;
  lastName: string;
  birthDate: string;
  ssn?: string;
  phone?: string;
  email?: string;
  address: string;
  city: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  medicalHistory?: object;
  allergies?: string[];
  currentTreatments?: object;
  consentGiven: boolean;
  consentDate?: string;
}

export interface UpdatePatientPayload {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  ssn?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  medicalHistory?: object;
  allergies?: string[];
  currentTreatments?: object;
  consentGiven?: boolean;
  consentDate?: string;
}

export interface PatientResponse {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  address: string;
  city: string;
  postalCode: string;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  email?: string | null;
  ssn?: string | null;
  allergies?: string[];
  medicalHistory?: object | null;
  currentTreatments?: object | null;
  consentGiven?: boolean | null;
  consentDate?: string | null;
  [key: string]: unknown;
}

export interface ExportMyDataResponse {
  exportedAt: string;
  purpose: string;
  user: Record<string, unknown>;
  patientsAssigned: unknown[];
  careActivities: unknown[];
  vitalsRecorded: unknown[];
  tours: unknown[];
}
