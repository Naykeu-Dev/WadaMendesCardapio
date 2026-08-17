import React from 'react';
import { Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';

export interface Product {
  id: string;
  name: string;
  category?: string; // ✅ Campo de categoria adicionado
  description?: string;
  price?: number;
  image_url?: string;
  badge?: string;
  show_price: boolean;
  show_description: boolean;
  show_image: boolean;
}

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const { addToCart } = useCart();

  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-[#18181b] border border-gray-100 dark:border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-gray-200 dark:hover:border-zinc-700 transition-all cursor-pointer group"
    >
      {product.show_image && product.image_url && (
        <div className="relative w-full h-44 rounded-xl overflow-hidden mb-3 bg-zinc-900">
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          {product.badge && (
            <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-amber-400 text-xs font-bold px-2 py-1 rounded-md uppercase">
              {product.badge}
            </span>
          )}
        </div>
      )}

      <div>
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-gray-900 dark:text-zinc-100 text-base leading-tight group-hover:text-[var(--primary-accent)] transition-colors">
            {product.name}
          </h3>
          {product.show_price && product.price !== undefined && (
            <span className="font-extrabold text-[var(--primary-accent)] whitespace-nowrap text-base">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
          )}
        </div>

        {product.show_description && product.description && (
          <p className="text-gray-500 dark:text-zinc-400 text-xs mt-1.5 line-clamp-2">
            {product.description}
          </p>
        )}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={(e) => {
            e.stopPropagation();
            addToCart({ id: product.id, name: product.name, price: product.price || 0 });
          }}
          className="p-2 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 hover:bg-[var(--primary-accent)] hover:text-white transition-colors"
          title="Adicionar à sacola"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
};