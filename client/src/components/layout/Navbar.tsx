import React, { useState } from 'react';
import { Link, useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  MapPin,
  Bell,
  LogOut,
  User as UserIcon,
  Shield,
  Building2,
  Menu,
  X,
  Sparkles,
  Settings as SettingsIcon,
  Laptop,
  Layers,
  LayoutDashboard,
  Cpu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { LanguageSelector } from '../common/LanguageSelector';
import { SimpleModeToggle } from '../common/SimpleModeToggle';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => routerLocation.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  PFIS
                  <span className="text-[10px] bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold px-1.5 py-0.2 rounded-full border border-teal-200 dark:border-teal-800 uppercase">
                    v1.0
                  </span>
                </span>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 -mt-0.5 hidden sm:inline">
                  Patient Friction Intelligence
                </span>
              </div>
            </Link>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
            {/* PATIENT NAV */}
            {user?.role === 'patient' && (
              <>
                <Link
                  to="/patient/hospitals"
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    isActive('/patient/hospitals')
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold shadow-xs'
                      : 'hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Find Hospitals & Doctors</span>
                </Link>

                <Link
                  to="/patient/teleconsult"
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    isActive('/patient/teleconsult')
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold shadow-xs'
                      : 'hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Live Teleconsult</span>
                </Link>

                <Link
                  to="/patient/digital-twin"
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    isActive('/patient/digital-twin')
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold shadow-xs'
                      : 'hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Digital Twin</span>
                </Link>

                <Link
                  to="/patient/dashboard"
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    isActive('/patient/dashboard')
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                      : 'hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
                  <span>Dashboard</span>
                </Link>
              </>
            )}

            {/* HOSPITAL NAV */}
            {user?.role === 'hospital' && (
              <>
                <Link
                  to="/hospital/dashboard"
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    isActive('/hospital/dashboard')
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Hospital Desk
                </Link>
                <Link
                  to="/hospital/requests"
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    isActive('/hospital/requests')
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Patient Queue
                </Link>
                <Link
                  to="/hospital/teleconsult"
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                    isActive('/hospital/teleconsult')
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5 text-blue-500" />
                  <span>Tele-Triage</span>
                </Link>
                <Link
                  to="/hospital/departments"
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    isActive('/hospital/departments')
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Departments & OPD
                </Link>
              </>
            )}

            {/* ADMIN NAV */}
            {user?.role === 'admin' && (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    isActive('/admin/dashboard')
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  System Intelligence
                </Link>
                <Link
                  to="/admin/simulator"
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                    isActive('/admin/simulator')
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-teal-700 dark:text-teal-400'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>What-If Simulator</span>
                </Link>
                <Link
                  to="/admin/digital-twin"
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                    isActive('/admin/digital-twin')
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Digital Twin</span>
                </Link>
                <Link
                  to="/admin/interventions"
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    isActive('/admin/interventions')
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Budget Optimizer
                </Link>
              </>
            )}

            {/* PUBLIC VISITOR NAV */}
            {!isAuthenticated && (
              <>
                <Link
                  to="/patient/hospitals"
                  className="px-3 py-1.5 rounded-xl hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  <span>Find Hospitals</span>
                </Link>
                <Link
                  to="/architecture"
                  className="px-3 py-1.5 rounded-xl text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 font-bold transition-colors flex items-center gap-1.5 border border-teal-200 dark:border-teal-800"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>System Architecture</span>
                </Link>
                <Link
                  to="/about"
                  className="px-3 py-1.5 rounded-xl hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  About Platform
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Controls: Simple Mode, Language, Notifications, Auth Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Simple Mode Toggle */}
            <div className="hidden lg:block">
              <SimpleModeToggle />
            </div>

            {/* Global Language Selector */}
            <LanguageSelector />

            {/* Notification Bell */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors"
                  title={t('nav.notifications', 'Notifications')}
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50 overflow-hidden">
                    <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{t('nav.notifications', 'Notifications')}</h4>
                      <span className="text-[11px] font-medium text-slate-500">
                        {unreadCount} unread
                      </span>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => {
                              markAsRead(notif._id);
                              if (notif.actionUrl) {
                                setIsNotifOpen(false);
                                navigate(notif.actionUrl);
                              }
                            }}
                            className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${
                              !notif.isRead ? 'bg-teal-50/40 dark:bg-teal-950/20' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-semibold text-slate-900 dark:text-white">{notif.title}</p>
                              {!notif.isRead && (
                                <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(notif.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile Pill or Sign In Button */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-800">
                <Link
                  to={
                    user.role === 'patient'
                      ? '/patient/settings'
                      : user.role === 'hospital'
                      ? '/hospital/settings'
                      : '/admin/settings'
                  }
                  title={t('nav.settings', 'Settings & Language')}
                  className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <SettingsIcon className="w-4 h-4" />
                </Link>

                <Link
                  to={
                    user.role === 'patient'
                      ? '/patient/profile'
                      : user.role === 'hospital'
                      ? '/hospital/profile'
                      : '/admin/dashboard'
                  }
                  className="flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {user.role === 'hospital' ? (
                      <Building2 className="w-3.5 h-3.5 text-teal-300" />
                    ) : user.role === 'admin' ? (
                      <Shield className="w-3.5 h-3.5 text-amber-300" />
                    ) : (
                      <UserIcon className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>
                  <div className="hidden lg:flex flex-col">
                    <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      {user.name?.split(' ')[0]}
                    </span>
                    <span className="text-[9px] font-semibold text-slate-400 uppercase">
                      {user.role}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  title={t('nav.logout', 'Sign Out')}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-teal-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {t('nav.login', 'Sign In')}
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-1.5 rounded-xl shadow-xs transition-all"
                >
                  {t('nav.register', 'Register')}
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-2 shadow-lg">
          <div className="pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <SimpleModeToggle />
            <Link
              to="/patient/settings"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-xs text-teal-700 dark:text-teal-300 font-semibold"
            >
              {t('nav.settings', 'Settings & Language')}
            </Link>
          </div>

          <Link
            to="/patient/hospitals"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Find Nearby Hospitals & Doctors
          </Link>

          {user?.role === 'patient' && (
            <>
              <Link
                to="/patient/teleconsult"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Live Teleconsultation
              </Link>
              <Link
                to="/patient/digital-twin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-teal-600 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Friction Digital Twin Simulator
              </Link>
              <Link
                to="/patient/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {t('nav.dashboard', 'Patient Dashboard')}
              </Link>
              <Link
                to="/patient/friction"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {t('nav.frictionProfile', 'Friction Profile')}
              </Link>
              <Link
                to="/patient/documents"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {t('nav.myDocuments', 'Document Vault')}
              </Link>
            </>
          )}

          {user?.role === 'hospital' && (
            <>
              <Link
                to="/hospital/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {t('nav.dashboard', 'Hospital Dashboard')}
              </Link>
              <Link
                to="/hospital/requests"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {t('nav.triageQueue', 'Patient Requests')}
              </Link>
              <Link
                to="/hospital/teleconsult"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Teleconsultation Triage
              </Link>
            </>
          )}

          {user?.role === 'admin' && (
            <>
              <Link
                to="/admin/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {t('nav.dashboard', 'Admin Dashboard')}
              </Link>
              <Link
                to="/admin/simulator"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-teal-600 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                What-If Simulator
              </Link>
              <Link
                to="/admin/digital-twin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Digital Twin
              </Link>
            </>
          )}

          <Link
            to="/architecture"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-teal-700 dark:text-teal-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            System Architecture
          </Link>
        </div>
      )}
    </header>
  );
};
