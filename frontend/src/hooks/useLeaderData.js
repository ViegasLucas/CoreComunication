import { useQuery } from '@tanstack/react-query';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

const fetchWithToken = async (endpoint) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Não autenticado");
  
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  
  if (!res.ok) throw new Error(`Erro na chamada para ${endpoint}`);
  return res.json();
};

export const useMetrics = () => {
  return useQuery({
    queryKey: ['metrics'],
    queryFn: () => fetchWithToken('/api/metrics'),
    staleTime: 5 * 60 * 1000,
  });
};

export const useTeam = () => {
  return useQuery({
    queryKey: ['team'],
    queryFn: () => fetchWithToken('/api/users/me/team'),
    staleTime: 5 * 60 * 1000,
  });
};

export const useMeetings = () => {
  return useQuery({
    queryKey: ['meetings'],
    queryFn: async () => {
      const data = await fetchWithToken('/api/meetings');
      return data.map((m) => ({
        who: m.employeeName,
        when: `${m.date} · ${m.time}`,
        topic: "1:1 Agendada",
        hasSbi: false
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useHistory = () => {
  return useQuery({
    queryKey: ['history'],
    queryFn: () => fetchWithToken('/api/chat/history'),
    staleTime: 1 * 60 * 1000, // Histórico de chat pode atualizar mais rápido
  });
};
