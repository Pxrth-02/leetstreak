import apiClient from './client.js';

export const getDashboard = () => apiClient.get('/leetcode/dashboard').then(r => r.data);
export const getContests = () => apiClient.get('/leetcode/contests').then(r => r.data);
export const getPreferences = () => apiClient.get('/user/preferences').then(r => r.data);
export const updatePreferences = (data) => apiClient.patch('/user/preferences', data).then(r => r.data);
