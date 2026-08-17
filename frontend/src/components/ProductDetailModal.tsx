import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import type { Product } from './ProductCard';
import { useCart } from '../context/CartContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const handleAdd = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({ id: product.id, name: product.name, price: product.price || 0 });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#121214] border border-gray-200 dark:border-zinc-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Imagem Ampliada */}
        {product.show_image && product.image_url && (
          <div className="relative w-full h-64 bg-zinc-900">
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80"
            >
              <X size={18} />
            </button>
            {product.badge && (
              <span className="absolute bottom-4 left-4 bg-[var(--primary-accent)] text-white text-xs font-black px-3 py-1 rounded-lg uppercase">
                {product.badge}
              </span>
            )}
          </div>
        )}

        {/* Informações */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex justify-between items-start gap-4">
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-zinc-100">{product.name}</h2>
            {product.show_price && product.price !== undefined && (
              <span className="text-2xl font-black text-[var(--primary-accent)] whitespace-nowrap">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
            )}
          </div>

          {product.show_description && product.description && (
            <p className="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Rodapé com Seletor de Quantidade e Ação */}
        <div className="p-5 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-1.5">
            <button 
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-600 dark:text-zinc-300"
            >
              <Minus size={16} />
            </button>
            <span className="font-black text-sm w-6 text-center">{quantity}</span>
            <button 
              onClick={() => setQuantity(q => q + 1)}
              className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-600 dark:text-zinc-300"
            >
              <Plus size={16} />
            </button>
          </div>

          <button
            onClick={handleAdd}
            className="flex-1 bg-[var(--primary-accent)] hover:opacity-95 text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
          >
            <ShoppingBag size={18} />
            <span>Adicionar • R$ {((product.price || 0) * quantity).toFixed(2).replace('.', ',')}</span>
          </button>
        </div>

      </div>
    </div>
  );
};