const BASE = '/api';

export const FALLBACK_IMG = '/placeholder.svg';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Pets
  getPets: (type) => request(`/pets${type ? `?type=${encodeURIComponent(type)}` : ''}`),
  getPet: (id) => request(`/pets/${id}`),
  createPet: (data) => request('/pets', { method: 'POST', body: JSON.stringify(data) }),
  updatePet: (id, data) => request(`/pets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePet: (id) => request(`/pets/${id}`, { method: 'DELETE' }),

  // Pet Types
  getPetTypes: () => request('/pet-types'),
  createPetType: (name) => request('/pet-types', { method: 'POST', body: JSON.stringify({ name }) }),
  updatePetType: (id, name) => request(`/pet-types/${id}`, { method: 'PUT', body: JSON.stringify({ name }) }),
  deletePetType: (id) => request(`/pet-types/${id}`, { method: 'DELETE' }),

  // Purchases
  getPurchases: () => request('/purchases'),
  getPurchase: (id) => request(`/purchases/${id}`),
  createPurchase: (data) => request('/purchases', { method: 'POST', body: JSON.stringify(data) }),
  deletePurchase: (id) => request(`/purchases/${id}`, { method: 'DELETE' }),
};
