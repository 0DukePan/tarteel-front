import { cookies } from 'next/headers';

export async function getAuthTokenServer(): Promise<string | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value || null;
  if (!token) {
    console.log('getAuthTokenServer: No token found in cookies');
    return null;
  }
  console.log('getAuthTokenServer: Token found in cookies');
  return token;
}