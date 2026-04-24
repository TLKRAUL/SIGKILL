const BASE_URL = 'http://localhost:3000/api';

export const testConnection = async () => {
  try {
    const response = await fetch(`${BASE_URL}/test`);
    const data = await response.json();
    return data.mesaj;
  } catch (error) {
    return "Eroare: Backend-ul nu răspunde!";
  }
};