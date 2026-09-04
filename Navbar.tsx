import React, { useState } from 'react';
import {
  Phone,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  Menu,
  X,
  Heart,
  Stethoscope,
  Building2,
  Users,
  Info,
  ShieldCheck,
  ChevronRight,
  ClipboardList,
  User,
  LogIn,
  LogOut
} from 'lucide-react';
import { ActivePage, Appointment } from '../types/hospital';
import { HOSPITAL_INFO } from '../data/hospitalData';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  onOpenBooking: () => void;
  appointmentsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  setActivePage,
  onOpenBooking,
  appointmentsCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, userProfile, isAdmin, openAuthModal, logout } = useAuth();

  const navLinks: { id: ActivePage; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Building2 className="w-4 h-4" /> },
    { id: 'about', label: 'About Us', icon: <Info className="w-4 h-4" /> },
    { id: 'departments', label: 'Departments', icon: <Heart className="w-4 h-4" /> },
    { id: 'doctors', label: 'Doctors', icon: <Stethoscope className="w-4 h-4" /> },
  ];

  const handleNavClick = (page: ActivePage) => {
    setActivePage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
      {/* Top Emergency & Info Banner */}
      <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-1.5 text-rose-300 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span className="text-slate-300">24/7 Emergency:</span>
              <a href={`tel:${HOSPITAL_INFO.emergencyPhone}`} className="hover:underline text-rose-300 font-semibold tracking-wide">
                {HOSPITAL_INFO.emergencyPhone}
              </a>
            </div>

            <div className="hidden md:flex items-center gap-1.5 text-slate-300">
              <Phone className="w-3.5 h-3.5 text-teal-400" />
              <span>General Helpline:</span>
              <span className="text-white font-medium">{HOSPITAL_INFO.generalInquiryPhone}</span>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              <span>OPD: Mon - Sat 8:00 AM - 8:00 PM</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-300 ml-auto">
            <div className="hidden sm:flex items-center gap-1 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              <span className="truncate max-w-[240px]">742 Healthcare Blvd, Medical District</span>
            </div>
            <div className="flex items-center gap-1 text-teal-400 font-medium bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/40">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
              <span>JCI & NABH Accredited</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Identity */}
          <button
            id="nav-logo-btn"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left focus:outline-hidden group"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white border border-slate-200 p-0.5 flex items-center justify-center shadow-md shadow-teal-900/10 group-hover:scale-105 transition-transform duration-200 overflow-hidden shrink-0">
              <img
                src="/logo.png"
                alt="WECare Hospitals Logo"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-bold tracking-tight text-slate-900">
                  WE<span className="text-teal-600">Care</span>
                </span>
                <span className="text-xs font-bold tracking-widest uppercase text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                  Hospitals
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium tracking-wide">
                Advanced Medicine • Human Touch
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = activePage === link.id;
              return (
                <button
                  key={link.id}
                  id={`nav-link-${link.id}`}
                  onClick={() => handleNavClick(link.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'text-teal-700 bg-teal-50/80 font-bold border border-teal-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <span className={isActive ? 'text-teal-600' : 'text-slate-400'}>
                    {link.icon}
                  </span>
                  <span>{link.label}</span>
                </button>
              );
            })}

            {/* My Appointments Tab */}
            <button
              id="nav-link-my-appointments"
              onClick={() => handleNavClick('my-appointments')}
              className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                activePage === 'my-appointments'
                  ? 'text-teal-700 bg-teal-50/80 font-bold border border-teal-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <ClipboardList className={`w-4 h-4 ${activePage === 'my-appointments' ? 'text-teal-600' : 'text-slate-400'}`} />
              <span>My Appointments</span>
              {user && appointmentsCount > 0 && (
                <span className="bg-teal-600 text-white text-[11px] font-bold rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center shadow-xs">
                  {appointmentsCount}
                </span>
              )}
            </button>

            {/* Admin Portal Tab - Strictly visible ONLY for the designated admin email after sign in */}
            {user && isAdmin && (
              <button
                id="nav-link-admin-portal"
                onClick={() => handleNavClick('admin')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                  activePage === 'admin'
                    ? 'text-teal-800 bg-teal-100/90 font-bold border border-teal-300'
                    : 'text-teal-800 hover:text-teal-900 bg-teal-50 hover:bg-teal-100/80 border border-teal-200'
                }`}
                title="Hospital Administrative Portal (Restricted Access)"
              >
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Admin Portal</span>
                <span className="bg-teal-600 text-white text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wider">
                  Admin
                </span>
              </button>
            )}
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-2.5">
            <button
              id="nav-ambulance-call"
              onClick={() => {
                window.location.href = `tel:${HOSPITAL_INFO.emergencyPhone}`;
              }}
              className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200/80 rounded-lg hover:bg-rose-100/80 transition-colors"
              title="Immediate Emergency Ambulance Dispatch"
            >
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Emergency 24/7</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100/90 border border-slate-200/80">
                  <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center">
                    {(userProfile?.name || user.displayName || user.email || 'P')[0].toUpperCase()}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                      {userProfile?.name || user.displayName || 'Patient'}
                    </p>
                    <p className="text-[10px] text-teal-700 font-medium">Cloud Connected</p>
                  </div>
                </div>

                <button
                  id="nav-logout-btn"
                  onClick={logout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Sign out of your account"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="nav-signin-btn"
                onClick={() => openAuthModal('signin')}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-teal-800 bg-teal-50/90 hover:bg-teal-100/90 border border-teal-200 rounded-lg transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-teal-700" />
                <span>Sign In</span>
              </button>
            )}

            <button
              id="nav-book-appointment-btn"
              onClick={onOpenBooking}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm shadow-teal-700/20 hover:shadow-md transition-all active:scale-98"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              id="mobile-book-cta"
              onClick={onOpenBooking}
              className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 text-white text-xs font-semibold rounded-lg shadow-xs"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book</span>
            </button>
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = activePage === link.id;
              return (
                <button
                  key={link.id}
                  id={`mobile-nav-${link.id}`}
                  onClick={() => handleNavClick(link.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/80'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-teal-600' : 'text-slate-400'}>
                      {link.icon}
                    </span>
                    <span>{link.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              );
            })}

            <button
              id="mobile-nav-my-appointments"
              onClick={() => handleNavClick('my-appointments')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                activePage === 'my-appointments'
                  ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/80'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <ClipboardList className={`w-4 h-4 ${activePage === 'my-appointments' ? 'text-teal-600' : 'text-slate-400'}`} />
                <span>My Booked Appointments</span>
              </div>
              <div className="flex items-center gap-2">
                {user && appointmentsCount > 0 && (
                  <span className="bg-teal-600 text-white text-xs font-bold rounded-full px-2 py-0.5">
                    {appointmentsCount}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </button>

            {user && isAdmin && (
              <button
                id="mobile-nav-admin-portal"
                onClick={() => handleNavClick('admin')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  activePage === 'admin'
                    ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/80'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>Admin Command Portal</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-teal-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    Admin
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </button>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-sm flex items-center justify-center">
                    {(userProfile?.name || user.displayName || user.email || 'P')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {userProfile?.name || user.displayName || 'Patient'}
                    </p>
                    <p className="text-[10px] text-teal-700 font-medium">Logged in via Firebase</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                id="mobile-drawer-signin-btn"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal('signin');
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-sm transition-colors"
              >
                <LogIn className="w-4 h-4 text-teal-600" />
                <span>Sign In / Create Patient Account</span>
              </button>
            )}

            <button
              id="mobile-drawer-book-btn"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-sm"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Doctor Appointment</span>
            </button>

            <a
              id="mobile-emergency-call"
              href={`tel:${HOSPITAL_INFO.emergencyPhone}`}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-sm font-semibold hover:bg-rose-100"
            >
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Call Emergency: {HOSPITAL_INFO.emergencyPhone}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
