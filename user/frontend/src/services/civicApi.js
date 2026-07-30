import axios from 'axios';
import { notify } from '../utils/toast';

const api = axios.create({
    timeout: 20000,
});

const SESSION_KEY = 'civic_session';

const getSession = () => {
    try {
        const stored = localStorage.getItem(SESSION_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
};

const isNetworkError = (error) => !error.response;

const isAuthError = (error) => error?.response && [401, 403].includes(error.response.status);

const getErrorMessage = (error) => {
    if (!error) {
        return 'Unknown request failure.';
    }

    if (error.response?.data?.detail) {
        return error.response.data.detail;
    }

    if (error.response?.data?.message) {
        return error.response.data.message;
    }

    if (error.message === 'Network Error') {
        return 'Network failure. Check your connection and retry.';
    }

    return error.message || 'Request failed.';
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const withRetry = async (executor, { retries = 1, backoffMs = 350, silent = false } = {}) => {
    try {
        return await executor();
    } catch (error) {
        if (retries > 0 && isNetworkError(error)) {
            await sleep(backoffMs);
            return withRetry(executor, { retries: retries - 1, backoffMs: backoffMs * 2, silent });
        }

        if (isAuthError(error)) {
            window.dispatchEvent(new CustomEvent('civic-auth-invalid', { detail: { status: error.response.status } }));
            localStorage.removeItem(SESSION_KEY);
        }

        if (!silent) {
            notify(getErrorMessage(error), isAuthError(error) ? 'error' : 'warning');
        }

        throw error;
    }
};

api.interceptors.request.use((config) => {
    const session = getSession();
    if (session?.token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${session.token}`;
    }
    return config;
});

export const request = (config, options) => withRetry(() => api.request(config), options);

export const civicApi = {
    getComplaints: (params = {}, options) => request({ url: '/api/complaints', method: 'get', params }, options),
    getComplaint: (id, options) => request({ url: `/api/complaints/${id}`, method: 'get' }, options),
    createComplaint: (payload, options) => request({ url: '/api/complaints', method: 'post', data: payload }, options),
    updateComplaint: (id, payload, options) => request({ url: `/api/complaints/${id}`, method: 'patch', data: payload }, options),
    deleteComplaint: (id, options) => request({ url: `/api/complaints/${id}`, method: 'delete' }, options),
    getNotifications: (options) => request({ url: '/api/notifications', method: 'get' }, options),
    getEmergencies: (options) => request({ url: '/api/emergencies', method: 'get' }, options),
    getCitizens: (options) => request({ url: '/api/citizens', method: 'get' }, options),
    getAISettings: (options) => request({ url: '/api/settings/ai', method: 'get' }, options),
};

export const isComplaintOwner = (complaint, user) => {
    if (!complaint || !user) {
        return false;
    }

    if (user.role === 'admin') {
        return true;
    }

    return complaint.citizen?.toLowerCase() === user.name?.toLowerCase();
};

export const userOwnedComplaints = (complaints = [], user) => complaints.filter((complaint) => isComplaintOwner(complaint, user));