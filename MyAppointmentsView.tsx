import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  User,
  Phone,
  Mail,
  Printer,
  Download,
  XCircle,
  AlertCircle,
  CheckCircle2,
  CalendarCheck2,
  Search,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
  LogIn,
  UserCheck,
  Lock
} from 'lucide-react';
import { Appointment, Doctor } from '../types/hospital';
import { useAuth } from '../context/AuthContext';

interface MyAppointmentsViewProps {
  appointments: Appointment[];
  doctors: Doctor[];
  onCancelAppointment: (appointmentId: string) => void;
  onRescheduleAppointment: (appointmentId: string, newDate: string, newSlot: string) => void;
  onOpenNewBooking: () => void;
  onViewDoctorProfile: (doctor: Doctor) => void;
}

export const MyAppointmentsView: React.FC<MyAppointmentsViewProps> = ({
  appointments,
  doctors,
  onCancelAppointment,
  onRescheduleAppointment,
  onOpenNewBooking,
  onViewDoctorProfile,
}) => {
  const { user, userProfile, openAuthModal } = useAuth();
  const [filterStatus, setFilterStatus] = useState<'all' | 'Confirmed' | 'Cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cancelModalId, setCancelModalId] = useState<string | null>(null);

  // Reschedule state
  const [rescheduleAppointment, setRescheduleAppointment] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlot, setRescheduleSlot] = useState('');

  // Strict patient-level isolation: only show appointments booked by this authenticated user
  const userAppointments = useMemo(() => {
    if (!user) return [];
    return appointments.filter((apt) => {
      if (apt.userId && user.uid && apt.userId === user.uid) return true;
      if (apt.patientEmail && user.email && apt.patientEmail.trim().toLowerCase() === user.email.trim().toLowerCase()) return true;
      return false;
    });
  }, [appointments, user]);

  // Filter appointments by status & query
  const filteredAppointments = useMemo(() => {
    return userAppointments.filter((apt) => {
      const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
      const matchesSearch =
        searchQuery === '' ||
        apt.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.departmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.patientName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [userAppointments, filterStatus, searchQuery]);

  const handleStartReschedule = (apt: Appointment) => {
    setRescheduleAppointment(apt);
    // default to tomorrow or existing date + 1
    const d = new Date();
    d.setDate(d.getDate() + 2);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setRescheduleDate(`${yyyy}-${mm}-${dd}`);
    setRescheduleSlot(apt.appointmentTime || '10:00 AM');
  };

  const handleConfirmReschedule = () => {
    if (rescheduleAppointment && rescheduleDate && rescheduleSlot) {
      onRescheduleAppointment(rescheduleAppointment.id, rescheduleDate, rescheduleSlot);
      setRescheduleAppointment(null);
    }
  };

  // ==========================================
  // GATE: Strictly require sign-in to view appointments
  // ==========================================
  if (!user) {
    return (
      <div className="py-12 sm:py-20 bg-slate-50 min-h-[calc(100vh-200px)] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden text-center">
          <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-8 text-white">
            <div className="w-16 h-16 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center mx-auto mb-4 text-teal-400 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Patient Portal Access</h2>
            <p className="text-xs text-teal-300 font-medium tracking-wide uppercase mt-1">
              Sign In Required for Confidential Records
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">
                Sign in to view your appointments
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                To protect your medical privacy, appointments, doctor consultation details, and digital OPD passes are only visible to the patient who booked them.
              </p>
            </div>

            <div className="space-y-3">
              <button
                id="sign-in-to-view-appointments-btn"
                onClick={() => openAuthModal('signin')}
                className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-teal-600/20 flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In to Patient Portal</span>
              </button>

              <button
                id="create-account-to-view-appointments-btn"
                onClick={() => openAuthModal('signup')}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4 text-slate-500" />
                <span>New Patient? Register Account</span>
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <p className="text-[11px] text-slate-400 mb-2">Need to schedule a new consultation?</p>
              <button
                onClick={onOpenNewBooking}
                className="text-teal-700 hover:text-teal-800 text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Book an Appointment Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 bg-slate-50 min-h-[calc(100vh-200px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700">
              <CalendarCheck2 className="w-4 h-4" />
              <span>Patient Appointment Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
              My Appointments
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              View, manage, download passes, or reschedule your upcoming hospital consultations.
            </p>
          </div>

          <button
            id="book-new-from-portal-btn"
            onClick={onOpenNewBooking}
            className="self-start sm:self-auto px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Book New Appointment</span>
          </button>
        </div>

        {/* Connected Patient Identity Strip */}
        <div className="mt-6 p-3 bg-teal-50 border border-teal-200/80 rounded-xl flex items-center justify-between text-xs text-teal-900">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>
              Patient Portal Account: <strong className="font-semibold">{userProfile?.name || user.displayName || user.email}</strong> ({user.email})
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase bg-teal-100 text-teal-800 px-2 py-0.5 rounded font-semibold hidden sm:inline-block">
            Personal Medical Record
          </span>
        </div>

        {/* Filter & Search Controls */}
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl w-fit">
            <button
              id="filter-status-all"
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterStatus === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({userAppointments.length})
            </button>
            <button
              id="filter-status-confirmed"
              onClick={() => setFilterStatus('Confirmed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterStatus === 'Confirmed'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Confirmed ({userAppointments.filter((a) => a.status === 'Confirmed').length})
            </button>
            <button
              id="filter-status-cancelled"
              onClick={() => setFilterStatus('Cancelled')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterStatus === 'Cancelled'
                  ? 'bg-white text-rose-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cancelled ({userAppointments.filter((a) => a.status === 'Cancelled').length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by doctor, ref, patient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Appointments List */}
        <div className="mt-6 space-y-4">
          {userAppointments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center mx-auto">
                <Calendar className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">No Appointments Booked Yet</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                  You currently do not have any appointments scheduled under this account (<strong>{user.email}</strong>). Schedule your visit with our medical specialists to receive your digital OPD pass.
                </p>
              </div>
              <button
                id="book-first-appointment-btn"
                onClick={onOpenNewBooking}
                className="px-5 py-2.5 bg-teal-600 text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-teal-700 inline-flex items-center gap-2 shadow-xs transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Book Your First Appointment</span>
              </button>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Matching Appointments</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchQuery
                  ? 'No appointments matched your search criteria.'
                  : 'You have no booked appointments currently matching this status filter.'}
              </p>
              <button
                onClick={() => {
                  setFilterStatus('all');
                  setSearchQuery('');
                }}
                className="mt-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg inline-flex items-center gap-1.5"
              >
                <span>Clear Filters</span>
              </button>
            </div>
          ) : (
            filteredAppointments.map((apt) => {
              const matchedDoctor = doctors.find((d) => d.id === apt.doctorId);
              const isCancelled = apt.status === 'Cancelled';

              return (
                <div
                  key={apt.id}
                  className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                    isCancelled
                      ? 'border-slate-200 opacity-75'
                      : 'border-slate-200/90 shadow-xs hover:border-teal-300 hover:shadow-md'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-teal-800 text-sm">
                        {apt.id}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-600">
                        Booked: {new Date(apt.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {apt.status === 'Confirmed' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Confirmed
                        </span>
                      )}
                      {apt.status === 'Cancelled' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3.5 h-3.5" />
                          Cancelled
                        </span>
                      )}
                      {apt.status === 'Rescheduled' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <RefreshCw className="w-3.5 h-3.5" />
                          Rescheduled
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Main Card Body */}
                  <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    {/* Doctor Details */}
                    <div className="flex items-start gap-3.5">
                      <img
                        src={apt.doctorPhoto}
                        alt={apt.doctorName}
                        className="w-14 h-14 rounded-xl object-cover border border-teal-100 shrink-0"
                      />
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                          {apt.departmentName.split('&')[0]}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{apt.doctorName}</h4>
                        {matchedDoctor && (
                          <p className="text-[11px] text-slate-500">{matchedDoctor.qualifications.split(',')[0]}</p>
                        )}
                        <p className="text-xs text-teal-700 font-semibold">Fee: ${apt.consultationFee}</p>
                      </div>
                    </div>

                    {/* Schedule & Location Details */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-slate-800 font-semibold">
                        <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
                        <span>
                          {new Date(apt.appointmentDate + 'T00:00:00').toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="text-slate-400">|</span>
                        <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                        <span>{apt.appointmentTime}</span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-600">
                        {apt.consultationType === 'teleconsult' ? (
                          <>
                            <Video className="w-4 h-4 text-cyan-600 shrink-0" />
                            <span>Virtual Teleconsult • Video Link Active 15m Before</span>
                          </>
                        ) : (
                          <>
                            <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                            <span>{apt.roomNumber}</span>
                          </>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                        Patient: <strong className="text-slate-700">{apt.patientName}</strong> ({apt.patientAge}y, {apt.patientGender}) • Phone: {apt.patientPhone}
                      </div>
                    </div>

                    {/* Actions & Instructions */}
                    <div className="flex flex-col justify-between h-full space-y-3 md:border-l md:border-slate-100 md:pl-5">
                      <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                        <span className="font-semibold text-slate-700 block mb-0.5">Pre-visit Guidance:</span>
                        {apt.notes || 'Please carry any recent diagnostic records, imaging films, and current prescriptions.'}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          onClick={() => window.print()}
                          title="Print slip"
                          className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-500" />
                          <span>Slip</span>
                        </button>

                        {!isCancelled && (
                          <>
                            <button
                              id={`reschedule-btn-${apt.id}`}
                              onClick={() => handleStartReschedule(apt)}
                              className="px-2.5 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 flex items-center gap-1"
                            >
                              <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
                              <span>Reschedule</span>
                            </button>

                            <button
                              id={`cancel-btn-${apt.id}`}
                              onClick={() => setCancelModalId(apt.id)}
                              className="px-2.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Cancel</span>
                            </button>
                          </>
                        )}

                        {matchedDoctor && (
                          <button
                            onClick={() => onViewDoctorProfile(matchedDoctor)}
                            className="text-xs text-slate-500 hover:text-teal-700 underline ml-auto"
                          >
                            Doctor Info
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Cancellation Confirmation Dialog */}
      {cancelModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Cancel Appointment?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to cancel appointment <strong>{cancelModalId}</strong>? This slot will be released back into the clinical calendar.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setCancelModalId(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Keep Appointment
              </button>
              <button
                id="confirm-cancel-appointment-btn"
                onClick={() => {
                  onCancelAppointment(cancelModalId);
                  setCancelModalId(null);
                }}
                className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Dialog */}
      {rescheduleAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-teal-600" />
                <span>Reschedule Appointment</span>
              </h3>
              <button
                onClick={() => setRescheduleAppointment(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <p>Consulting Doctor: <strong>{rescheduleAppointment.doctorName}</strong></p>
              <p>Current Time: {rescheduleAppointment.appointmentDate} at {rescheduleAppointment.appointmentTime}</p>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Select New Date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Select Time Slot</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['09:00 AM', '10:30 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM'].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setRescheduleSlot(slot)}
                      className={`py-1.5 text-xs font-medium rounded border ${
                        rescheduleSlot === slot
                          ? 'bg-teal-600 text-white border-teal-700'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-white'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                onClick={() => setRescheduleAppointment(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                id="confirm-reschedule-appointment-btn"
                onClick={handleConfirmReschedule}
                className="flex-1 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg"
              >
                Save New Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
