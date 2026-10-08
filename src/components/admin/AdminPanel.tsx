import React from 'react';
import { useApp } from '../../context/AppContext';
import { AdminDashboard } from './AdminDashboard';
import { AdminSalesOrders } from './AdminSalesOrders';
import { AdminInventory } from './AdminInventory';
import { AdminCatalog } from './AdminCatalog';
import { AdminBanners } from './AdminBanners';
import { AdminSettings } from './AdminSettings';

export const AdminPanel: React.FC = () => {
  const { adminTab } = useApp();

  return (
    <div className="space-y-6 pb-16">
      {/* Active Tab Panel (no redundant second tab bar) */}
      {adminTab === 'resumen' && <AdminDashboard />}
      {adminTab === 'pedidos' && <AdminSalesOrders />}
      {adminTab === 'inventario' && <AdminInventory />}
      {adminTab === 'catalogo' && <AdminCatalog />}
      {adminTab === 'banners' && <AdminBanners />}
      {adminTab === 'configuracion' && <AdminSettings />}
    </div>
  );
};
