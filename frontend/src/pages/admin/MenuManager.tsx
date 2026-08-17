import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Image as ImageIcon, Menu } from 'lucide-react';
import { AdminSidebar } from '../../components/AdminSidebar';
import { ProductModal } from '../../components/ProductModal';
import { useProducts } from '../../context/ProductContext';
import type { Product } from '../../components/ProductCard';

export const MenuManager: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Product | null>(null);

  const handleSaveProduct = (product: Product) => {
    if (editingProduct) {
      updateProduct(product);
    } else {
      addProduct(product);
    }
    setEditingProduct(null);
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] flex flex-col md:flex-row">
      <AdminSidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      
      <main className="flex-1 md:ml-64 p-4 sm:p-8">
        
        {/* Topo Mobile */}
        <div className="flex items-center justify-between mb-6 md:hidden">
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="p-2.5 rounded-2xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-sm"
          >
            <Menu size={20} />
          </button>
          <span className="font-extrabold text-sm text-gray-900 dark:text-white">Gerenciador de Cardápio</span>
        </div>

        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Gerenciador de Cardápio</h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400">Cadastre e edite os pratos do seu restaurante.</p>
          </div>
          <button 
            onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
            className="bg-[var(--primary-accent)] text-white px-5 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 text-sm"
          >
            <Plus size={18} /> Novo Prato
          </button>
        </div>

        {/* Tabela de Produtos Responsiva */}
        <div className="bg-white dark:bg-[#121214] border border-gray-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex items-center gap-3">
            <Search size={18} className="text-gray-400" />
            <input 
              placeholder="Buscar prato pelo nome..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent focus:outline-none text-sm w-full text-gray-900 dark:text-white placeholder-gray-400" 
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-zinc-900/60 text-gray-500 dark:text-zinc-400 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="p-4">Foto</th>
                  <th className="p-4">Prato / Categoria</th>
                  <th className="p-4">Preço</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/40">
                    <td className="p-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-zinc-900 overflow-hidden flex items-center justify-center">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={18} className="text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-extrabold text-gray-900 dark:text-white">{p.name}</p>
                      <span className="text-[10px] text-gray-400 font-semibold">{p.category || 'Geral'}</span>
                    </td>
                    <td className="p-4 font-black text-[var(--primary-accent)]">R$ {p.price?.toFixed(2) || '0.00'}</td>
                    <td className="p-4 text-right space-x-1 sm:space-x-2">
                      <button onClick={() => { setEditingProduct(p); setIsModalOpen(true); }} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl text-gray-600 dark:text-zinc-300"><Edit2 size={16} /></button>
                      <button onClick={() => setItemToDelete(p)} className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl text-red-500"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-xs font-bold">
              Nenhum prato cadastrado ainda. Clique em "Novo Prato" acima!
            </div>
          )}
        </div>

      </main>

      {/* Modal de Exclusão */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-zinc-800 max-w-sm w-full rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <h3 className="font-black text-lg text-gray-900 dark:text-white">Remover Prato?</h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              Tem certeza que deseja remover <strong>"{itemToDelete.name}"</strong>?
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <button onClick={() => setItemToDelete(null)} className="px-4 py-2.5 text-gray-500 text-xs font-bold">Cancelar</button>
              <button onClick={() => { deleteProduct(itemToDelete.id); setItemToDelete(null); }} className="px-5 py-2.5 bg-red-600 text-white text-xs font-bold rounded-xl">Sim, Remover</button>
            </div>
          </div>
        </div>
      )}

      <ProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveProduct} editingProduct={editingProduct} />
    </div>
  );
};