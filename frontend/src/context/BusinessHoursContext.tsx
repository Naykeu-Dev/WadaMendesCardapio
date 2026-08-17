import React, { createContext, useContext, useState, useEffect } from 'react';

export interface DaySchedule {
  dayIndex: number;
  dayName: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

const DEFAULT_SCHEDULE: DaySchedule[] = [
  { dayIndex: 0, dayName: 'Domingo', isOpen: true, openTime: '10:00', closeTime: '18:00' },
  { dayIndex: 1, dayName: 'Segunda-feira', isOpen: true, openTime: '09:00', closeTime: '22:00' },
  { dayIndex: 2, dayName: 'Terça-feira', isOpen: true, openTime: '09:00', closeTime: '22:00' },
  { dayIndex: 3, dayName: 'Quarta-feira', isOpen: true, openTime: '09:00', closeTime: '22:00' },
  { dayIndex: 4, dayName: 'Quinta-feira', isOpen: true, openTime: '09:00', closeTime: '23:00' },
  { dayIndex: 5, dayName: 'Sexta-feira', isOpen: true, openTime: '09:00', closeTime: '23:30' },
  { dayIndex: 6, dayName: 'Sábado', isOpen: true, openTime: '09:00', closeTime: '23:30' },
];

interface BusinessHoursContextType {
  schedule: DaySchedule[];
  updateSchedule: (newSchedule: DaySchedule[]) => void;
  isCurrentlyOpen: boolean;
}

const BusinessHoursContext = createContext<BusinessHoursContextType>({} as BusinessHoursContextType);

export const BusinessHoursProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schedule, setSchedule] = useState<DaySchedule[]>(() => {
    const saved = localStorage.getItem('@business_schedule');
    return saved ? JSON.parse(saved) : DEFAULT_SCHEDULE;
  });

  const [isCurrentlyOpen, setIsCurrentlyOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('@business_schedule', JSON.stringify(schedule));

    const checkOpenStatus = () => {
      const now = new Date();
      const currentDay = now.getDay();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const todaySchedule = schedule.find((s) => s.dayIndex === currentDay);
      if (!todaySchedule || !todaySchedule.isOpen) {
        setIsCurrentlyOpen(false);
        return;
      }

      const isOpenNow = currentTime >= todaySchedule.openTime && currentTime <= todaySchedule.closeTime;
      setIsCurrentlyOpen(isOpenNow);
    };

    checkOpenStatus();
    const interval = setInterval(checkOpenStatus, 60000);
    return () => clearInterval(interval);
  }, [schedule]);

  const updateSchedule = (newSchedule: DaySchedule[]) => setSchedule(newSchedule);

  return (
    <BusinessHoursContext.Provider value={{ schedule, updateSchedule, isCurrentlyOpen }}>
      {children}
    </BusinessHoursContext.Provider>
  );
};

export const useBusinessHours = () => useContext(BusinessHoursContext);