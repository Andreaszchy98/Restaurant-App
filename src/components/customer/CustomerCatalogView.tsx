import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Plus,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { PromoBannerCarousel } from './PromoBannerCarousel';

export const CustomerCatalogView: React.FC = () => {
  const { products, openProductModal, businessProfile, theme } = useApp();

  // Helper to distinguish services vs physical products
  const isServiceItem = (p: Product) =>
    p.type === 'servicio' || p.category.toLowerCase() === 'servicios';

  const availableProducts = useMemo(() => {
    return products.filter((p) => p.available && !isServiceItem(p));
  }, [products]);

  const availableServices = useMemo(() => {
    return products.filter((p) => p.available && isServiceItem(p));
  }, [products]);

  const hasProducts = availableProducts.length > 0;
  const hasServices = availableServices.length > 0;

  const [activeTab, setActiveTab] = useState<'productos' | 'servicios'>(() => {
    return hasProducts ? 'productos' : 'servicios';
  });

  React.useEffect(() => {
    if (!hasProducts && hasServices) {
      setActiveTab('servicios');
    } else if (hasProducts && !hasServices) {
      setActiveTab('productos');
    }
  }, [hasProducts, hasServices]);

  // Render individual product or service card
  const renderItemCard = (product: Product, isService: boolean) => {
    const isOutOfStock = businessProfile.enableStockControl && product.stock <= 0;
    const hasOptions = product.optionGroups && product.optionGroups.length > 0;

    return (
      <div
        key={product.id}
        className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col group"
      >
        {/* Item Image */}
        <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
            {isService ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white shadow-2xs flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Servicio</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/90 text-slate-900 backdrop-blur-xs shadow-2xs">
                {product.category}
              </span>
            )}

            {product.badge && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950 shadow-2xs">
                {product.badge}
              </span>
            )}
          </div>

          {/* Stock notice */}
          {isOutOfStock ? (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex items-center justify-center">
              <span className="px-3 py-1 bg-rose-600 text-white font-bold text-xs rounded-md shadow-xs">
                {isService ? 'Cupos Agotados' : 'Agotado Temporalmente'}
              </span>
            </div>
          ) : (
            businessProfile.enableStockControl &&
            product.stock <= product.minStockAlert && (
              <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-amber-500/90 text-white text-[10px] font-bold rounded">
                {isService
                  ? `¡Últimos ${product.stock} cupos!`
                  : `¡Últimas ${product.stock} unidades!`}
              </span>
            )
          )}
        </div>

        {/* Card Content */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-1">
                {product.name}
              </h3>
            </div>
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {product.description}
            </p>

            {/* Customizer Highlights */}
            {hasOptions && (
              <div className="pt-1 flex items-center gap-1 text-[11px] text-slate-600">
                <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                <span className="truncate">
                  {isService ? 'Opciones y horarios' : 'Personalizable'} (
                  {product.optionGroups.map((g) => g.title).join(', ')})
                </span>
              </div>
            )}
          </div>

          {/* Price & Action Button */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                {isService ? 'Costo de Sesión' : 'Precio'}
              </span>
              <span className="text-base sm:text-lg font-extrabold text-slate-900 font-mono">
                {businessProfile.currency}
                {product.price}
              </span>
            </div>

            <button
              onClick={() => openProductModal(product.id)}
              disabled={isOutOfStock}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 active:scale-95 ${
                isOutOfStock
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : theme.buttonClass
              }`}
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>
                {hasOptions
                  ? isService
                    ? 'Agendar / Elegir'
                    : 'Personalizar'
                  : 'Agregar'}
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const currentItems = activeTab === 'productos' ? availableProducts : availableServices;

  return (
    <div className="space-y-5 sm:space-y-6 pb-20">
      {/* 1. Promotional Banners Carousel */}
      <PromoBannerCarousel />

      {/* 2. Centered Two Buttons: Productos | Servicios (or single centered if only one active) */}
      {(hasProducts || hasServices) && (
        <div className="flex items-center justify-center gap-3">
          {hasProducts && (
            <button
              type="button"
              onClick={() => setActiveTab('productos')}
              className={`px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all shadow-xs flex items-center gap-2 ${
                activeTab === 'productos'
                  ? 'shadow-md scale-102'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
              style={
                activeTab === 'productos'
                  ? { backgroundColor: theme.raw.primaryBtn, color: theme.raw.primaryBtnText }
                  : undefined
              }
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Productos</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'productos' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {availableProducts.length}
              </span>
            </button>
          )}

          {hasServices && (
            <button
              type="button"
              onClick={() => setActiveTab('servicios')}
              className={`px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all shadow-xs flex items-center gap-2 ${
                activeTab === 'servicios'
                  ? 'shadow-md scale-102'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
              style={
                activeTab === 'servicios'
                  ? { backgroundColor: theme.raw.primaryBtn, color: theme.raw.primaryBtnText }
                  : undefined
              }
            >
              <Sparkles className="w-4 h-4" />
              <span>Servicios</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'servicios' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {availableServices.length}
              </span>
            </button>
          )}
        </div>
      )}

      {/* 3. Items Grid or Empty State */}
      {currentItems.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            No hay {activeTab === 'productos' ? 'productos' : 'servicios'} disponibles en este momento
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Pronto se añadirán nuevos elementos a esta sección.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: theme.raw.primaryBtn }}
              >
                {activeTab === 'productos' ? <ShoppingBag className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
              </div>
              <h2 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                {activeTab === 'productos' ? 'Productos a la Venta' : 'Servicios & Experiencias'}
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {currentItems.length} {currentItems.length === 1 ? (activeTab === 'productos' ? 'producto' : 'servicio') : (activeTab === 'productos' ? 'productos' : 'servicios')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {currentItems.map((item) => renderItemCard(item, activeTab === 'servicios'))}
          </div>
        </div>
      )}
    </div>
  );
};
