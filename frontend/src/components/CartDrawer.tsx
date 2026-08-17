import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, Send, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartDrawer: React.FC<{ whatsappNumber: string }> = ({ whatsappNumber }) => {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, total, sendToWhatsApp } = useCart();
  const [address, setAddress] = useState('');
  const [payment, setPayment] = useState('PIX');
  const [notes, setNotes] = useState('');

  return (
    <div 
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop com desfoque */}
      <div 
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
      />

      {/* Gaveta Deslizante com Animação */}
      <div 
        className={`absolute right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-[#121214] h-full shadow-2xl flex flex-col justify-between p-6 transform transition-transform duration-300 ease-in-out ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Topo */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-[var(--primary-accent)]" />
            <h2 className="text-lg font-black text-gray-900 dark:text-zinc-100">Sua Sacola</h2>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Lista de Itens */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ShoppingBag size={48} className="mx-auto mb-2 opacity-30" />
              <p className="font-bold text-sm">Sua sacola está vazia.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-900/60 rounded-2xl border border-gray-100 dark:border-zinc-800 animate-in fade-in duration-200">
                <div className="flex-1 mr-2">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-zinc-100">{item.name}</h4>
                  <span className="text-xs text-[var(--primary-accent)] font-black">R$ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-800 p-1 rounded-xl border border-gray-200 dark:border-zinc-700">
                  <button onClick={() => updateQuantity(item.id, -1)} className="p-1 rounded-lg text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700"><Minus size={13} /></button>
                  <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="p-1 rounded-lg text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700"><Plus size={13} /></button>
                  <button onClick={() => removeFromCart(item.id)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg ml-1"><Trash2 size={15} /></button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Formulário e Finalização */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 dark:border-zinc-800 pt-4 space-y-3">
            <div>
              <label className="text-[11px] font-bold text-gray-500 dark:text-zinc-400">Endereço de Entrega ou Mesa</label>
              <input
                placeholder="Ex: Rua Central 123 ou Mesa 05"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full mt-1 p-2.5 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-500 dark:text-zinc-400">Forma de Pagamento</label>
              <select 
                value={payment} 
                onChange={(e) => setPayment(e.target.value)}
                className="w-full mt-1 p-2.5 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none"
              >
                <option value="PIX">PIX</option>
                <option value="Cartão de Crédito/Débito">Cartão de Crédito/Débito</option>
                <option value="Dinheiro">Dinheiro</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-500 dark:text-zinc-400">Observações (opcional)</label>
              <input
                placeholder="Ex: Ponto da carne, sem cebola..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full mt-1 p-2.5 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white rounded-xl text-xs"
              />
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-500 dark:text-zinc-400 font-bold text-sm">Subtotal:</span>
              <span className="text-xl font-black text-[var(--primary-accent)]">R$ {total.toFixed(2)}</span>
            </div>

            <button
              onClick={() => sendToWhatsApp(whatsappNumber, address, payment, notes)}
              className="w-full bg-[var(--primary-accent)] hover:opacity-95 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 transition-transform"
            >
              <Send size={18} /> Enviar Pedido no WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
};