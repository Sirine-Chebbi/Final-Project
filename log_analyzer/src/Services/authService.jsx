// src/services/authService.js
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/auth/';

const login = async (matricule, password) => {
  const response = await axios.post(API_URL + 'login/', { matricule, password });
  
  if (response.data && response.data.access) {
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    return response.data;
  }
  throw new Error('Tokens non reçus dans la réponse');
};

const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  
  try {
    const response = await axios.post(API_URL + 'token/refresh/', {
      refresh: refreshToken
    });
    
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      return response.data.access;
    }
  } catch (error) {
    logout();
    throw error;
  }
};

const logout = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  
  try {
    await axios.post(API_URL + 'logout/', { 
      refresh_token: refreshToken 
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
};

export const authService = {
  login,
  logout,
  refreshToken
};