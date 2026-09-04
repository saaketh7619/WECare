import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Mail,
  Users,
  Calendar,
  Clock,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  Printer,
  RefreshCw,
  FileText,
  ChevronDown,
  Phone,
  Stethoscope,
  Building2,
  DollarSign,
  UserPlus,
  ArrowLeft,
  LogOut,
  Check,
  Eye,
  EyeOff,
  Activity,
  User,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { useAuth, ADMIN_EMAIL } from '../context/AuthContext';
import { DEPARTMENTS, DOCTORS, HOSPITAL_INFO } from '../data/hospitalData';
import { Appointment, Doctor } from '../types/hospital';
import {
  subscribeAllBookings,
  updateBookingInDb,
  deleteBookingInDb,
  addAdminBookingToDb
} from '../firebase';

interface AdminPortalProps {
  onBackToSite: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onBackToSite }) => {
  const { user, userProfile, isAdmin, signInWithEmail, logout } = useAuth();

  // Login form states (for unauthenticated or non-admin view)
  const [adminEmail, setAdminEmail] = useState(ADMIN_EMAIL);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Portal view states
  const [activeTab, setActiveTab] = useState<'bookings' | 'add-booking' | 'analytics'>('bookings');
  const [bookings, setBookings] = useState<Appointment[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'upcoming' | 'past'>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'patient'>('date-desc');

  // Modals & Active items
  const [selectedBooking, setSelectedBooking] = useState<Appointment | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlot, setRescheduleSlot] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Admin Clinical / Reception Notes Edit State
  const [editNotes, setEditNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Toast / feedback message
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Subscribe to all bookings when user is authenticated admin
  useEffect(() => {
    if (!isAdmin) {
      setLoadingBookings(false);
      return;
    }

    setLoadingBookings(true);
    setDbError(null);

    const unsubscribe = subscribeAllBookings(
      (allBookings) => {
        setBookings(allBookings);
        setLoadingBookings(false);
      },
      (err) => {
        console.warn('Admin Bookings subscription notice:', err);
        setDbError('Unable to fetch live bookings. Please verify database permissions in firestore.rules.');
        setLoadingBookings(false);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isAdmin]);

  // Handle Admin Login submission
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!adminEmail.trim() || !adminPassword) {
      setLoginError('Please enter both admin email and password.');
      return;
    }

    setLoginLoading(true);
    try {
      await signInWithEmail(adminEmail.trim(), adminPassword);
    } catch (err: any) {
      console.error('Admin Sign In error:', err);
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found'
      ) {
        setLoginError('Invalid credentials. For admin access, please use the correct admin password.');
      } else {
        setLoginError(err.message || 'Authentication failed. Please verify credentials.');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // Quick helper to autofill admin credentials for testing
  const handleAutofillAdmin = () => {
    setAdminEmail(ADMIN_EMAIL);
    setAdminPassword('sa7619');
    setLoginError('');
  };

  // Status update
  const handleUpdateStatus = async (bookingId: string, newStatus: Appointment['status']) => {
    try {
      await updateBookingInDb(bookingId, { status: newStatus });
      showToast(`Appointment status changed to "${newStatus}"`);
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking({ ...selectedBooking, status: newStatus });
      }
    } catch (err: any) {
      console.error('Error updating status:', err);
      showToast('Failed to update status. Please try again.');
    }
  };

  // Delete booking
  const handleDeleteBooking = async (bookingId: string) => {
    try {
      await deleteBookingInDb(bookingId);
      setDeleteConfirmId(null);
      if (selectedBooking?.id === bookingId) {
        setIsDetailModalOpen(false);
      }
      showToast('Appointment record removed from system');
    } catch (err) {
      console.error('Error deleting booking:', err);
      showToast('Failed to delete booking.');
    }
  };

  // Reschedule booking
  const handleSaveReschedule = async () => {
    if (!selectedBooking || !rescheduleDate || !rescheduleSlot) {
      showToast('Please select both a valid date and time slot.');
      return;
    }

    try {
      await updateBookingInDb(selectedBooking.id, {
        appointmentDate: rescheduleDate,
        appointmentTime: rescheduleSlot,
        status: 'Rescheduled'
      });
      setIsRescheduleModalOpen(false);
      showToast(`Appointment rescheduled to ${rescheduleDate} at ${rescheduleSlot}`);
    } catch (err) {
      console.error('Error rescheduling:', err);
      showToast('Failed to reschedule. Please try again.');
    }
  };

  // Save admin remarks
  const handleSaveAdminNotes = async () => {
    if (!selectedBooking) return;
    setSavingNotes(true);
    try {
      await updateBookingInDb(selectedBooking.id, { notes: editNotes });
      setSelectedBooking({ ...selectedBooking, notes: editNotes });
      showToast('Clinical / administrative notes saved.');
    } catch (err) {
      console.error('Error saving notes:', err);
      showToast('Failed to save notes.');
    } finally {
      setSavingNotes(false);
    }
  };

  // Metrics computation
  const metrics = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const total = bookings.length;
    const confirmed = bookings.filter((b) => b.status === 'Confirmed').length;
    const completed = bookings.filter((b) => b.status === 'Completed').length;
    const cancelled = bookings.filter((b) => b.status === 'Cancelled').length;
    const rescheduled = bookings.filter((b) => b.status === 'Rescheduled').length;
    const todayAppointments = bookings.filter((b) => b.appointmentDate === todayStr).length;
    const totalRevenue = bookings
      .filter((b) => b.status !== 'Cancelled')
      .reduce((sum, b) => sum + (b.consultationFee || 100), 0);

    return {
      total,
      confirmed,
      completed,
      cancelled,
      rescheduled,
      todayAppointments,
      totalRevenue
    };
  }, [bookings]);

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const q = searchQuery.toLowerCase().trim();

    return bookings
      .filter((b) => {
        // Search filter
        if (q) {
          const matchName = b.patientName.toLowerCase().includes(q);
          const matchEmail = b.patientEmail.toLowerCase().includes(q);
          const matchPhone = b.patientPhone.toLowerCase().includes(q);
          const matchId = b.id.toLowerCase().includes(q);
          const matchDoc = b.doctorName.toLowerCase().includes(q);
          const matchDept = b.departmentName.toLowerCase().includes(q);
          if (!matchName && !matchEmail && !matchPhone && !matchId && !matchDoc && !matchDept) {
            return false;
          }
        }

        // Status filter
        if (statusFilter !== 'all' && b.status.toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }

        // Dept filter
        if (deptFilter !== 'all' && b.departmentId !== deptFilter) {
          return false;
        }

        // Date filter
        if (dateFilter === 'today') {
          return b.appointmentDate === todayStr;
        }
        if (dateFilter === 'upcoming') {
          return b.appointmentDate >= todayStr && b.status !== 'Cancelled' && b.status !== 'Completed';
        }
        if (dateFilter === 'past') {
          return b.appointmentDate < todayStr || b.status === 'Completed';
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(b.appointmentDate + ' ' + (b.appointmentTime || '')).getTime() -
                 new Date(a.appointmentDate + ' ' + (a.appointmentTime || '')).getTime();
        }
        if (sortBy === 'date-asc') {
          return new Date(a.appointmentDate + ' ' + (a.appointmentTime || '')).getTime() -
                 new Date(b.appointmentDate + ' ' + (b.appointmentTime || '')).getTime();
        }
        if (sortBy === 'patient') {
          return a.patientName.localeCompare(b.patientName);
        }
        return 0;
      });
  }, [bookings, searchQuery, statusFilter, deptFilter, dateFilter, sortBy]);

  // Status style helper
  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Confirmed
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            Completed
          </span>
        );
      case 'Rescheduled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Rescheduled
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  // ==========================================
  // VIEW: Gate / Sign-In Required
  // ==========================================
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-6 text-white text-center relative">
            <button
              onClick={onBackToSite}
              className="absolute left-4 top-4 text-slate-400 hover:text-white text-xs flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Hospital Site</span>
            </button>
            <div className="w-20 h-20 bg-white border border-teal-500/40 rounded-2xl flex items-center justify-center mx-auto mb-3.5 shadow-md p-1 overflow-hidden">
              <img
                src="/logo.png"
                alt="WECare Hospitals Logo"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <h2 className="text-xl font-bold tracking-tight">WECare Hospitals</h2>
            <p className="text-xs text-teal-300 font-medium tracking-wide uppercase mt-0.5">
              Administrative Command Portal
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Authorized Hospital Personnel Only
            </p>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {user && !isAdmin ? (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-900">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-sm">Patient Account Detected</span>
                    <p className="mt-1 text-amber-800">
                      You are currently signed in as <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">{user.email}</code>. Admin access requires credentials for <strong className="text-slate-900">{ADMIN_EMAIL}</strong>.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={async () => {
                      await logout();
                      handleAutofillAdmin();
                    }}
                    className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-teal-600/20 flex items-center justify-center gap-2"
                  >
                    <span>Switch to Administrator Account</span>
                  </button>
                  <button
                    onClick={onBackToSite}
                    className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                  >
                    Return to Hospital Homepage
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAdminLogin} className="space-y-4">
                {loginError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2 animate-in fade-in duration-150">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                {/* Convenient quick fill card for demo/testing */}
                <div className="p-3 bg-teal-50/80 border border-teal-200/80 rounded-xl text-xs text-teal-900 flex items-center justify-between gap-2">
                  <div>
                    <span className="font-bold block">Hospital Admin Credentials</span>
                    <span className="text-[11px] text-teal-700">Email: {ADMIN_EMAIL}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutofillAdmin}
                    className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold rounded-lg transition-colors shadow-xs shrink-0"
                  >
                    Fill Credentials
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Admin Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@wecare.org"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Admin Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Enter administrator password"
                      className="w-full pl-9 pr-10 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loginLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-teal-400" />
                      <span>Authenticate & Enter Portal</span>
                    </>
                  )}
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={onBackToSite}
                    className="text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors"
                  >
                    &larr; Return to Hospital Patient Portal
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: Main Authenticated Admin Portal
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Admin Navigation Bar */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Portal Brand */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white p-0.5 border border-slate-700 flex items-center justify-center shadow-inner overflow-hidden shrink-0">
                <img
                  src="/logo.png"
                  alt="WECare Hospitals Logo"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg tracking-tight text-white">
                    WE<span className="text-teal-400">Care</span>
                  </span>
                  <span className="bg-teal-500/20 text-teal-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-500/30 uppercase tracking-wider">
                    Admin Portal
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Clinical & Booking Operations</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="hidden md:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
              <button
                onClick={() => setActiveTab('bookings')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === 'bookings'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>All Bookings</span>
                <span className="bg-slate-900/60 px-1.5 py-0.2 rounded-full text-[10px]">
                  {bookings.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('add-booking')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === 'add-booking'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>New Booking</span>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === 'analytics'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Hospital Schedule</span>
              </button>
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-slate-800 rounded-lg border border-slate-700">
                <div className="w-6 h-6 rounded-full bg-teal-500 text-slate-950 font-bold text-xs flex items-center justify-center">
                  A
                </div>
                <div className="text-left text-[11px]">
                  <p className="font-bold text-slate-200 leading-none">Super Admin</p>
                  <p className="text-[10px] text-teal-400 font-mono leading-tight">{ADMIN_EMAIL}</p>
                </div>
              </div>

              <button
                onClick={onBackToSite}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
                title="View patient-facing website"
              >
                <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
                <span className="hidden sm:inline">Hospital Site</span>
              </button>

              <button
                onClick={logout}
                className="p-2 bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 rounded-lg border border-slate-700 transition-colors"
                title="Sign out of Administrator Session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Tabs Bar */}
          <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-3 py-1 rounded-lg font-bold ${
                activeTab === 'bookings' ? 'bg-teal-600 text-white' : 'text-slate-300'
              }`}
            >
              Bookings ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab('add-booking')}
              className={`px-3 py-1 rounded-lg font-bold ${
                activeTab === 'add-booking' ? 'bg-teal-600 text-white' : 'text-slate-300'
              }`}
            >
              + New Booking
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1 rounded-lg font-bold ${
                activeTab === 'analytics' ? 'bg-teal-600 text-white' : 'text-slate-300'
              }`}
            >
              Schedule
            </button>
          </div>
        </div>
      </header>

      {/* Floating Action Toast Notification */}
      {actionNotice && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-3 duration-200">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-teal-500/40 flex items-center gap-3 text-xs sm:text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Connection Notice */}
        {dbError && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{dbError}</span>
          </div>
        )}

        {/* TAB 1: ALL BOOKINGS MANAGEMENT */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* KPI Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Total Bookings
                </span>
                <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
                  {metrics.total}
                </span>
                <span className="text-[11px] text-teal-600 font-medium">Live from Firestore</span>
              </div>

              <div className="p-4 bg-white rounded-xl border border-emerald-200 shadow-xs bg-emerald-50/20">
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">
                  Confirmed
                </span>
                <span className="text-2xl font-extrabold text-emerald-800 mt-1 block">
                  {metrics.confirmed}
                </span>
                <span className="text-[11px] text-emerald-600 font-medium">Active visits</span>
              </div>

              <div className="p-4 bg-white rounded-xl border border-amber-200 shadow-xs bg-amber-50/20">
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block">
                  Rescheduled
                </span>
                <span className="text-2xl font-extrabold text-amber-800 mt-1 block">
                  {metrics.rescheduled}
                </span>
                <span className="text-[11px] text-amber-600 font-medium">Updated slots</span>
              </div>

              <div className="p-4 bg-white rounded-xl border border-blue-200 shadow-xs bg-blue-50/20">
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider block">
                  Completed
                </span>
                <span className="text-2xl font-extrabold text-blue-800 mt-1 block">
                  {metrics.completed}
                </span>
                <span className="text-[11px] text-blue-600 font-medium">Consulted</span>
              </div>

              <div className="p-4 bg-white rounded-xl border border-purple-200 shadow-xs bg-purple-50/20">
                <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider block">
                  Today's OPD
                </span>
                <span className="text-2xl font-extrabold text-purple-800 mt-1 block">
                  {metrics.todayAppointments}
                </span>
                <span className="text-[11px] text-purple-600 font-medium">Scheduled today</span>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Est. Revenue
                </span>
                <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
                  ${metrics.totalRevenue.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Consultation fees</span>
              </div>
            </div>

            {/* Filter & Controls Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Patient Name, Phone, Email, Doctor, ID, or Department..."
                    className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Primary New Booking Action */}
                <button
                  onClick={() => setActiveTab('add-booking')}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Booking</span>
                </button>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
                {/* Status selector */}
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500 font-medium">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="py-1 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-teal-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="rescheduled">Rescheduled</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Department selector */}
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500 font-medium">Dept:</span>
                  <select
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    className="py-1 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-teal-500 max-w-[160px]"
                  >
                    <option value="all">All Departments</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name.split('&')[0].trim()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date filter */}
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500 font-medium">Date:</span>
                  <div className="flex items-center rounded-lg border border-slate-300 bg-slate-50 p-0.5">
                    {(['all', 'today', 'upcoming', 'past'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setDateFilter(mode)}
                        className={`px-2 py-0.5 rounded capitalize text-[11px] font-semibold transition-colors ${
                          dateFilter === mode
                            ? 'bg-teal-600 text-white'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="text-slate-500 font-medium">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="py-1 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-teal-500"
                  >
                    <option value="date-desc">Appointment Date (Newest First)</option>
                    <option value="date-asc">Appointment Date (Oldest First)</option>
                    <option value="patient">Patient Name (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bookings List / Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-800">
                    Appointments Management
                  </span>
                  <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                    {filteredBookings.length} of {bookings.length}
                  </span>
                </div>
                <span className="text-xs text-slate-500 hidden sm:inline">
                  Real-time synchronization with Firestore
                </span>
              </div>

              {loadingBookings ? (
                <div className="p-12 text-center text-slate-400">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-teal-600" />
                  <p className="text-sm font-semibold text-slate-700">Connecting to WECare Bookings Database...</p>
                  <p className="text-xs text-slate-400 mt-1">Retrieving verified appointments across all departments</p>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-6 h-6 text-slate-400" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">No appointments match your filters</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Try adjusting your search query, status filters, or create a new appointment manually from the admin portal.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setDeptFilter('all');
                      setDateFilter('all');
                    }}
                    className="mt-4 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        <th className="py-3 px-4">Booking ID</th>
                        <th className="py-3 px-4">Patient Information</th>
                        <th className="py-3 px-4">Doctor & Department</th>
                        <th className="py-3 px-4">Date & Slot</th>
                        <th className="py-3 px-4">Type & Fee</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {filteredBookings.map((b) => (
                        <tr
                          key={b.id}
                          className="hover:bg-teal-50/30 transition-colors group"
                        >
                          {/* ID */}
                          <td className="py-3 px-4 font-mono font-bold text-teal-800 whitespace-nowrap">
                            <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200 text-[11px]">
                              {b.id}
                            </span>
                          </td>

                          {/* Patient */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 text-sm">
                              {b.patientName}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {b.patientPhone}
                              </span>
                              <span>•</span>
                              <span>{b.patientAge}y, {b.patientGender}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                              {b.patientEmail}
                            </div>
                          </td>

                          {/* Doctor */}
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900 flex items-center gap-2">
                              {b.doctorPhoto && (
                                <img
                                  src={b.doctorPhoto}
                                  alt={b.doctorName}
                                  className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-200"
                                />
                              )}
                              <span>{b.doctorName}</span>
                            </div>
                            <div className="text-[11px] text-teal-700 font-medium">
                              {b.departmentName}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {b.roomNumber || 'Tower A, OPD'}
                            </div>
                          </td>

                          {/* Date & Slot */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="font-bold text-slate-800 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-teal-600" />
                              <span>{b.appointmentDate}</span>
                            </div>
                            <div className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{b.appointmentTime}</span>
                            </div>
                          </td>

                          {/* Type & Fee */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 mb-0.5">
                              {b.consultationType === 'teleconsult' ? 'Video Consult' : 'In-Person'}
                            </span>
                            <div className="font-bold text-slate-900 text-xs">
                              ${b.consultationFee || 100}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            {getStatusBadge(b.status)}
                          </td>

                          {/* Action Menu */}
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Quick status dropdown */}
                              <select
                                value={b.status}
                                onChange={(e: any) => handleUpdateStatus(b.id, e.target.value)}
                                className="py-1 px-2 text-[11px] font-semibold bg-white border border-slate-300 rounded-lg text-slate-700 hover:border-teal-500 focus:outline-hidden"
                                title="Change Booking Status"
                              >
                                <option value="Confirmed">Confirm</option>
                                <option value="Completed">Complete</option>
                                <option value="Rescheduled">Reschedule</option>
                                <option value="Cancelled">Cancel</option>
                              </select>

                              {/* View / Edit Modal */}
                              <button
                                onClick={() => {
                                  setSelectedBooking(b);
                                  setEditNotes(b.notes || '');
                                  setIsDetailModalOpen(true);
                                }}
                                className="p-1.5 bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-700 rounded-lg border border-slate-200 transition-colors"
                                title="View details & Clinical notes"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>

                              {/* Reschedule */}
                              <button
                                onClick={() => {
                                  setSelectedBooking(b);
                                  setRescheduleDate(b.appointmentDate);
                                  setRescheduleSlot(b.appointmentTime);
                                  setIsRescheduleModalOpen(true);
                                }}
                                className="p-1.5 bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-700 rounded-lg border border-slate-200 transition-colors"
                                title="Reschedule Date & Time"
                              >
                                <Clock className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete */}
                              {deleteConfirmId === b.id ? (
                                <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-lg border border-rose-200">
                                  <button
                                    onClick={() => handleDeleteBooking(b.id)}
                                    className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded"
                                  >
                                    Delete
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="px-1 py-0.5 text-slate-500 text-[10px]"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirmId(b.id)}
                                  className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg border border-slate-200 transition-colors"
                                  title="Delete Record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ADD NEW BOOKING FROM ADMIN END */}
        {activeTab === 'add-booking' && (
          <AdminNewBookingForm
            onSuccess={(newId) => {
              setActiveTab('bookings');
              showToast(`Booking ${newId} created successfully from Admin Portal.`);
            }}
            onCancel={() => setActiveTab('bookings')}
          />
        )}

        {/* TAB 3: SCHEDULE & ANALYTICS OVERVIEW */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Hospital OPD & Department Schedule Overview
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Real-time appointment distributions across WECare specialty clinics
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {DEPARTMENTS.map((dept) => {
                  const deptBookings = bookings.filter((b) => b.departmentId === dept.id);
                  const confirmedCount = deptBookings.filter((b) => b.status === 'Confirmed').length;
                  const deptDoctors = DOCTORS.filter((d) => d.departmentId === dept.id);

                  return (
                    <div
                      key={dept.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-slate-800">
                            {dept.name.split('&')[0].trim()}
                          </span>
                          <span className="text-xs bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
                            {deptBookings.length} bookings
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mb-3">{dept.floorLocation}</p>
                        <div className="space-y-1 text-xs text-slate-600">
                          <p>
                            • Doctors on roster: <strong>{deptDoctors.length}</strong>
                          </p>
                          <p>
                            • Confirmed appointments: <strong>{confirmedCount}</strong>
                          </p>
                          <p>
                            • Emergency service: <strong>{dept.emergencyAvailable ? 'Available 24/7' : 'Standard OPD'}</strong>
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setDeptFilter(dept.id);
                          setActiveTab('bookings');
                        }}
                        className="mt-4 w-full py-1.5 bg-white hover:bg-teal-50 text-teal-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors"
                      >
                        View {dept.name.split('&')[0].trim()} Bookings
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: BOOKING DETAIL & CLINICAL NOTES */}
      {isDetailModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider bg-teal-100 px-2 py-0.5 rounded">
                  Appointment Dossier
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  Booking #{selectedBooking.id}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedBooking.status)}
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Patient and Doctor Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Patient Profile
                  </span>
                  <p className="font-bold text-slate-900 text-base">{selectedBooking.patientName}</p>
                  <div className="space-y-1 text-xs text-slate-600 mt-2">
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedBooking.patientPhone}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedBooking.patientEmail}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedBooking.patientAge} years, {selectedBooking.patientGender}</span>
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Consulting Physician
                  </span>
                  <p className="font-bold text-slate-900 text-base">{selectedBooking.doctorName}</p>
                  <p className="text-xs font-semibold text-teal-700">{selectedBooking.departmentName}</p>
                  <div className="space-y-1 text-xs text-slate-600 mt-2">
                    <p>Room: {selectedBooking.roomNumber || 'Main OPD Clinic'}</p>
                    <p>Consultation Fee: <strong>${selectedBooking.consultationFee || 100}</strong></p>
                    <p>Type: <strong>{selectedBooking.consultationType === 'teleconsult' ? 'Tele-Consultation' : 'In-Person OPD'}</strong></p>
                  </div>
                </div>
              </div>

              {/* Schedule Info */}
              <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-200/80 flex items-center justify-between">
                <div>
                  <span className="text-xs text-teal-700 font-bold uppercase">Scheduled Time</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-teal-700" />
                    <span className="font-bold text-slate-900 text-sm">{selectedBooking.appointmentDate}</span>
                    <Clock className="w-4 h-4 text-teal-700 ml-2" />
                    <span className="font-bold text-slate-900 text-sm">{selectedBooking.appointmentTime}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setRescheduleDate(selectedBooking.appointmentDate);
                    setRescheduleSlot(selectedBooking.appointmentTime);
                    setIsRescheduleModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-lg border border-teal-300 transition-colors shadow-xs"
                >
                  Change Slot
                </button>
              </div>

              {/* Symptoms / Chief Complaint */}
              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Patient's Chief Complaint
                </span>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed">
                  {selectedBooking.chiefComplaint || 'Routine medical evaluation / specialist consultation.'}
                </div>
              </div>

              {/* Clinical / Administrative Notes */}
              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1 flex items-center justify-between">
                  <span>Administrative & Clinical Notes</span>
                  <span className="text-[10px] text-slate-400 font-normal">Saved to patient medical record</span>
                </span>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Record vitals, diagnosis notes, prescription directives, or front-desk check-in remarks..."
                  className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={handleSaveAdminNotes}
                    disabled={savingNotes}
                    className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {savingNotes ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>Save Notes</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Quick Status:</span>
                  <button
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'Confirmed')}
                    className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold rounded-lg border border-emerald-200"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'Completed')}
                    className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-lg border border-blue-200"
                  >
                    Mark Visited
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'Cancelled')}
                    className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold rounded-lg border border-rose-200"
                  >
                    Cancel
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Slip</span>
                  </button>
                  <button
                    onClick={() => setIsDetailModalOpen(false)}
                    className="px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: RESCHEDULE APPOINTMENT */}
      {isRescheduleModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Reschedule Appointment</h3>
                <p className="text-xs text-slate-500">Patient: {selectedBooking.patientName}</p>
              </div>
              <button
                onClick={() => setIsRescheduleModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select New Appointment Date
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 focus:outline-hidden focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Time Slot
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  '09:00 AM',
                  '10:00 AM',
                  '11:30 AM',
                  '01:00 PM',
                  '02:30 PM',
                  '04:00 PM',
                  '05:30 PM',
                  '06:30 PM'
                ].map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setRescheduleSlot(slot)}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      rescheduleSlot === slot
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRescheduleModalOpen(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveReschedule}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// SUB-COMPONENT: Admin New Booking Form
// ==========================================
interface AdminNewBookingFormProps {
  onSuccess: (newBookingId: string) => void;
  onCancel: () => void;
}

const AdminNewBookingForm: React.FC<AdminNewBookingFormProps> = ({ onSuccess, onCancel }) => {
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState<number>(32);
  const [patientGender, setPatientGender] = useState<Appointment['patientGender']>('Male');
  const [patientMRN, setPatientMRN] = useState('');

  // Department & Doctor
  const [selectedDeptId, setSelectedDeptId] = useState(DEPARTMENTS[0].id);
  const availableDoctors = useMemo(() => {
    return DOCTORS.filter((d) => d.departmentId === selectedDeptId);
  }, [selectedDeptId]);

  const [selectedDoctorId, setSelectedDoctorId] = useState(availableDoctors[0]?.id || DOCTORS[0].id);

  // Sync doctor when department changes
  useEffect(() => {
    if (availableDoctors.length > 0) {
      setSelectedDoctorId(availableDoctors[0].id);
    }
  }, [availableDoctors]);

  const activeDoctor = useMemo(() => {
    return DOCTORS.find((d) => d.id === selectedDoctorId) || DOCTORS[0];
  }, [selectedDoctorId]);

  const activeDepartment = useMemo(() => {
    return DEPARTMENTS.find((d) => d.id === selectedDeptId) || DEPARTMENTS[0];
  }, [selectedDeptId]);

  // Schedule
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const [appointmentDate, setAppointmentDate] = useState(tomorrowStr);
  const [appointmentTime, setAppointmentTime] = useState('10:00 AM');
  const [consultationType, setConsultationType] = useState<Appointment['consultationType']>('in-person');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [bookingSource, setBookingSource] = useState('Reception Desk / Walk-in');
  const [status, setStatus] = useState<Appointment['status']>('Confirmed');
  const [adminNotes, setAdminNotes] = useState('');
  const [customFee, setCustomFee] = useState<number>(activeDoctor?.consultationFee || 120);

  // Sync fee when doctor changes
  useEffect(() => {
    if (activeDoctor) {
      setCustomFee(activeDoctor.consultationFee);
    }
  }, [activeDoctor]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!patientName.trim()) {
      setErrorMsg('Patient full name is required.');
      return;
    }
    if (!patientPhone.trim()) {
      setErrorMsg('Patient contact phone is required.');
      return;
    }
    if (!appointmentDate) {
      setErrorMsg('Appointment date is required.');
      return;
    }

    setSubmitting(true);
    const newId = `WEC-ADM-${Math.floor(1000 + Math.random() * 9000)}`;

    const newAppointment: Appointment = {
      id: newId,
      patientName: patientName.trim(),
      patientEmail: patientEmail.trim() || `${patientName.toLowerCase().replace(/\s+/g, '')}@patient.wecare.org`,
      patientPhone: patientPhone.trim(),
      patientAge: Number(patientAge) || 30,
      patientGender,
      patientId: patientMRN ? `MRN-${patientMRN}` : `PAT-${Math.floor(10000 + Math.random() * 90000)}`,
      departmentId: activeDepartment.id,
      departmentName: activeDepartment.name,
      doctorId: activeDoctor.id,
      doctorName: activeDoctor.name,
      doctorPhoto: activeDoctor.photo,
      appointmentDate,
      appointmentTime,
      consultationType,
      chiefComplaint: chiefComplaint.trim() || 'General Specialist Consultation',
      status,
      createdAt: new Date().toISOString(),
      roomNumber: activeDoctor.roomNumber || 'Main OPD Tower A',
      consultationFee: Number(customFee) || activeDoctor.consultationFee || 100,
      notes: adminNotes ? `[Source: ${bookingSource}] ${adminNotes}` : `[Source: ${bookingSource}] Registered by Hospital Reception.`
    };

    try {
      await addAdminBookingToDb(newAppointment);
      onSuccess(newId);
    } catch (err: any) {
      console.error('Failed to create admin booking:', err);
      setErrorMsg(err.message || 'Failed to save appointment in database.');
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-4xl mx-auto">
      <div className="border-b border-slate-200 pb-5 mb-6 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider bg-teal-100 px-2 py-0.5 rounded">
            Administrative Reception Entry
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Create Appointment from Admin Desk</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Register patient booking for in-person consultations, telephone bookings, or executive referrals.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>

      {errorMsg && (
        <div className="mb-6 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Patient Details */}
        <div>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-teal-600" />
            <span>1. Patient Demographics</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. Johnathan Smith"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 focus:outline-hidden focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                placeholder="+1 (555) 234-5678"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 focus:outline-hidden focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
                placeholder="patient@example.com"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 focus:outline-hidden focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Age
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={patientAge}
                onChange={(e) => setPatientAge(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 focus:outline-hidden focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gender
              </label>
              <select
                value={patientGender}
                onChange={(e: any) => setPatientGender(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 focus:outline-hidden focus:border-teal-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                MRN / Patient ID (Optional)
              </label>
              <input
                type="text"
                value={patientMRN}
                onChange={(e) => setPatientMRN(e.target.value)}
                placeholder="MRN-84910"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 focus:outline-hidden focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Department & Doctor */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-teal-600" />
            <span>2. Clinical Service & Doctor Selection</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department *
              </label>
              <select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 focus:outline-hidden focus:border-teal-500 font-medium"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Physician / Specialist *
              </label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 focus:outline-hidden focus:border-teal-500 font-medium"
              >
                {availableDoctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} — {doc.title} (${doc.consultationFee})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Doctor preview card */}
          {activeDoctor && (
            <div className="mt-3 p-3 bg-teal-50/70 border border-teal-200/80 rounded-xl flex items-center gap-3">
              <img
                src={activeDoctor.photo}
                alt={activeDoctor.name}
                className="w-12 h-12 rounded-xl object-cover border border-teal-300 shadow-xs"
              />
              <div className="text-xs">
                <p className="font-bold text-slate-900">{activeDoctor.name}</p>
                <p className="text-teal-700 font-medium">{activeDoctor.title}</p>
                <p className="text-slate-500 text-[11px]">
                  Room: {activeDoctor.roomNumber} • Experience: {activeDoctor.experienceYears} yrs
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Schedule & Consultation Mode */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-600" />
            <span>3. Appointment Schedule & Modality</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Appointment Date *
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 focus:outline-hidden focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Time Slot *
              </label>
              <select
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 focus:outline-hidden focus:border-teal-500 font-medium"
              >
                {[
                  '09:00 AM',
                  '09:30 AM',
                  '10:00 AM',
                  '10:30 AM',
                  '11:00 AM',
                  '11:30 AM',
                  '01:00 PM',
                  '02:00 PM',
                  '03:00 PM',
                  '04:00 PM',
                  '05:00 PM',
                  '06:00 PM'
                ].map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Consultation Type
              </label>
              <select
                value={consultationType}
                onChange={(e: any) => setConsultationType(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 focus:outline-hidden focus:border-teal-500 font-medium"
              >
                <option value="in-person">In-Person Consultation (Hospital OPD)</option>
                <option value="teleconsult">Teleconsultation (Video / Call)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Complaint & Admin Metadata */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-600" />
            <span>4. Clinical Reason & Admin Controls</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Booking Source
              </label>
              <select
                value={bookingSource}
                onChange={(e) => setBookingSource(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 focus:outline-hidden focus:border-teal-500 font-medium"
              >
                <option value="Reception Desk / Walk-in">Reception Desk / Walk-in</option>
                <option value="Phone Call Center">Phone Call Center</option>
                <option value="Emergency Referral">Emergency Referral</option>
                <option value="Doctor Direct Schedule">Doctor Direct Schedule</option>
                <option value="Corporate / Insurance Desk">Corporate / Insurance Desk</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 focus:outline-hidden focus:border-teal-500 font-medium"
              >
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed (Walk-in already consulted)</option>
                <option value="Rescheduled">Rescheduled</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chief Complaint / Symptoms
              </label>
              <textarea
                rows={2}
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="e.g. Persistent headache, hypertension checkup, post-operative evaluation..."
                className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 focus:outline-hidden focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Administrative / Front-Desk Notes
              </label>
              <input
                type="text"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="e.g. VIP patient, priority triage, payment received at billing counter 3..."
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 focus:outline-hidden focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Creating Booking in Database...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Confirm & Create Appointment</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
