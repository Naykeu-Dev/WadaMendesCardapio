import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '../components/ProductCard';

interface ProductContextType {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
}

const ProductContext = createContext<ProductContextType>({} as ProductContextType);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('@cardapio_products_live');
    return saved ? JSON.parse(saved) : []; // ✅ 100% dinâmico sem cards estáticos via código
  });

  useEffect(() => {
    localStorage.setItem('@cardapio_products_live', JSON.stringify(products));
  }, [products]);

  const addProduct = (product: Product) => setProducts((prev) => [product, ...prev]);
  const updateProduct = (product: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
  };
  const deleteProduct = (id: string) => setProducts((prev) => prev.filter((p) => p.id !== id));

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);