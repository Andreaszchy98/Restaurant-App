import React, { useState, useMemo } from 'react';
import { Search, Sparkles, Plus, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PromoBannerCarousel } from './PromoBannerCarousel';

export const CustomerCatalogView: React.FC = () => {
  const { products, openProductModal, businessProfile, theme } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered products (by search query only, removing the two filter bars as requested)
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.available) return false;

      if (
        searchQuery &&
        !p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !p.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [products, searchQuery]);

  return (
    <div className="space-y-5 sm:space-y-6 pb-16">
      {/* 1. Promotional Banners Carousel */}
      <PromoBannerCarousel />

      {/* 2. Clean Search Box (Removing the two filter bars as requested) */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar platillos, bebidas, productos o servicios..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs transition-all"
        />
      </div>

      {/* 3. Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-slate-200 space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            No se encontraron productos con "{searchQuery}"
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Intenta con otra palabra clave o limpia el campo de búsqueda.
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
          >
            Limpiar Búsqueda
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredProducts.map((product) => {
            const isOutOfStock =
              businessProfile.enableStockControl && product.stock <= 0;
            const hasOptions = product.optionGroups && product.optionGroups.length > 0;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col group"
              >
                {/* Product Image */}
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
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/90 text-slate-900 backdrop-blur-xs shadow-2xs">
                      {product.category}
                    </span>
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
                        Agotado Temporalmente
                      </span>
                    </div>
                  ) : (
                    businessProfile.enableStockControl &&
                    product.stock <= product.minStockAlert && (
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-amber-500/90 text-white text-[10px] font-bold rounded">
                        ¡Últimas {product.stock} unidades!
                      </span>
                    )
                  )}
                </div>

                {/* Card Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Customizer Highlights */}
                    {hasOptions && (
                      <div className="pt-1 flex items-center gap-1 text-[11px] text-slate-600">
                        <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                        <span className="truncate">
                          Personalizable ({product.optionGroups.map((g) => g.title).join(', ')})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Price & Action Button */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        Precio
                      </span>
                      <span className="text-base sm:text-lg font-extrabold text-slate-900 font-mono">
                        {businessProfile.currency}{product.price}
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
                      <span>{hasOptions ? 'Personalizar' : 'Agregar'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
