import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const BottomNav: React.FC = () => {
  const { totalCount, total, setIsCartOpen } = useCart();

  if (totalCount === 0) return null;

  return (
    <div className="sm:hidden fixed bottom-4 left-4 right-4 z-40 animate-in slide-in-from-bottom">
      <button
        onClick={() => setIsCartOpen(true)}
        className="w-full bg-[var(--primary-accent)] text-white p-3.5 rounded-2xl font-black shadow-2xl flex items-center justify-between gap-3 active:scale-95 transition-transform"
      >
        <div className="flex items-center gap-2.5">
          <div className="bg-black/20 p-2 rounded-xl">
            <ShoppingBag size={20} />
          </div>
          <div className="text-left">
            <span className="text-[10px] block opacity-90 uppercase font-bold">Ver Sacola</span>
            <span className="text-sm leading-none font-black">{totalCount} {totalCount === 1 ? 'item' : 'itens'}</span>
          </div>
        </div>

        <div className="bg-white text-[var(--primary-accent)] px-3.5 py-1.5 rounded-xl text-sm font-black shadow-sm">
          R$ {total.toFixed(2).replace('.', ',')}
        </div>
      </button>
    </div>
  );
};