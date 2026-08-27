import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data.access_token) {
    localStorage.setItem('token', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Tenders Pipeline API
export const getTenders = async () => {
  const response = await api.get('/tenders');
  return response.data;
};

export const createTender = async (tenderData) => {
  const response = await api.post('/tenders', tenderData);
  return response.data;
};

export const getTenderDetail = async (tenderId) => {
  const response = await api.get(`/tenders/${tenderId}`);
  return response.data;
};

export const getTenderBidders = async (tenderId, stage = null) => {
  const response = await api.get(`/tenders/${tenderId}/bidders`, {
    params: stage ? { stage } : {}
  });
  return response.data;
};

export const registerBidderForTender = async (tenderId, bidderData) => {
  const response = await api.post(`/tenders/${tenderId}/register-bidder`, bidderData);
  return response.data;
};

export const runEligibilityCheck = async (tenderId) => {
  const response = await api.post(`/tenders/${tenderId}/check-eligibility`);
  return response.data;
};

export const runAiScoring = async (tenderId) => {
  const response = await api.post(`/tenders/${tenderId}/score-bidders`);
  return response.data;
};

export const selectTenderWinner = async (tenderId, mode = 'ai_ranked', bidderId = null) => {
  const response = await api.post(`/tenders/${tenderId}/select-winner`, {
    mode,
    bidder_id: bidderId
  });
  return response.data;
};

// Bidder Compliance API
export const getDashboardStats = async () => {
  const response = await api.get('/stats');
  return response.data;
};

export const getBidders = async (params = {}) => {
  const response = await api.get('/bidders', { params });
  return response.data;
};

export const getBidderDetail = async (id) => {
  const response = await api.get(`/bidders/${id}`);
  return response.data;
};

export const triggerVerification = async (id) => {
  const response = await api.post(`/bidders/${id}/verify`);
  return response.data;
};

export const submitOfficerDecision = async (runId, decision, remarks) => {
  const response = await api.post(`/verification-runs/${runId}/decision`, {
    decision,
    remarks
  });
  return response.data;
};

export const getAuditLogs = async (params = {}) => {
  const response = await api.get('/audit-logs', { params });
  return response.data;
};

export default api;
