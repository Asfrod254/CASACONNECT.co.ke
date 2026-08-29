import { createClient } from '@supabase/supabase-js';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://casaconnect-co-ke.onrender.com'; 

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      window.localStorage.removeItem('casaconnect_session');
      const path = window.location.pathname;
      const loginPath = path.startsWith('/admin') ? '/admin/login' : path.startsWith('/landlord') ? '/landlord/login' : '/user/login';
      if (!path.endsWith('/login')) window.location.assign(loginPath);
    }
    throw new Error(payload.message || 'The request could not be completed.');
  }
  return payload;
}

export async function getProperties(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, value);
    }
  });
  const query = params.toString() ? `?${params.toString()}` : '';
  const payload = await request(`/properties${query}`, { headers: tokenHeader(filters.token) });
  return payload.properties || [];
}

function tokenHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getProperty(id, token) {
  const payload = await request(`/properties/${id}`, { headers: tokenHeader(token) });
  return payload.property || null;
}

export async function getMyProperties(token) {
  const payload = await request('/properties/mine', { headers: tokenHeader(token) });
  return payload.properties || [];
}

export async function createProperty(data, token) {
  const payload = await request('/properties', {
    method: 'POST',
    headers: tokenHeader(token),
    body: JSON.stringify(data),
  });
  return payload.property;
}

export async function createPropertyAsAdmin(data, token) {
  const payload = await request('/admin/properties', {
    method: 'POST',
    headers: tokenHeader(token),
    body: JSON.stringify(data),
  });
  return payload.property;
}

export async function updateProperty(id, data, token) {
  const payload = await request(`/properties/${id}`, {
    method: 'PUT',
    headers: tokenHeader(token),
    body: JSON.stringify(data),
  });
  return payload.property;
}

export async function deleteProperty(id, token) {
  return request(`/properties/${id}`, {
    method: 'DELETE',
    headers: tokenHeader(token),
  });
}

export async function getReviews(propertyId) {
  const payload = await request(`/properties/${propertyId}/reviews`);
  return payload.reviews || [];
}

export async function createReview(propertyId, rating, comment, token) {
  const payload = await request(`/properties/${propertyId}/reviews`, {
    method: 'POST',
    headers: tokenHeader(token),
    body: JSON.stringify({ rating, comment }),
  });
  return payload.review;
}

export async function createPayment(propertyId, amount, token, options = {}) {
  const payload = await request('/payments', {
    method: 'POST',
    headers: tokenHeader(token),
    body: JSON.stringify({ property_id: propertyId, amount, ...options }),
  });
  return payload.payment;
}

export async function createRentalRequest(propertyId, message, token) {
  return request('/requests', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ property_id: propertyId, message }),
  });
}

export async function getRentalRequests(token) {
  const payload = await request('/requests', { headers: { Authorization: `Bearer ${token}` } });
  return payload.requests || [];
}

export async function updateRentalRequest(id, status, token) {
  return request(`/requests/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
  });
}

export async function getMessages(propertyId, token) {
  const payload = await request(`/messages/${propertyId}`, { headers: { Authorization: `Bearer ${token}` } });
  return payload.messages || [];
}

export async function sendMessage(propertyId, message, token) {
  return request(`/messages/${propertyId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ message }),
  });
}

export async function loginUser(email, password) {
  return request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export async function requestPasswordReset(email) {
  return request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(email, password) {
  return request('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function signupUser(name, email, password, role) {
  return request('/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, password, role }) });
}

export async function createLandlord(name, email, password, phone, token) {
  return request('/auth/landlords', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name, email, password, phone }),
  });
}

export async function getHealth() {
  return request('/health');
}

export async function getPayments(token) {
  const payload = await request('/payments', { headers: { Authorization: `Bearer ${token}` } });
  return payload.payments || [];
}

export async function getAdminData(resource, token) {
  const payload = await request(`/admin/${resource}`, { headers: { Authorization: `Bearer ${token}` } });
  return payload[resource] || [];
}

export async function getAdminStats(token) {
  const payload = await request('/admin/stats', { headers: { Authorization: `Bearer ${token}` } });
  return payload.stats || {};
}

export async function getAdminAnalytics(token) {
  const payload = await request('/admin/analytics', { headers: { Authorization: `Bearer ${token}` } });
  return payload.analytics || {};
}

export async function updateAdminResource(resource, id, updates, token) {
  return request(`/admin/${resource}/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(updates),
  });
}

// Supabase realtime client for live message updates.
export function createRealtimeClient(supabaseSession) {
  const key =
    process.env.REACT_APP_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2YXZ6YXVpYWZsdHBjaGxya2lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2ODY4NTksImV4cCI6MjEwMzI2Mjg1OX0.bUacwmuRbxsvZV_NA6lRFnkDpc_WnoQBrHARDYQBxmc';
  const url =
    process.env.REACT_APP_SUPABASE_URL || 'https://gvavzauiafltpchlrkio.supabase.co';

  try {
    const options = supabaseSession?.access_token
      ? { global: { headers: { Authorization: `Bearer ${supabaseSession.access_token}` } } }
      : {};
    return createClient(url, key, options);
  } catch {
    return null;
  }
}
