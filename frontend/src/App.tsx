import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { BusinessHoursProvider } from './context/BusinessHoursContext';
import { PublicMenu } from './pages/PublicMenu';
import { AdminLogin } from './pages/admin/AdminLogin';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MenuManager } from './pages/admin/MenuManager';
import { MarketingStudio } from './pages/admin/MarketingStudio';
import { Settings } from './pages/admin/Settings';

export function App() {
  return (
    <ThemeProvider>
      <BusinessHoursProvider>
        <ProductProvider>
          <CartProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/c/:slug" element={<PublicMenu />} />
                <Route path="/admin/login" element={<AdminLogin />} />

                <Route path="/admin" element={<ProtectedRoute><Navigate to="/admin/products" replace /></ProtectedRoute>} />
                <Route path="/admin/products" element={<ProtectedRoute><MenuManager /></ProtectedRoute>} />
                <Route path="/admin/marketing" element={<ProtectedRoute><MarketingStudio /></ProtectedRoute>} />
                <Route path="/admin/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

                <Route path="*" element={<Navigate to="/c/wadamendes" replace />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </ProductProvider>
      </BusinessHoursProvider>
    </ThemeProvider>
  );
}

export default App;