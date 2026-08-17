import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, Send, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartDrawer: React.FC<{ whatsappNumber: string }> = ({ whatsappNumber }) => {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, total, sendToWhatsApp } = useCart();
  const [address, setAddress] = useState('');
  const [payment, setPayment] = useState('PIX');
  const [notes, setNotes] = useState('');

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md bg-white dark:bg-[#121214] h-full shadow-2xl flex flex-col justify-between p-6 animate-in slide-in-from-right duration-300">
        
        {/* Topo */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-[var(--primary-accent)]" />
            <h2 className="text-lg font-black text-gray-900 dark:text-zinc-100">Sua Sacola</h2>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Lista de Itens */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ShoppingBag size={48} className="mx-auto mb-2 opacity-30" />
              <p>Sua sacola está vazia.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-900/60 rounded-xl border border-gray-100 dark:border-zinc-800">
                <div className="flex-1 mr-2">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-zinc-100">{item.name}</h4>
                  <span className="text-xs text-[var(--primary-accent)] font-bold">R$ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.id, -1)} className="p-1 rounded-md bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border dark:border-zinc-700"><Minus size={14} /></button>
                  <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="p-1 rounded-md bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border dark:border-zinc-700"><Plus size={14} /></button>
                  <button onClick={() => removeFromCart(item.id)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md ml-1"><Trash2 size={16} /></button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Formulário e Finalização */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 dark:border-zinc-800 pt-4 space-y-3">
            <div>
              <label className="text-xs font-bold text-gray-500">Endereço de Entrega ou Mesa</label>
              <input
                placeholder="Ex: Rua Central 123 ou Mesa 05"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full mt-1 p-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500">Forma de Pagamento</label>
              <select 
                value={payment} 
                onChange={(e) => setPayment(e.target.value)}
                className="w-full mt-1 p-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white rounded-xl text-xs"
              >
                <option value="PIX">PIX</option>
                <option value="Cartão de Crédito/Débito">Cartão de Crédito/Débito</option>
                <option value="Dinheiro">Dinheiro</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500">Observações (opcional)</label>
              <input
                placeholder="Ex: Ponto da carne, sem cebola..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full mt-1 p-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white rounded-xl text-xs"
              />
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-500 font-medium text-sm">Subtotal:</span>
              <span className="text-xl font-black text-[var(--primary-accent)]">R$ {total.toFixed(2)}</span>
            </div>

            <button
              onClick={() => sendToWhatsApp(whatsappNumber, address, payment, notes)}
              className="w-full bg-[var(--primary-accent)] hover:opacity-95 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
            >
              <Send size={18} /> Enviar Pedido no WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
};