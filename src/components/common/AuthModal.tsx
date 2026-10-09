import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  User,
  CheckCircle2,
  Lock,
  Phone,
  MapPin,
  ArrowRight,
  LogOut,
  Store,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, switchRole, updateCurrentUser, theme, businessProfile } = useApp();

  const [selectedRole, setSelectedRole] = useState<UserRole>(currentUser.role);
  const [clientName, setClientName] = useState(currentUser.name || 'Mariana Gómez');
  const [clientPhone, setClientPhone] = useState(currentUser.phone || '+52 55 9182 7364');
  const [clientAddress, setClientAddress] = useState(currentUser.address || 'Calle Primavera 234, Col. Del Valle');

  // Admin PIN / password field (no OAuth)
  const [adminPin, setAdminPin] = useState('1234');
  const [pinError, setPinError] = useState('');

  if (!isOpen) return null;

  const handleLoginAsClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    updateCurrentUser({
      name: clientName.trim(),
      phone: clientPhone.trim(),
      address: clientAddress.trim(),
    });
    switchRole('client');
    onClose();
  };

  const handleLoginAsAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple PIN check for demonstration without OAuth
    if (adminPin.trim() !== '1234' && adminPin.trim() !== 'admin' && adminPin.trim() !== '') {
      setPinError('PIN incorrecto. Usa 1234 o admin');
      return;
    }

    setPinError('');
    updateCurrentUser({
      name: 'Gerente Administrador',
    });
    switchRole('admin');
    onClose();
  };

  const isCurrentAdmin = currentUser.role === 'admin';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm overflow-hidden relative shrink-0">
              <span>{businessProfile.name.charAt(0)}</span>
              {businessProfile.logoUrl && (
                <img
                  src={businessProfile.logoUrl}
                  alt={businessProfile.name}
                  className="absolute inset-0 w-full h-full object-cover bg-white"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Iniciar Sesión / Acceso</h3>
              <p className="text-[11px] text-slate-500">
                Selecciona tu perfil para ingresar a {businessProfile.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status pill */}
        <div className="px-5 pt-4 pb-2">
          <div className="p-2.5 bg-slate-100 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-500">Sesión actual activa:</span>
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              {isCurrentAdmin ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Administrador (Gerencia)</span>
                </>
              ) : (
                <>
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>Cliente ({currentUser.name})</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Role Selector Tabs inside modal */}
        <div className="px-5 pt-2">
          <div className="p-1 bg-slate-100 rounded-xl flex items-center text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('client');
                setPinError('');
              }}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                selectedRole === 'client'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="w-4 h-4 text-emerald-600" />
              <span>Cliente</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRole('admin');
                setPinError('');
              }}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                selectedRole === 'admin'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Administrador</span>
            </button>
          </div>
        </div>

        {/* Forms */}
        <div className="p-5">
          {selectedRole === 'client' ? (
            /* Client Form */
            <form onSubmit={handleLoginAsClient} className="space-y-3.5 text-xs">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-xl text-emerald-950 text-[11px] leading-relaxed">
                <strong>Perfil de Cliente:</strong> Podrás navegar el menú, personalizar tus órdenes, pedir exclusivamente para recoger en el local y pagar en efectivo.
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Tu Nombre Completo *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ej. Mariana Gómez"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs sm:text-sm bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Teléfono / WhatsApp *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+52 55 1234 5678"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs sm:text-sm bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Dirección de Entrega Predeterminada
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <textarea
                    rows={2}
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    placeholder="Calle, número y colonia..."
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs sm:text-sm bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 mt-4 active:scale-98 ${theme.buttonClass}`}
              >
                <span>Acceder como Cliente</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Admin Form */
            <form onSubmit={handleLoginAsAdmin} className="space-y-3.5 text-xs">
              <div className="p-3 bg-indigo-50/70 border border-indigo-200/60 rounded-xl text-indigo-950 text-[11px] leading-relaxed">
                <strong>Perfil de Administrador:</strong> Acceso completo a métricas de ventas, gestión de inventario, logística de envíos, catálogo de productos y temas.
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Usuario o Correo de Acceso
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    disabled
                    value="admin@negocio.com (Gerencia)"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 bg-slate-50 text-slate-600 rounded-lg text-xs sm:text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Código PIN o Clave de Administrador
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={adminPin}
                    onChange={(e) => {
                      setAdminPin(e.target.value);
                      setPinError('');
                    }}
                    placeholder="Ingresa tu PIN (1234)"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs sm:text-sm bg-white font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Código de demostración: <code className="font-bold text-slate-600">1234</code> o <code className="font-bold text-slate-600">admin</code>
                </p>
                {pinError && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1">
                    {pinError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 mt-4 active:scale-98 ${theme.buttonClass}`}
              >
                <span>Acceder al Panel de Administrador</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
