import { useState } from 'react';
import axios from 'axios';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access_token'));

  const isTokenExpired = (token: string): boolean => {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;
    return Date.now() > exp;
  };

  const refreshAccessToken = async (): Promise<string | null> => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return null;

    try {
      const response = await axios.post('http://127.0.0.1:5000/refresh', {
        refresh_token: refreshToken
      });
      const newAccessToken = response.data.access_token;
      localStorage.setItem('access_token', newAccessToken); // Armazena o novo access token
      setIsAuthenticated(true);
      return newAccessToken;
    } catch (error) {
      console.error('Erro ao renovar o token de acesso', error);
      setIsAuthenticated(false);
      return null;
    }
  };

  const checkToken = async () => {
    let accessToken = localStorage.getItem('access_token');

    if (accessToken && isTokenExpired(accessToken)) {
      accessToken = await refreshAccessToken();
      if (!accessToken) {
        alert('Sua sessão expirou. Por favor, faça login novamente.');
        setIsAuthenticated(false);
        window.location.reload();
        return;
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsAuthenticated(false);
    window.location.reload();
  };

  return {
    isAuthenticated,
    checkToken,
    refreshAccessToken,
    logout
  };
};
