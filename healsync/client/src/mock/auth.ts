import type { SignupPayload, LoginPayload, AuthResponse } from '@shared/types';
import { MOCK_USER } from './data';

export const DEMO_EMAIL    = 'demo@healsync.app';
export const DEMO_PASSWORD = 'demo1234';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fakeLogin(payload: LoginPayload): Promise<AuthResponse> {
  await delay(600);
  if (payload.email === DEMO_EMAIL && payload.password === DEMO_PASSWORD) {
    return { token: 'mock-jwt-token', user: MOCK_USER };
  }
  throw new Error('Invalid email or password');
}

export async function fakeSignup(payload: SignupPayload): Promise<AuthResponse> {
  await delay(600);
  if (payload.email === DEMO_EMAIL) {
    throw new Error('An account with this email already exists');
  }
  return {
    token: 'mock-jwt-token',
    user:  {
      ...MOCK_USER,
      name:                   payload.name,
      email:                  payload.email,
      hasCompletedOnboarding: false,
    },
  };
}

export async function fakeLogout(): Promise<void> {
  await delay(200);
}
