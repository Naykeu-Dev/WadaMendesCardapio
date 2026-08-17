import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, Eye, EyeOff, ShieldAlert } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  // Busca a senha definida no .env ou a senha personalizada salva pelo dono
  const MASTER_PIN = localStorage.getItem('@custom_admin_pin') || import.meta.env.VITE_ADMIN_PIN || 'Wada@2026!';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === MASTER_PIN) {
      sessionStorage.setItem('@admin_auth', 'true');
      navigate('/admin/products');
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] flex items-center justify-center p-4">
      <form onSubmit={handleLogin} className="w-full max-w-sm bg-white dark:bg-[#121214] border border-gray-200 dark:border-zinc-800 rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-in fade-in">
        
        {/* Ícone de Cadeado */}
        <div className="w-16 h-16 bg-orange-500/10 text-[var(--primary-accent)] rounded-2xl flex items-center justify-center mx-auto ring-2 ring-orange-500/20 shadow-sm">
          <Lock size={30} />
        </div>
        
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Acesso Restrito</h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Digite a senha de administrador para gerenciar o cardápio.
          </p>
        </div>

        <div className="space-y-2">
          <div className="relative">
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="Digite a senha de acesso"
              value={pin}
              onChange={(e) => { setPin(e.target.value); setError(false); }}
              className="w-full text-center text-sm p-3.5 pr-10 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white rounded-2xl focus:outline-none focus:border-[var(--primary-accent)]"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-red-500 font-bold animate-shake">
              <ShieldAlert size={14} />
              <span>Senha incorreta. Tente novamente.</span>
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className="w-full bg-[var(--primary-accent)] hover:opacity-95 text-white py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
        >
          <span>Entrar no Painel</span>
          <ArrowRight size={18} />
        </button>

        <button 
          type="button" 
          onClick={() => navigate('/c/wadamendes')}
          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 font-bold block mx-auto pt-2"
        >
          Voltar ao Cardápio Público
        </button>
      </form>
    </div>
  );
};