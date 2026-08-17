import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Share2, Sun, Moon, ShoppingBag, ShieldCheck } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import type { Product } from '../components/ProductCard';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { BottomNav } from '../components/BottomNav';
import { CartDrawer } from '../components/CartDrawer';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { useBusinessHours } from '../context/BusinessHoursContext';

export const PublicMenu: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { totalCount, setIsCartOpen } = useCart();
  const { products } = useProducts();
  const { isCurrentlyOpen } = useBusinessHours();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [hasLogoError, setHasLogoError] = useState(false);

  // Easter Egg dos 5 Cliques
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogoClick = () => {
    clickCountRef.current += 1;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 1500);

    if (clickCountRef.current >= 5) {
      setAdminUnlocked(true);
      clickCountRef.current = 0;
    }
  };

  const whatsappPhone = '89994440907';
  const instagramUrl = 'https://www.instagram.com/wadamendes_opioneiro?igsh=aGs1czYycGw5dmtl';
  const categories = ['Todos', 'Carnes', 'Pratos Principais', 'Acompanhamentos', 'Bebidas', 'Sobremesas'];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'Cardápio Digital - Wada Mendes', url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado!');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          (p.description ? p.description.toLowerCase().includes(search.toLowerCase()) : false);
    const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] text-gray-900 dark:text-zinc-100 pb-28">
      
      {/* Topo com Logo de Super Destaque */}
      <header className="bg-white dark:bg-[#121214] border-b border-gray-200 dark:border-zinc-800 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Logo Ampliada e Iluminada */}
            <button 
              onClick={handleLogoClick}
              title="5 toques rápidos para o painel"
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-[var(--primary-accent)] overflow-hidden flex items-center justify-center font-black text-white text-xl shadow-xl ring-2 ring-orange-500/30 active:scale-95 transition-transform flex-shrink-0"
            >
              {!hasLogoError ? (
                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" onError={() => setHasLogoError(true)} />
              ) : (
                <span>WM</span>
              )}
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-base sm:text-xl text-gray-900 dark:text-white leading-tight">
                  Churrascaria Wada Mendes
                </h1>
              </div>
              <div className="flex items-center gap-2 mt-1">
                {isCurrentlyOpen ? (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-500 font-black px-2 py-0.5 rounded-full border border-emerald-500/20">
                    ● Aberto Agora
                  </span>
                ) : (
                  <span className="text-[10px] bg-red-500/10 text-red-500 font-black px-2 py-0.5 rounded-full border border-red-500/20">
                    ● Fechado
                  </span>
                )}
                <span className="text-xs text-gray-400 dark:text-zinc-400 hidden sm:inline">• Rápido e prático</span>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {adminUnlocked && (
              <button
                onClick={() => navigate('/admin/login')}
                className="flex items-center gap-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-3 py-2 rounded-xl text-xs font-black animate-bounce shadow-md"
              >
                <ShieldCheck size={16} className="text-emerald-500" />
                <span className="hidden sm:inline">Painel Dono</span>
              </button>
            )}

            <button onClick={handleShare} className="p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-300">
              <Share2 size={17} />
            </button>

            <a href={instagramUrl} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-300 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>

            <button onClick={toggleTheme} className="p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-300">
              {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <button onClick={() => setIsCartOpen(true)} className="relative hidden sm:flex items-center gap-2 bg-[var(--primary-accent)] text-white px-4 py-2.5 rounded-xl font-bold">
              <ShoppingBag size={17} />
              <span>Sacola ({totalCount})</span>
            </button>
          </div>

        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
        
        {/* Busca */}
        <div className="relative max-w-2xl mx-auto mb-5">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar pratos..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:border-[var(--primary-accent)] text-sm text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>

        {/* Categorias */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none justify-start sm:justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[var(--primary-accent)] text-white shadow-md'
                  : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid de Produtos Dinâmicos */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mt-4">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onClick={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400 space-y-3">
            <p className="text-base font-bold text-gray-700 dark:text-zinc-300">Nenhum prato cadastrado ainda.</p>
            <p className="text-xs max-w-sm mx-auto">
              Dê 5 toques na logo no topo para entrar no painel do dono e adicionar seus primeiros pratos!
            </p>
          </div>
        )}

      </main>

      <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      <BottomNav />
      <CartDrawer whatsappNumber={whatsappPhone} />
    </div>
  );
};