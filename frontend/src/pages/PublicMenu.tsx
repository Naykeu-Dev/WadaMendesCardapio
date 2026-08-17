import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Share2, Sun, Moon, ShoppingBag, ShieldCheck, Code2, Check, X, Sparkles, LayoutGrid, Square } from 'lucide-react';
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
  const { totalCount, setIsCartOpen, addToCart } = useCart();
  const { products } = useProducts();
  const { isCurrentlyOpen } = useBusinessHours();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [hasLogoError, setHasLogoError] = useState(false);

  // 📱 Alternador de 1 ou 2 Colunas no Mobile
  const [mobileColumns, setMobileColumns] = useState<1 | 2>(1);

  // Modal de Confirmação e Toast
  const [confirmProduct, setConfirmProduct] = useState<Product | null>(null);
  const [addedToast, setAddedToast] = useState<string | null>(null);

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
  const instagramUrl = 'https://instagram.com/wadamendeschurrascaria';

  // 🧠 3. FILTROS INTELIGENTES: Só exibe categorias que possuem ao menos 1 prato cadastrado!
  const availableCategories = [
    'Todos',
    ...Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[],
  ];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'Cardápio Digital - Wada Mendes', url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado!');
    }
  };

  const handleConfirmAdd = () => {
    if (confirmProduct) {
      addToCart({ id: confirmProduct.id, name: confirmProduct.name, price: confirmProduct.price || 0 });
      setAddedToast(`"${confirmProduct.name}" adicionado à sacola!`);
      setConfirmProduct(null);
      setTimeout(() => setAddedToast(null), 3000);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          (p.description ? p.description.toLowerCase().includes(search.toLowerCase()) : false);
    const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] text-gray-900 dark:text-zinc-100 pb-32">
      
      {/* Topo com Logo */}
      <header className="bg-white dark:bg-[#121214] border-b border-gray-200 dark:border-zinc-800 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-3 sm:gap-4">
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
              <h1 className="font-black text-base sm:text-xl text-gray-900 dark:text-white leading-tight">
                Churrascaria Wada Mendes
              </h1>
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

            <button onClick={handleShare} className="p-2.5 rounded-2xl border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-300">
              <Share2 size={17} />
            </button>

            <a href={instagramUrl} target="_blank" rel="noreferrer" className="p-2.5 rounded-2xl border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-300 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>

            <button onClick={toggleTheme} className="p-2.5 rounded-2xl border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-300">
              {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <button onClick={() => setIsCartOpen(true)} className="relative hidden sm:flex items-center gap-2 bg-[var(--primary-accent)] text-white px-4 py-2.5 rounded-2xl font-bold active:scale-95 transition-transform">
              <ShoppingBag size={17} />
              <span>Sacola ({totalCount})</span>
            </button>
          </div>

        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
        
        {/* Barra de Busca + Alternador de Visualização Mobile (1 vs 2 Colunas) */}
        <div className="flex items-center gap-2 max-w-2xl mx-auto mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar pratos..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:border-[var(--primary-accent)] text-sm text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>

          {/* 📱 Botão de Alternar 1 vs 2 Colunas (Visível apenas no celular) */}
          <button
            onClick={() => setMobileColumns((c) => (c === 1 ? 2 : 1))}
            title={`Alternar para ${mobileColumns === 1 ? '2 colunas compactas' : '1 coluna grande'}`}
            className="sm:hidden p-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl text-gray-700 dark:text-zinc-300 shadow-sm"
          >
            {mobileColumns === 1 ? <LayoutGrid size={18} /> : <Square size={18} />}
          </button>
        </div>

        {/* 🧠 Categorias Inteligentes */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none justify-start sm:justify-center">
          {availableCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[var(--primary-accent)] text-white shadow-md'
                  : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid de Produtos com Suporte a 1 ou 2 Colunas no Mobile */}
        {filteredProducts.length > 0 ? (
          <div className={`grid gap-3 sm:gap-6 mt-4 ${
            mobileColumns === 1 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          }`}>
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onClick={() => setSelectedProduct(product)}
                onQuickAdd={(p) => setConfirmProduct(p)}
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

        {/* Rodapé com Super Destaque do Desenvolvedor */}
        <footer className="mt-20 border-t border-gray-200 dark:border-zinc-800 pt-8 pb-4 text-center">
          <div className="max-w-md mx-auto bg-white dark:bg-[#121214] border border-gray-200 dark:border-zinc-800 p-5 rounded-3xl shadow-sm space-y-3">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-500 dark:text-zinc-400">
              <Sparkles size={16} className="text-[var(--primary-accent)]" />
              <span>Cardápio Digital Oficial</span>
            </div>
            
            <p className="text-xs text-gray-600 dark:text-zinc-300">
              Gostou desse cardápio e deseja um sistema igual para o seu negócio?
            </p>

            <a 
              href="https://api.whatsapp.com/send?phone=5589994378466&text=Ol%C3%A1%20Naykeu%2C%20vi%20o%20card%C3%A1pio%20da%20Churrascaria%20Wada%20Mendes%20e%20gostaria%20de%20um%20projeto%20para%20minha%20empresa!" 
              target="_blank" 
              rel="noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <Code2 size={16} />
              <span>Desenvolvido por Naykeu Dev (WhatsApp)</span>
            </a>
          </div>

          <p className="text-[11px] text-gray-400 dark:text-zinc-600 mt-4">
            © 2026 Churrascaria Wada Mendes • Todos os direitos reservados
          </p>
        </footer>

      </main>

      {/* Modal de Confirmação (+) */}
      {confirmProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-zinc-800 max-w-sm w-full rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <h3 className="font-black text-lg text-gray-900 dark:text-white">Adicionar à Sacola?</h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              Deseja adicionar <strong className="text-gray-900 dark:text-white font-black">"{confirmProduct.name}"</strong> por <strong className="text-[var(--primary-accent)] font-black">R$ {confirmProduct.price?.toFixed(2).replace('.', ',')}</strong>?
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <button 
                onClick={() => setConfirmProduct(null)} 
                className="flex-1 px-4 py-2.5 text-gray-500 dark:text-zinc-400 text-xs font-bold rounded-2xl hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center justify-center gap-1"
              >
                <X size={15} /> Cancelar
              </button>
              <button 
                onClick={handleConfirmAdd} 
                className="flex-1 px-4 py-2.5 bg-[var(--primary-accent)] text-white text-xs font-black rounded-2xl flex items-center justify-center gap-1 shadow-md shadow-orange-500/20 active:scale-95 transition-transform"
              >
                <Check size={15} /> Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast de Sucesso */}
      {addedToast && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl font-bold shadow-2xl flex items-center gap-2 animate-in slide-in-from-top duration-300">
          <Check size={18} />
          <span className="text-xs font-black">{addedToast}</span>
        </div>
      )}

      <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      <BottomNav />
      <CartDrawer whatsappNumber={whatsappPhone} />
    </div>
  );
};