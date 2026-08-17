import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, Sparkles, Clock, LogOut, HelpCircle, Sun, Moon, MessageSquare, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface AdminSidebarProps {
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isMobileOpen = false, setIsMobileOpen }) => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [hasLogoError, setHasLogoError] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem('@admin_auth');
    navigate('/c/wadamendes');
  };

  const closeMobile = () => {
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
      isActive
        ? 'bg-[var(--primary-accent)] text-white shadow-lg shadow-orange-500/20'
        : 'text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
    }`;

  return (
    <>
      {/* Overlay Escuro no Mobile */}
      {isMobileOpen && (
        <div 
          onClick={closeMobile}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in"
        />
      )}

      <aside className={`w-64 h-screen bg-white dark:bg-[#121214] border-r border-gray-200 dark:border-zinc-800 p-6 flex flex-col justify-between fixed left-0 top-0 z-50 transition-transform duration-300 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div>
          
          {/* Topo: Logo com Alta Qualidade + Ações (Tema & Fechar) */}
          <div className="mb-8 space-y-3">
            
            {/* Linha Superior: Imagem Grande à esquerda | Ícones à direita */}
            <div className="flex items-start justify-between">
              <div className="w-14 h-14 rounded-2xl bg-[var(--primary-accent)] overflow-hidden flex items-center justify-center font-black text-white text-xl shadow-lg ring-2 ring-orange-500/20 flex-shrink-0">
                {!hasLogoError ? (
                  <img 
                    src="/logo.png" 
                    alt="Logo" 
                    className="w-full h-full object-cover" 
                    onError={() => setHasLogoError(true)} 
                  />
                ) : (
                  <span>WM</span>
                )}
              </div>

              {/* Ícone de Luz/Tema e Botão X de Fechar */}
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  onClick={toggleTheme}
                  title="Alternar Tema"
                  className="p-2.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 hover:scale-105 transition-transform"
                >
                  {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
                </button>

                <button 
                  onClick={closeMobile}
                  className="md:hidden p-2.5 rounded-xl text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
                  title="Fechar Menu"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Linha Inferior: Nome e Status */}
            <div className="pt-1">
              <h2 className="font-black text-lg text-gray-900 dark:text-white leading-tight">
                Wada Mendes
              </h2>
              <span className="text-[11px] text-emerald-500 font-extrabold flex items-center gap-1 mt-0.5">
                ● Painel Dono
              </span>
            </div>

          </div>

          {/* Links de Navegação */}
          <nav className="space-y-2">
            <NavLink to="/admin/products" onClick={closeMobile} className={linkClass}>
              <UtensilsCrossed size={19} />
              <span>Cardápio</span>
            </NavLink>
            <NavLink to="/admin/marketing" onClick={closeMobile} className={linkClass}>
              <Sparkles size={19} />
              <span>Estúdio de Artes</span>
            </NavLink>
            <NavLink to="/admin/settings" onClick={closeMobile} className={linkClass}>
              <Clock size={19} />
              <span>Horários</span>
            </NavLink>
          </nav>
        </div>

        {/* Rodapé do Menu */}
        <div className="space-y-2 border-t border-gray-200 dark:border-zinc-800 pt-4">
          <button
            onClick={() => { closeMobile(); setShowHelpModal(true); }}
            className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-2xl w-full transition-colors"
          >
            <HelpCircle size={18} />
            <span>Ajuda & Suporte</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-2xl w-full transition-colors"
          >
            <LogOut size={18} />
            <span>Sair do Painel</span>
          </button>
        </div>
      </aside>

      {/* Modal de Ajuda & Suporte */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-zinc-800 max-w-sm w-full rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-lg text-gray-900 dark:text-white">Suporte ao Dono</h3>
              <button onClick={() => setShowHelpModal(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-gray-600 dark:text-zinc-300 leading-relaxed">
              Precisa de ajuda com o cardápio ou quer solicitar novas alterações no aplicativo?
            </p>
            <a
              href="https://api.whatsapp.com/send?phone=5589994440907&text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20no%20meu%20Card%C3%A1pio"
              target="_blank"
              rel="noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-600/20"
            >
              <MessageSquare size={18} />
              <span>WhatsApp do Desenvolvedor</span>
            </a>
          </div>
        </div>
      )}
    </>
  );
};