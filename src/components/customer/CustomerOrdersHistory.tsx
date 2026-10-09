import React, { useState } from 'react';
import {
  Package,
  Clock,
  CheckCircle2,
  RotateCcw,
  Receipt,
  DollarSign,
  AlertCircle,
  Printer,
  Store,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';

export const CustomerOrdersHistory: React.FC = () => {
  const { orders, businessProfile, theme, setCustomerTab, addToCart } = useApp();
  const [ticketOrder, setTicketOrder] = useState<Order | null>(null);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pendiente':
        return {
          label: 'En Espera de Confirmación',
          bg: 'bg-amber-100 text-amber-900 border-amber-200',
          icon: <Clock className="w-3.5 h-3.5" />,
          step: 1,
        };
      case 'en_preparacion':
        return {
          label: 'En Preparación / Cocina',
          bg: 'bg-blue-100 text-blue-900 border-blue-200',
          icon: <RotateCcw className="w-3.5 h-3.5" />,
          step: 2,
        };
      case 'entregado':
        return {
          label: 'Entregado / Completado',
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-200',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          step: 3,
        };
      case 'cancelado':
        return {
          label: 'Pedido Cancelado',
          bg: 'bg-rose-100 text-rose-900 border-rose-200',
          icon: <AlertCircle className="w-3.5 h-3.5" />,
          step: 0,
        };
    }
  };

  const handleRepeatOrder = (order: Order) => {
    order.items.forEach((item) => {
      addToCart({
        ...item,
        id: `cart-repeat-${Date.now()}-${Math.random()}`,
      });
    });
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Historial de Pedidos y Estado
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Consulta el estado de tu orden en tiempo real y el desglose de pago en efectivo.
          </p>
        </div>
        <button
          onClick={() => setCustomerTab('catalogo')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${theme.buttonClass}`}
        >
          Ir al Catálogo
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No tienes pedidos registrados</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Realiza tu primer pedido en el catálogo y podrás ver el avance de tu preparación aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = getStatusBadge(order.status);

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4"
              >
                {/* Top Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-base text-slate-900">
                        {order.orderNumber}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        <Store className="w-3 h-3 text-blue-600" />
                        <span>Para Recoger</span>
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusInfo.bg}`}
                      >
                        {statusInfo.icon}
                        <span>{statusInfo.label}</span>
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTicketOrder(order)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Comprobante Digital</span>
                    </button>
                    <button
                      onClick={() => handleRepeatOrder(order)}
                      className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                      <span>Pedir de nuevo</span>
                    </button>
                  </div>
                </div>

                {/* Progress bar tracker if active */}
                {order.status !== 'cancelado' && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                      <span className={statusInfo.step >= 1 ? 'text-slate-900 font-bold' : ''}>
                        1. Recibido
                      </span>
                      <span className={statusInfo.step >= 2 ? 'text-slate-900 font-bold' : ''}>
                        2. En Preparación
                      </span>
                      <span className={statusInfo.step >= 3 ? 'text-emerald-700 font-bold' : ''}>
                        3. Listo / Entregado
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-slate-900 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(statusInfo.step / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Items List */}
                <div className="space-y-2 text-xs">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between py-1.5 border-b border-slate-100 last:border-b-0"
                    >
                      <div className="min-w-0 pr-3">
                        <span className="font-bold text-slate-800">
                          {item.quantity}x {item.productName}
                        </span>
                        {item.selectedOptions.length > 0 && (
                          <p className="text-[11px] text-slate-500 pl-2">
                            {item.selectedOptions.map((o) => o.optionName).join(', ')}
                          </p>
                        )}
                        {item.customerNotes && (
                          <p className="text-[10px] text-amber-700 italic">
                            Nota: {item.customerNotes}
                          </p>
                        )}
                      </div>
                      <span className="font-mono font-medium text-slate-800 shrink-0">
                        {businessProfile.currency}{item.unitPrice * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Payment Breakdown / Pagos: Efectivo */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60 p-3 rounded-xl">
                  <div className="text-xs space-y-1">
                    <div className="flex items-center gap-2 text-slate-700">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Pago en <strong>Efectivo</strong>: Pagas con {businessProfile.currency}{order.cashPayment.amountPaid}</span>
                    </div>
                    {order.cashPayment.changeNeeded > 0 ? (
                      <p className="text-[11px] text-emerald-700 font-semibold pl-5">
                        Cambio que recibirás: {businessProfile.currency}{order.cashPayment.changeNeeded}
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-500 pl-5">
                        Monto exacto (sin cambio).
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">Total</span>
                    <span className="text-lg font-extrabold text-slate-900 font-mono">
                      {businessProfile.currency}{order.total}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Digital Ticket Modal */}
      {ticketOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-200 font-mono text-xs">
            {/* Ticket Header */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300 space-y-1">
              <h3 className="font-bold text-sm tracking-tight text-slate-900">
                {businessProfile.name || 'Ticket Comercial'}
              </h3>
              <p className="text-[11px] text-slate-500">{businessProfile.slogan}</p>
              <p className="text-[10px] text-slate-400">{businessProfile.address}</p>
              <p className="text-[10px] text-slate-400">Tel: {businessProfile.phone}</p>
              <div className="pt-2 font-bold text-slate-800 text-xs">
                TICKET {ticketOrder.orderNumber}
              </div>
            </div>

            {/* Ticket Details */}
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Tipo de Pedido:</span>
                <span className="font-bold text-blue-700">Para Recoger en Local</span>
              </div>
              <div className="flex justify-between">
                <span>Fecha:</span>
                <span>{new Date(ticketOrder.createdAt).toLocaleString('es-ES')}</span>
              </div>
              <div className="flex justify-between">
                <span>Cliente:</span>
                <span>{ticketOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Teléfono:</span>
                <span>{ticketOrder.customerPhone}</span>
              </div>
              {ticketOrder.customerNotes && (
                <div className="text-[10px] text-slate-600 pt-0.5">
                  Notas: {ticketOrder.customerNotes}
                </div>
              )}
            </div>

            {/* Line items */}
            <div className="py-2 border-y border-dashed border-slate-300 space-y-1.5 text-[11px]">
              {ticketOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start">
                  <div>
                    <span>{item.quantity}x {item.productName}</span>
                    {item.selectedOptions.length > 0 && (
                      <p className="text-[9px] text-slate-500">
                        {item.selectedOptions.map((o) => o.optionName).join(', ')}
                      </p>
                    )}
                  </div>
                  <span>{businessProfile.currency}{item.unitPrice * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-1">
                <span>TOTAL:</span>
                <span>{businessProfile.currency}{ticketOrder.total}</span>
              </div>
              <div className="flex justify-between text-slate-600 pt-1">
                <span>Paga en Efectivo:</span>
                <span>{businessProfile.currency}{ticketOrder.cashPayment.amountPaid}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-700">
                <span>Cambio:</span>
                <span>{businessProfile.currency}{ticketOrder.cashPayment.changeNeeded}</span>
              </div>
            </div>

            <div className="text-center pt-2 text-[10px] text-slate-400">
              ¡Gracias por tu compra!
            </div>

            {/* Actions */}
            <div className="pt-2 flex gap-2 font-sans">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir</span>
              </button>
              <button
                type="button"
                onClick={() => setTicketOrder(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
