import React, { useState, useEffect } from 'react';
import { Save, Check, Menu, KeyRound, Loader2 } from 'lucide-react';
import { AdminSidebar } from '../../components/AdminSidebar';
import { useBusinessHours } from '../../context/BusinessHoursContext';
import type { DaySchedule } from '../../context/BusinessHoursContext';
import { supabase } from '../../lib/supabase';

export const Settings: React.FC = () => {
  const { schedule, updateSchedule } = useBusinessHours();
  const [currentSchedule, setCurrentSchedule] = useState<DaySchedule[]>(schedule);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (schedule.length > 0) setCurrentSchedule(schedule);
  }, [schedule]);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPasswordConfirmModal, setShowPasswordConfirmModal] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  const handleToggleDay = (dayIndex: number) => {
    setCurrentSchedule((prev) =>
      prev.map((item) => (item.day_index === dayIndex ? { ...item, is_open: !item.is_open } : item))
    );
  };

  const handleTimeChange = (dayIndex: number, field: 'open_time' | 'close_time', value: string) => {
    setCurrentSchedule((prev) =>
      prev.map((item) => (item.day_index === dayIndex ? { ...item, [field]: value } : item))
    );
  };

  const handleSaveSchedule = async () => {
    await updateSchedule(currentSchedule);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  const handleOpenPasswordModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordMsg({ type: 'error', text: 'Digite sua senha atual.' });
      return;
    }
    if (newPassword.length < 4) {
      setPasswordMsg({ type: 'error', text: 'A nova senha deve ter no mínimo 4 caracteres.' });
      return;
    }
    setPasswordMsg(null);
    setShowPasswordConfirmModal(true);
  };

  // 🛡️ Executa a troca validando no banco de dados
  const handleExecutePasswordChange = async () => {
    setChangingPass(true);
    try {
      const { data: success } = await supabase.rpc('change_client_pin', {
        current_pin: currentPassword,
        new_pin: newPassword,
      });

      if (success) {
        setPasswordMsg({ type: 'success', text: 'Senha alterada no banco com sucesso!' });
        setShowPasswordConfirmModal(false);
        setCurrentPassword('');
        setNewPassword('');
      } else {
        setShowPasswordConfirmModal(false);
        setPasswordMsg({ type: 'error', text: 'Senha atual incorreta!' });
      }
    } catch {
      setPasswordMsg({ type: 'error', text: 'Erro ao conectar ao banco.' });
    } finally {
      setChangingPass(false);
      setTimeout(() => setPasswordMsg(null), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] flex flex-col md:flex-row">
      <AdminSidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      <main className="flex-1 md:ml-64 p-4 sm:p-8 max-w-4xl space-y-6">
        
        <div className="flex items-center justify-between mb-2 md:hidden">
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="p-2.5 rounded-2xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white"
          >
            <Menu size={20} />
          </button>
          <span className="font-extrabold text-sm text-gray-900 dark:text-white">Configurações</span>
        </div>

        {/* Horários */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Horários de Atendimento</h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400">
              Ative os dias abertos e ajuste os horários de início e término.
            </p>
          </div>
          <button 
            onClick={handleSaveSchedule}
            className="bg-[var(--primary-accent)] text-white px-5 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 text-sm"
          >
            <Save size={18} /> Salvar Horários
          </button>
        </div>

        <div className="bg-white dark:bg-[#121214] p-4 sm:p-6 rounded-3xl border border-gray-200 dark:border-zinc-800 space-y-3">
          <div className="divide-y divide-gray-100 dark:divide-zinc-800">
            {currentSchedule.map((item) => (
              <div key={item.day_index} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleDay(item.day_index)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                      item.is_open ? 'bg-[var(--primary-accent)]' : 'bg-gray-300 dark:bg-zinc-700'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                        item.is_open ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className={`font-bold text-sm ${item.is_open ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-zinc-500'}`}>
                    {item.day_name}
                  </span>
                </div>

                <div>
                  {item.is_open ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={item.open_time}
                        onChange={(e) => handleTimeChange(item.day_index, 'open_time', e.target.value)}
                        className="p-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white rounded-xl text-xs font-bold"
                      />
                      <span className="text-gray-400 text-xs font-bold">até</span>
                      <input
                        type="time"
                        value={item.close_time}
                        onChange={(e) => handleTimeChange(item.day_index, 'close_time', e.target.value)}
                        className="p-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white rounded-xl text-xs font-bold"
                      />
                    </div>
                  ) : (
                    <span className="inline-block text-xs font-bold text-red-500 bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/20">
                      Fechado
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alterar Senha com Supabase RPC */}
        <div className="bg-white dark:bg-[#121214] p-6 rounded-3xl border border-gray-200 dark:border-zinc-800 space-y-4">
          <div className="flex items-center gap-2.5">
            <KeyRound className="text-[var(--primary-accent)]" size={20} />
            <div>
              <h3 className="font-black text-base text-gray-900 dark:text-white">Segurança do Painel (Banco de Dados)</h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400">Altere a senha de acesso ao painel do dono.</p>
            </div>
          </div>

          <form onSubmit={handleOpenPasswordModal} className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-[11px] font-bold text-gray-700 dark:text-zinc-300">Senha Atual</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Digite a senha atual"
                className="w-full mt-1 p-2.5 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-700 dark:text-zinc-300">Nova Senha Secreta</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 4 caracteres"
                className="w-full mt-1 p-2.5 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white rounded-xl text-xs"
              />
            </div>

            <div className="sm:col-span-2 flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
              {passwordMsg && (
                <span className={`text-xs font-bold ${passwordMsg.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                  {passwordMsg.text}
                </span>
              )}
              <button
                type="submit"
                className="ml-auto bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-5 py-2.5 rounded-xl text-xs font-black"
              >
                Atualizar Senha
              </button>
            </div>
          </form>
        </div>

        {/* Modal de Confirmação */}
        {showPasswordConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-zinc-800 max-w-sm w-full rounded-3xl p-6 shadow-2xl text-center space-y-4">
              <h3 className="font-black text-lg text-gray-900 dark:text-white">Confirmar Nova Senha?</h3>
              <div className="text-left text-xs bg-gray-50 dark:bg-zinc-900 p-3.5 rounded-2xl border border-gray-200 dark:border-zinc-800 space-y-2">
                <p><span className="text-gray-400">Nova Senha:</span> <strong className="text-[var(--primary-accent)]">{newPassword}</strong></p>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                A nova senha será salva no banco e atualizada para todos os dispositivos.
              </p>
              <div className="flex gap-2 justify-center pt-2">
                <button 
                  onClick={() => setShowPasswordConfirmModal(false)} 
                  disabled={changingPass}
                  className="flex-1 px-4 py-2.5 text-gray-500 text-xs font-bold rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleExecutePasswordChange} 
                  disabled={changingPass}
                  className="flex-1 px-4 py-2.5 bg-[var(--primary-accent)] text-white text-xs font-black rounded-xl shadow-md flex items-center justify-center gap-1"
                >
                  {changingPass ? <Loader2 size={14} className="animate-spin" /> : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showSavedToast && (
          <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-5 py-3 rounded-2xl font-bold shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom z-50">
            <Check size={18} />
            <span>Horários atualizados com sucesso!</span>
          </div>
        )}

      </main>
    </div>
  );
};