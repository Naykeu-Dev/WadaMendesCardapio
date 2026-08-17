import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface DaySchedule {
  day_index: number;
  day_name: string;
  is_open: boolean;
  open_time: string;
  close_time: string;
}

interface BusinessHoursContextType {
  schedule: DaySchedule[];
  updateSchedule: (newSchedule: DaySchedule[]) => Promise<void>;
  isCurrentlyOpen: boolean;
  loading: boolean;
}

const BusinessHoursContext = createContext<BusinessHoursContextType>({} as BusinessHoursContextType);

export const BusinessHoursProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [isCurrentlyOpen, setIsCurrentlyOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Busca os horários do Supabase
  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('business_hours')
        .select('*')
        .order('day_index', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) setSchedule(data);
    } catch (err) {
      console.error('Erro ao buscar horários:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  // 2. Calcula status Aberto/Fechado em tempo real
  useEffect(() => {
    if (schedule.length === 0) return;

    const checkOpenStatus = () => {
      const now = new Date();
      const currentDay = now.getDay();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const todaySchedule = schedule.find((s) => s.day_index === currentDay);
      if (!todaySchedule || !todaySchedule.is_open) {
        setIsCurrentlyOpen(false);
        return;
      }

      const isOpenNow = currentTime >= todaySchedule.open_time && currentTime <= todaySchedule.close_time;
      setIsCurrentlyOpen(isOpenNow);
    };

    checkOpenStatus();
    const interval = setInterval(checkOpenStatus, 60000);
    return () => clearInterval(interval);
  }, [schedule]);

  // 3. Salva os horários no Supabase
  const updateSchedule = async (newSchedule: DaySchedule[]) => {
    setSchedule(newSchedule);
    const { error } = await supabase.from('business_hours').upsert(newSchedule);
    if (error) {
      console.error('Erro ao atualizar horários:', error);
      fetchSchedule();
    }
  };

  return (
    <BusinessHoursContext.Provider value={{ schedule, updateSchedule, isCurrentlyOpen, loading }}>
      {children}
    </BusinessHoursContext.Provider>
  );
};

export const useBusinessHours = () => useContext(BusinessHoursContext);