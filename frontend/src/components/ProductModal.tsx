import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Upload, Image as ImageIcon } from 'lucide-react';
import type { Product } from './ProductCard';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  editingProduct?: Product | null;
}

const CATEGORIES = ['Carnes', 'Pratos Principais', 'Acompanhamentos', 'Entradas', 'Bebidas', 'Sobremesas'];

export const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, editingProduct }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Product>({
    id: String(Date.now()),
    name: '',
    category: 'Carnes',
    description: '',
    price: 0,
    image_url: '',
    badge: '',
    show_price: true,
    show_description: true,
    show_image: true,
  });

  useEffect(() => {
    if (editingProduct) {
      setFormData(editingProduct);
    } else {
      setFormData({
        id: String(Date.now()),
        name: '',
        category: 'Carnes',
        description: '',
        price: 0,
        image_url: '',
        badge: '',
        show_price: true,
        show_description: true,
        show_image: true,
      });
    }
  }, [editingProduct, isOpen]);

  if (!isOpen) return null;

  // 💵 1. Formatador no Estilo Nubank (Centavos da direita para a esquerda)
  const formatNubankCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Pega apenas os dígitos digitados
    const onlyDigits = e.target.value.replace(/\D/g, '');
    // Converte para decimal (dividindo por 100 para criar os centavos)
    const numericValue = Number(onlyDigits) / 100;
    setFormData((prev) => ({ ...prev, price: numericValue }));
  };

  // Upload de Imagem do Dispositivo
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-zinc-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[92vh]">
        
        <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-3 mb-4">
          <h2 className="text-lg font-black text-gray-900 dark:text-white">
            {editingProduct ? 'Editar Prato' : 'Novo Prato'}
          </h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white"><X size={20} /></button>
        </div>

        <div className="space-y-3.5 text-xs font-semibold">
          
          {/* Foto */}
          <div>
            <label className="block text-gray-700 dark:text-zinc-300 mb-1.5">Foto do Prato</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 overflow-hidden flex items-center justify-center">
                {formData.image_url ? (
                  <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={24} className="text-gray-400" />
                )}
              </div>
              <div>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-900 dark:text-white rounded-xl font-bold flex items-center gap-2"
                >
                  <Upload size={14} /> Selecionar Imagem
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-700 dark:text-zinc-300">Nome do Prato *</label>
              <input 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Picanha na Chapa"
                className="w-full mt-1 p-2.5 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="text-gray-700 dark:text-zinc-300">Categoria *</label>
              <select
                value={formData.category || 'Carnes'}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full mt-1 p-2.5 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white rounded-xl focus:outline-none"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* 💵 Campo de Preço com Máscara Nubank */}
            <div>
              <label className="text-gray-700 dark:text-zinc-300">Preço</label>
              <input 
                type="text"
                inputMode="numeric"
                value={formatNubankCurrency(formData.price || 0)} 
                onChange={handlePriceChange}
                placeholder="R$ 0,00"
                className="w-full mt-1 p-2.5 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-[var(--primary-accent)] dark:text-orange-400 font-extrabold text-sm rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="text-gray-700 dark:text-zinc-300">Tag / Destaque</label>
              <input 
                placeholder="Ex: PROMOÇÃO, VEGANO"
                value={formData.badge || ''} 
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                className="w-full mt-1 p-2.5 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white rounded-xl focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-gray-700 dark:text-zinc-300">Descrição</label>
            <textarea 
              rows={2}
              value={formData.description || ''} 
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ingredientes e acompanhamentos..."
              className="w-full mt-1 p-2.5 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white rounded-xl focus:outline-none"
            />
          </div>

          {/* Toggles */}
          <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 space-y-2">
            <label className="block text-gray-400 uppercase text-[10px]">Visibilidade no Cardápio</label>
            
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-900/60 text-gray-800 dark:text-zinc-200">
              <span>Exibir Preço</span>
              <input type="checkbox" checked={formData.show_price} onChange={(e) => setFormData({ ...formData, show_price: e.target.checked })} className="w-4 h-4 accent-orange-600" />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-900/60 text-gray-800 dark:text-zinc-200">
              <span>Exibir Descrição</span>
              <input type="checkbox" checked={formData.show_description} onChange={(e) => setFormData({ ...formData, show_description: e.target.checked })} className="w-4 h-4 accent-orange-600" />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-900/60 text-gray-800 dark:text-zinc-200">
              <span>Exibir Foto</span>
              <input type="checkbox" checked={formData.show_image} onChange={(e) => setFormData({ ...formData, show_image: e.target.checked })} className="w-4 h-4 accent-orange-600" />
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-gray-500 dark:text-zinc-400 text-xs font-bold">Cancelar</button>
          <button 
            onClick={() => {
              if (!formData.name) return;
              onSave(formData);
              onClose();
            }}
            className="px-5 py-2.5 bg-[var(--primary-accent)] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md"
          >
            <Save size={16} /> Salvar
          </button>
        </div>

      </div>
    </div>
  );
};