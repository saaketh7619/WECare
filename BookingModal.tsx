import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  AlertCircle,
  Building2,
  Stethoscope,
  Video,
  MapPin,
  Printer,
  Download,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Department, Doctor, Appointment } from '../types/hospital';
import { useAuth } from '../context/AuthContext';
import { saveBookingToDb } from '../firebase';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  departments: Department[];
  doctors: Doctor[];
  initialDoctor?: Doctor | null;
  initialDepartment?: Department | null;
  onAppointmentBooked: (newAppointment: Appointment) => void;
  onNavigateToMyAppointments?: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  departments,
  doctors,
  initialDoctor,
  initialDepartment,
  onAppointmentBooked,
  onNavigateToMyAppointments,
}) => {
  const { user, userProfile, openAuthModal } = useAuth();

  // Selected department and doctor
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [consultationType, setConsultationType] = useState<'in-person' | 'teleconsult'>('in-person');

  // Dates & Slots
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');

  // Patient Info
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState<number | ''>('');
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say'>('Male');
  const [patientId, setPatientId] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');

  // Status
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState<Appointment | null>(null);

  // Initialize or reset when modal opens or initial props change
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setIsSubmitting(false);
      setBookedAppointment(null);
      setErrorMsg('');

      // Pre-fill user profile info if logged in
      if (userProfile || user) {
        setPatientName(userProfile?.name || user?.displayName || '');
        setPatientEmail(userProfile?.email || user?.email || '');
        setPatientPhone(userProfile?.phone || '');
      }

      if (initialDoctor) {
        setSelectedDoctorId(initialDoctor.id);
        setSelectedDeptId(initialDoctor.departmentId);
      } else if (initialDepartment) {
        setSelectedDeptId(initialDepartment.id);
        const deptDocs = doctors.filter((d) => d.departmentId === initialDepartment.id);
        setSelectedDoctorId(deptDocs.length > 0 ? deptDocs[0].id : '');
      } else {
        setSelectedDeptId(departments[0]?.id || '');
        const firstDeptDocs = doctors.filter((d) => d.departmentId === (departments[0]?.id || ''));
        setSelectedDoctorId(firstDeptDocs[0]?.id || '');
      }

      // Default date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yyyy = tomorrow.getFullYear();
      const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const dd = String(tomorrow.getDate()).padStart(2, '0');
      setSelectedDate(`${yyyy}-${mm}-${dd}`);
      setSelectedSlot('');
    }
  }, [isOpen, initialDoctor, initialDepartment, departments, doctors, userProfile, user]);

  // When selected department changes, ensure selected doctor matches
  const handleDepartmentChange = (deptId: string) => {
    setSelectedDeptId(deptId);
    const deptDocs = doctors.filter((d) => d.departmentId === deptId);
    if (!deptDocs.some((d) => d.id === selectedDoctorId)) {
      setSelectedDoctorId(deptDocs.length > 0 ? deptDocs[0].id : '');
    }
    setSelectedSlot('');
  };

  // When doctor changes, sync department
  const handleDoctorChange = (docId: string) => {
    setSelectedDoctorId(docId);
    const doc = doctors.find((d) => d.id === docId);
    if (doc) {
      setSelectedDeptId(doc.departmentId);
    }
    setSelectedSlot('');
  };

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);
  const selectedDepartment = departments.find((d) => d.id === selectedDeptId);
  const filteredDoctors = doctors.filter((d) => !selectedDeptId || d.departmentId === selectedDeptId);

  // Generate 7 days upcoming for the interactive date picker
  const generateUpcomingDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 1; i <= 10; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateString = `${yyyy}-${mm}-${dd}`;
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const fullDay = d.toLocaleDateString('en-US', { weekday: 'long' });
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      const dayNum = d.getDate();

      // Check if selected doctor is available on this day
      const isAvailable = selectedDoctor ? selectedDoctor.availableDays.includes(fullDay) : true;

      days.push({
        dateString,
        dayName,
        fullDay,
        monthName,
        dayNum,
        isAvailable,
      });
    }
    return days;
  };

  const upcomingDays = generateUpcomingDays();

  // Handle Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!user) {
      setErrorMsg('Please sign in or register before completing your appointment booking.');
      openAuthModal('signin');
      return;
    }

    if (!selectedDoctor) {
      setErrorMsg('Please select a consulting doctor.');
      return;
    }
    if (!selectedDate) {
      setErrorMsg('Please select a preferred appointment date.');
      return;
    }
    if (!selectedSlot) {
      setErrorMsg('Please select an available consultation time slot.');
      return;
    }
    if (!patientName.trim()) {
      setErrorMsg('Please provide the patient full name.');
      return;
    }
    if (!patientPhone.trim()) {
      setErrorMsg('Please provide a contact phone number.');
      return;
    }
    if (!patientEmail.trim() || !patientEmail.includes('@')) {
      setErrorMsg('Please provide a valid email address for confirmation.');
      return;
    }

    // Generate unique reference
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const appointmentId = `WEC-2026-${randomNum}`;

    const newAppointment: Appointment = {
      id: appointmentId,
      userId: user.uid,
      patientName: patientName.trim(),
      patientEmail: patientEmail.trim(),
      patientPhone: patientPhone.trim(),
      patientAge: Number(patientAge) || 30,
      patientGender: patientGender,
      patientId: patientId.trim() || undefined,
      departmentId: selectedDoctor.departmentId,
      departmentName: selectedDoctor.departmentName,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      doctorPhoto: selectedDoctor.photo,
      appointmentDate: selectedDate,
      appointmentTime: selectedSlot,
      consultationType: consultationType,
      chiefComplaint: chiefComplaint.trim() || 'General consultation and evaluation',
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
      roomNumber: consultationType === 'teleconsult' ? 'Telehealth Virtual Suite #3' : selectedDoctor.roomNumber,
      consultationFee: selectedDoctor.consultationFee,
      notes: consultationType === 'teleconsult'
        ? 'Secure telehealth meeting link will be sent to your email 15 minutes before the session.'
        : 'Please arrive at the clinic counter 15 minutes prior to appointment time with your photo ID.',
    };

    setIsSubmitting(true);
    try {
      await saveBookingToDb(newAppointment, user.uid);
    } catch (saveErr) {
      console.warn('Booking stored locally; cloud sync notice:', saveErr);
    } finally {
      setIsSubmitting(false);
    }

    onAppointmentBooked(newAppointment);
    setBookedAppointment(newAppointment);
    setIsSuccess(true);
  };

  // Calendar .ics download simulator
  const handleDownloadCalendar = () => {
    if (!bookedAppointment) return;
    const content = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//WECare Hospitals//Appointment System//EN\nBEGIN:VEVENT\nSUMMARY:WECare Hospital Appointment - ${bookedAppointment.doctorName}\nDESCRIPTION:Consultation with ${bookedAppointment.doctorName} (${bookedAppointment.departmentName}). Ref: ${bookedAppointment.id}\nLOCATION:WECare Hospitals, ${bookedAppointment.roomNumber}\nSTATUS:CONFIRMED\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `WECare-Appointment-${bookedAppointment.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 sm:my-8 max-h-[92vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-0.5 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
              <img
                src="/logo.png"
                alt="WECare Hospitals Logo"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isSuccess ? 'Appointment Confirmed' : 'Book a Doctor Appointment'}
              </h3>
              <p className="text-[11px] text-teal-300">
                WECare Hospitals • Instant Clinical Slot Reservation
              </p>
            </div>
          </div>
          <button
            id="close-booking-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto">
          {isSuccess && bookedAppointment ? (
            /* ================= SUCCESS CONFIRMATION VIEW ================= */
            <div className="space-y-6 animate-in zoom-in-95 duration-200">
              <div className="text-center space-y-2 py-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Appointment Successfully Confirmed!
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Your appointment has been registered in the WECare Hospital system. A confirmation SMS & digital pass have been dispatched to <strong>{bookedAppointment.patientPhone}</strong> and <strong>{bookedAppointment.patientEmail}</strong>.
                </p>
              </div>

              {/* Printable Appointment Pass */}
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/70 space-y-4 shadow-xs">
                <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Appointment Reference</span>
                    <p className="text-base font-bold font-mono text-teal-700">{bookedAppointment.id}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                      <ShieldCheck className="w-3 h-3" />
                      Confirmed
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Consulting Doctor</span>
                    <div className="flex items-center gap-2.5 mt-1">
                      <img
                        src={bookedAppointment.doctorPhoto}
                        alt={bookedAppointment.doctorName}
                        className="w-10 h-10 rounded-full object-cover border border-teal-200"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{bookedAppointment.doctorName}</p>
                        <p className="text-slate-500">{bookedAppointment.departmentName}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Patient Details</span>
                    <p className="font-bold text-slate-900 mt-1">{bookedAppointment.patientName} ({bookedAppointment.patientAge} yrs, {bookedAppointment.patientGender})</p>
                    <p className="text-slate-500">{bookedAppointment.patientPhone}</p>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Schedule & Time</span>
                    <p className="font-bold text-teal-700 text-sm mt-0.5">
                      {new Date(bookedAppointment.appointmentDate + 'T00:00:00').toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="font-semibold text-slate-700 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      {bookedAppointment.appointmentTime}
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Location / Consultation Mode</span>
                    <p className="font-bold text-slate-800 text-sm mt-0.5 flex items-center gap-1.5">
                      {bookedAppointment.consultationType === 'teleconsult' ? (
                        <>
                          <Video className="w-4 h-4 text-cyan-600" />
                          <span>Virtual Video Teleconsult</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-4 h-4 text-teal-600" />
                          <span>In-Person Hospital OPD</span>
                        </>
                      )}
                    </p>
                    <p className="text-slate-600 mt-0.5">{bookedAppointment.roomNumber}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                  <span>Consultation Fee: <strong>${bookedAppointment.consultationFee}</strong> (Payable at OPD reception or online link)</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  id="download-calendar-btn"
                  onClick={handleDownloadCalendar}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  <span>Add to Calendar (.ics)</span>
                </button>

                <button
                  id="print-appointment-btn"
                  onClick={() => window.print()}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  <span>Print Appointment Slip</span>
                </button>

                {onNavigateToMyAppointments && (
                  <button
                    id="goto-my-appointments-btn"
                    onClick={() => {
                      onClose();
                      onNavigateToMyAppointments();
                    }}
                    className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm flex items-center gap-1.5"
                  >
                    <span>View in My Appointments</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* ================= APPOINTMENT FORM ================= */
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Step 1: Department & Doctor Selection */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-[11px] font-bold flex items-center justify-center">1</span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Select Department & Doctor
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Department Select */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Clinical Department
                    </label>
                    <div className="relative">
                      <select
                        id="booking-dept-select"
                        value={selectedDeptId}
                        onChange={(e) => handleDepartmentChange(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                      >
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Doctor Select */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Consulting Doctor ({filteredDoctors.length} available)
                    </label>
                    <select
                      id="booking-doctor-select"
                      value={selectedDoctorId}
                      onChange={(e) => handleDoctorChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    >
                      {filteredDoctors.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.name} — {doc.qualifications.split(',')[0]} (${doc.consultationFee})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Selected Doctor Summary Preview */}
                {selectedDoctor && (
                  <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-200/70 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedDoctor.photo}
                        alt={selectedDoctor.name}
                        className="w-12 h-12 rounded-xl object-cover border border-teal-200 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{selectedDoctor.name}</p>
                        <p className="text-slate-600 text-[11px]">{selectedDoctor.title}</p>
                        <p className="text-teal-800 text-[11px]">
                          {selectedDoctor.roomNumber} • Fee: <strong>${selectedDoctor.consultationFee}</strong>
                        </p>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] text-slate-500 block">Available Days:</span>
                      <span className="text-[11px] font-medium text-slate-700">
                        {selectedDoctor.availableDays.slice(0, 3).join(', ')}...
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Consultation Mode */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-[11px] font-bold flex items-center justify-center">2</span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Consultation Type
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      consultationType === 'in-person'
                        ? 'bg-teal-50 border-teal-600 text-teal-900 ring-1 ring-teal-600'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="consultationType"
                      value="in-person"
                      checked={consultationType === 'in-person'}
                      onChange={() => setConsultationType('in-person')}
                      className="mt-1 text-teal-600 focus:ring-teal-500"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <Building2 className="w-4 h-4 text-teal-600" />
                        <span>In-Person Hospital OPD Visit</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Consult directly in the doctor’s clinic suite at WECare Campus.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      consultationType === 'teleconsult'
                        ? 'bg-teal-50 border-teal-600 text-teal-900 ring-1 ring-teal-600'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="consultationType"
                      value="teleconsult"
                      checked={consultationType === 'teleconsult'}
                      onChange={() => setConsultationType('teleconsult')}
                      className="mt-1 text-teal-600 focus:ring-teal-500"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <Video className="w-4 h-4 text-cyan-600" />
                        <span>Video Teleconsultation</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Secure HD video conference consultation from the comfort of your home.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Step 3: Date & Time Slot Picker */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-[11px] font-bold flex items-center justify-center">3</span>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Select Date & Available Slot
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Clinic hours: 8:30 AM - 6:00 PM
                  </span>
                </div>

                {/* Horizontal date selector */}
                <div className="flex gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin">
                  {upcomingDays.map((day) => {
                    const isSelected = selectedDate === day.dateString;
                    return (
                      <button
                        key={day.dateString}
                        type="button"
                        onClick={() => {
                          setSelectedDate(day.dateString);
                          setSelectedSlot('');
                        }}
                        disabled={!day.isAvailable}
                        className={`min-w-20 p-2.5 rounded-xl border text-center transition-all shrink-0 ${
                          !day.isAvailable
                            ? 'opacity-40 bg-slate-100 border-slate-200 cursor-not-allowed'
                            : isSelected
                            ? 'bg-teal-600 text-white border-teal-700 shadow-xs ring-2 ring-teal-600/30'
                            : 'bg-white text-slate-800 border-slate-200 hover:border-teal-400 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`text-[10px] font-bold uppercase block ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                          {day.dayName}
                        </span>
                        <span className="text-base font-bold block my-0.5">
                          {day.dayNum}
                        </span>
                        <span className={`text-[10px] block ${isSelected ? 'text-teal-100' : 'text-slate-500'}`}>
                          {day.monthName}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Slots Grid */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Available Time Slots for {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Selected Date'}
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {(selectedDoctor?.availableTimeSlots || ['09:00 AM', '10:30 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM']).map((slot) => {
                      const isSlotSelected = selectedSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2 px-1 text-xs font-semibold rounded-lg border transition-all ${
                            isSlotSelected
                              ? 'bg-teal-600 text-white border-teal-700 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-teal-400 hover:bg-white'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Step 4: Patient Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-[11px] font-bold flex items-center justify-center">4</span>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Patient Information
                    </h4>
                  </div>
                  {user && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-semibold">
                      <ShieldCheck className="w-3 h-3 text-teal-600" />
                      <span>Syncing with {userProfile?.name || user.displayName || user.email}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Patient Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        id="patient-name-input"
                        type="text"
                        required
                        placeholder="e.g. Emily Watson"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Age (Years) *
                      </label>
                      <input
                        id="patient-age-input"
                        type="number"
                        min="1"
                        max="120"
                        required
                        placeholder="e.g. 34"
                        value={patientAge}
                        onChange={(e) => setPatientAge(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Gender *
                      </label>
                      <select
                        id="patient-gender-select"
                        value={patientGender}
                        onChange={(e) => setPatientGender(e.target.value as any)}
                        className="w-full px-2 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:border-teal-500"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Contact Mobile Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        id="patient-phone-input"
                        type="tel"
                        required
                        placeholder="+1 (555) 000-0000"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Email Address (for Digital Slip) *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        id="patient-email-input"
                        type="email"
                        required
                        placeholder="patient@example.com"
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Hospital Patient ID (Optional)
                    </label>
                    <input
                      id="patient-id-input"
                      type="text"
                      placeholder="e.g. PT-89210 (if registered previously)"
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Reason for Consultation / Symptoms
                    </label>
                    <input
                      id="patient-symptoms-input"
                      type="text"
                      placeholder="e.g. Chest discomfort, second opinion on MRI"
                      value={chiefComplaint}
                      onChange={(e) => setChiefComplaint(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit & Summary bar */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-500 text-center sm:text-left">
                  <span>Standard Consultation Fee: </span>
                  <span className="text-slate-900 font-bold text-sm">
                    ${selectedDoctor?.consultationFee || 120}
                  </span>
                  <span className="text-slate-400"> (Zero cancellation penalty)</span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    id="submit-booking-form-btn"
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none px-6 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 rounded-lg shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving to Firebase...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Appointment</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
