import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_IP = '172.20.10.4';

export const API = {
  AUTH: `http://${BASE_IP}:8081`,
  USER: `http://${BASE_IP}:8082`,
  VEHICLE: `http://${BASE_IP}:8083`,
  JOB: `http://${BASE_IP}:8084`,
  PAYMENT: `http://${BASE_IP}:8085`,
  REVIEW: `http://${BASE_IP}:8086`,
  PARTS: `http://${BASE_IP}:8087`,
};

export const getToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('token');
};

export const authHeaders = async () => {
  const token = await getToken();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const parseResponse = async (response: Response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export const post = async (url: string, body: object, requiresAuth = false) => {
  const headers: any = { 'Content-Type': 'application/json' };
  if (requiresAuth) {
    const token = await getToken();
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const data = await parseResponse(response);
  if (!response.ok) {
    throw new Error(data?.message || data || 'Request failed');
  }
  return data;
};

export const get = async (url: string, requiresAuth = true) => {
  const headers: any = { 'Content-Type': 'application/json' };
  if (requiresAuth) {
    const token = await getToken();
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(url, { method: 'GET', headers });
  const data = await parseResponse(response);
  if (!response.ok) {
    throw new Error(data?.message || data || 'Request failed');
  }
  return data;
};

export const put = async (url: string, body: object) => {
  const headers = await authHeaders();
  const response = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });
  const data = await parseResponse(response);
  if (!response.ok) {
    throw new Error(data?.message || data || 'Request failed');
  }
  return data;
};

export const del = async (url: string) => {
  const headers = await authHeaders();
  const response = await fetch(url, { method: 'DELETE', headers });
  if (!response.ok) throw new Error('Delete failed');
};