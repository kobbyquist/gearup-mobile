import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_IP = '172.20.10.2';
const IP_STORAGE_KEY = 'dev_base_ip';

export const getBaseIP = async (): Promise<string> => {
  try {
    const stored = await AsyncStorage.getItem(IP_STORAGE_KEY);
    return stored || DEFAULT_IP;
  } catch {
    return DEFAULT_IP;
  }
};

export const saveBaseIP = async (ip: string): Promise<void> => {
  await AsyncStorage.setItem(IP_STORAGE_KEY, ip);
};

export const getAPI = async () => {
  const ip = await getBaseIP();
  return {
    AUTH: `http://${ip}:8081`,
    USER: `http://${ip}:8082`,
    VEHICLE: `http://${ip}:8083`,
    JOB: `http://${ip}:8084`,
    PAYMENT: `http://${ip}:8085`,
    REVIEW: `http://${ip}:8086`,
    PARTS: `http://${ip}:8087`,
  };
};

// Keep API as a sync-looking object for backward compatibility
// but services will use getAPI() instead
export const API = {
  AUTH: `http://${DEFAULT_IP}:8081`,
  USER: `http://${DEFAULT_IP}:8082`,
  VEHICLE: `http://${DEFAULT_IP}:8083`,
  JOB: `http://${DEFAULT_IP}:8084`,
  PAYMENT: `http://${DEFAULT_IP}:8085`,
  REVIEW: `http://${DEFAULT_IP}:8086`,
  PARTS: `http://${DEFAULT_IP}:8087`,
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

// Extracts a human-readable message from any common Spring Boot error body shape:
// - { message: "..." }
// - { detail: "..." } (RFC7807 ProblemDetail, Spring Boot 3+/4+ default for validation errors)
// - { errors: ["...", "..."] } or { errors: [{ defaultMessage, field }, ...] }
// - plain string body
// - falls back to a generic message if nothing recognizable is found
const extractErrorMessage = (data: any, fallback: string): string => {
  if (!data) return fallback;
  if (typeof data === 'string') return data;

  if (Array.isArray(data.errors) && data.errors.length > 0) {
    const first = data.errors[0];
    if (typeof first === 'string') return first;
    if (first?.defaultMessage) return first.defaultMessage;
    if (first?.field && first?.defaultMessage) return `${first.field}: ${first.defaultMessage}`;
  }

  if (data.message) return data.message;
  if (data.detail) return data.detail;
  if (data.title) return data.title;

  return fallback;
};

export const post = async (url: string, body: object, requiresAuth = false) => {
  console.log('POST →', url);
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
    throw new Error(extractErrorMessage(data, 'Request failed'));
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
    throw new Error(extractErrorMessage(data, 'Request failed'));
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
    throw new Error(extractErrorMessage(data, 'Request failed'));
  }
  return data;
};

export const del = async (url: string) => {
  const headers = await authHeaders();
  const response = await fetch(url, { method: 'DELETE', headers });
  if (!response.ok) throw new Error('Delete failed');
};