import React, { createContext, useContext, useState } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: { id: string; name: string; price: number }) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  total: number;
  totalCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  sendToWhatsApp: (phone: string, address: string, paymentMethod: string, notes?: string) => void;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product: { id: string; name: string; price: number }) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const sendToWhatsApp = (phone: string, address: string, paymentMethod: string, notes?: string) => {
    if (items.length === 0) return;

    let msg = `🛒 *NOVO PEDIDO - CARDÁPIO DIGITAL*\n`;
    msg += `------------------------------------\n\n`;
    items.forEach((item) => {
      msg += `▪️ *${item.quantity}x* ${item.name} (R$ ${(item.price * item.quantity).toFixed(2)})\n`;
    });
    msg += `\n💰 *Total:* R$ ${total.toFixed(2)}\n`;
    msg += `📍 *Endereço / Retirada:* ${address || 'Balcão'}\n`;
    msg += `💳 *Forma de Pagamento:* ${paymentMethod}\n`;
    if (notes) msg += `📝 *Observações:* ${notes}\n`;
    msg += `\n_Pedido gerado pelo Cardápio Online_`;

    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <CartContext.Provider value={{ items, addToCart, updateQuantity, removeFromCart, clearCart, total, totalCount, isCartOpen, setIsCartOpen, sendToWhatsApp }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);