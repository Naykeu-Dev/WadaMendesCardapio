import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Product } from '../components/ProductCard';

interface ProductContextType {
  products: Product[];
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  loading: boolean;
}

const ProductContext = createContext<ProductContextType>({} as ProductContextType);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Carregar os produtos do Supabase ao iniciar o site
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setProducts(data);
    } catch (err) {
      console.error('Erro ao buscar produtos do Supabase:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 2. Adicionar produto no Supabase
  const addProduct = async (product: Product) => {
    setProducts((prev) => [product, ...prev]);
    const { error } = await supabase.from('products').insert([product]);
    if (error) {
      console.error('Erro ao salvar no Supabase:', error);
      fetchProducts();
    }
  };

  // 3. Atualizar produto no Supabase
  const updateProduct = async (product: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
    const { error } = await supabase
      .from('products')
      .update(product)
      .eq('id', product.id);
    if (error) {
      console.error('Erro ao atualizar no Supabase:', error);
      fetchProducts();
    }
  };

  // 4. Excluir produto no Supabase
  const deleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error('Erro ao excluir no Supabase:', error);
      fetchProducts();
    }
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, loading }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);