const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export const api = {
  get: (url) => fetch(`${API_BASE}${url}`).then(res => res.json()),
  post: (url, data) => fetch(`${API_BASE}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  put: (url, data) => fetch(`${API_BASE}${url}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  del: (url) => fetch(`${API_BASE}${url}`, { method: 'DELETE' }).then(res => res.json())
};