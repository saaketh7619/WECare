import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { AboutView } from './components/AboutView';
import { DepartmentsView } from './components/DepartmentsView';
import { DoctorsView } from './components/DoctorsView';
import { MyAppointmentsView } from './components/MyAppointmentsView';
import { AdminPortal } from './components/AdminPortal';
import { BookingModal } from './components/BookingModal';
import { DoctorDetailModal } from './components/DoctorDetailModal';
import { DepartmentDetailModal } from './components/DepartmentDetailModal';
import { AuthModal } from './components/AuthModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  updateBookingStatusInDb,
  rescheduleBookingInDb,
  subscribeUserBookings
} from './firebase';

import {
  DEPARTMENTS,
  DOCTORS,
  INITIAL_SAMPLE_APPOINTMENTS,
  HOSPITAL_INFO
} from './data/hospitalData';
import { ActivePage, Appointment, Department, Doctor } from './types/hospital';
import { CheckCircle2, X } from 'lucide-react';

const STORAGE_KEY = 'wecare_hospitals_appointments_v1';

function HospitalApp() {
  const { user, userProfile, isAdmin, openAuthModal } = useAuth();

  // Navigation State
  const [activePage, setActivePage] = useState<ActivePage>('home');

  // Guard admin page: strictly restricted to admin email after sign in
  useEffect(() => {
    if (activePage === 'admin' && (!user || !isAdmin)) {
      setActivePage('home');
    }
  }, [activePage, user, isAdmin]);

  // Appointments State - strictly initialized as empty; populated ONLY for the authenticated user
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Load and subscribe strictly to the signed-in user's appointments
  useEffect(() => {
    if (!user) {
      setAppointments([]);
      return;
    }

    // User-specific offline cache
    const userCacheKey = `${STORAGE_KEY}_${user.uid}`;
    try {
      const saved = localStorage.getItem(userCacheKey);
      if (saved) {
        setAppointments(JSON.parse(saved));
      } else {
        setAppointments([]);
      }
    } catch (e) {
      setAppointments([]);
    }

    // Live subscription to Firestore for this user's bookings only
    const unsubscribe = subscribeUserBookings(
      user.uid,
      (cloudBookings) => {
        setAppointments(cloudBookings);
        try {
          localStorage.setItem(userCacheKey, JSON.stringify(cloudBookings));
        } catch (e) {
          console.error('Failed to cache user bookings', e);
        }
      },
      (error) => {
        console.warn('Real-time sync notice:', error.message);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  // Save appointments to user cache whenever changed while authenticated
  useEffect(() => {
    if (!user) return;
    try {
      localStorage.setItem(`${STORAGE_KEY}_${user.uid}`, JSON.stringify(appointments));
    } catch (e) {
      console.error('Failed to save appointments to localStorage', e);
    }
  }, [appointments, user]);

  // Modal States
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [prefilledDoctor, setPrefilledDoctor] = useState<Doctor | null>(null);
  const [prefilledDepartment, setPrefilledDepartment] = useState<Department | null>(null);

  const [activeDoctorModal, setActiveDoctorModal] = useState<Doctor | null>(null);
  const [activeDeptModal, setActiveDeptModal] = useState<Department | null>(null);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Booking triggers: Gate with Authentication check
  const handleOpenBooking = (doctor?: Doctor, department?: Department) => {
    if (!user) {
      // Prompt sign in / sign up before booking
      openAuthModal('signin', () => {
        setPrefilledDoctor(doctor || null);
        setPrefilledDepartment(department || null);
        setBookingModalOpen(true);
      });
      return;
    }

    setPrefilledDoctor(doctor || null);
    setPrefilledDepartment(department || null);
    setBookingModalOpen(true);
  };

  const handleBookFromDoctor = (doctor: Doctor) => {
    if (!user) {
      openAuthModal('signin', () => {
        setPrefilledDoctor(doctor);
        setPrefilledDepartment(null);
        setBookingModalOpen(true);
      });
      return;
    }

    setPrefilledDoctor(doctor);
    setPrefilledDepartment(null);
    setBookingModalOpen(true);
  };

  const handleBookFromDepartment = (department: Department) => {
    const deptDocs = DOCTORS.filter((d) => d.departmentId === department.id);
    const targetDoc = deptDocs.length > 0 ? deptDocs[0] : null;

    if (!user) {
      openAuthModal('signin', () => {
        setPrefilledDepartment(department);
        setPrefilledDoctor(targetDoc);
        setBookingModalOpen(true);
      });
      return;
    }

    setPrefilledDepartment(department);
    setPrefilledDoctor(targetDoc);
    setBookingModalOpen(true);
  };

  // Appointment Actions
  const handleAppointmentBooked = (newAppointment: Appointment) => {
    setAppointments((prev) => [newAppointment, ...prev.filter((a) => a.id !== newAppointment.id)]);
    showToast(`Appointment ${newAppointment.id} confirmed with ${newAppointment.doctorName}! Saved to your account.`);
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === appointmentId ? { ...apt, status: 'Cancelled' } : apt
      )
    );

    try {
      await updateBookingStatusInDb(appointmentId, 'Cancelled');
    } catch (e) {
      console.warn('Could not update cancellation in Firestore:', e);
    }

    showToast(`Appointment ${appointmentId} has been cancelled.`);
  };

  const handleRescheduleAppointment = async (
    appointmentId: string,
    newDate: string,
    newSlot: string
  ) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === appointmentId
          ? {
              ...apt,
              appointmentDate: newDate,
              appointmentTime: newSlot,
              status: 'Rescheduled',
            }
          : apt
      )
    );

    try {
      await rescheduleBookingInDb(appointmentId, newDate, newSlot);
    } catch (e) {
      console.warn('Could not update reschedule in Firestore:', e);
    }

    showToast(`Appointment ${appointmentId} rescheduled to ${newDate} at ${newSlot}.`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-teal-500 selection:text-white">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-3 duration-200">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 text-xs sm:text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
            <span>{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white p-1 rounded transition-colors"
              aria-label="Dismiss message"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Navigation - hidden when in dedicated Admin Command Portal */}
      {activePage !== 'admin' && (
        <Navbar
          activePage={activePage}
          setActivePage={setActivePage}
          onOpenBooking={() => handleOpenBooking()}
          appointmentsCount={user ? appointments.filter((a) => a.status === 'Confirmed').length : 0}
        />
      )}

      {/* Page Content Switcher */}
      <main className="flex-1">
        {activePage === 'admin' && user && isAdmin && (
          <AdminPortal
            onBackToSite={() => {
              setActivePage('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activePage === 'home' && (
          <HomeView
            doctors={DOCTORS}
            setActivePage={setActivePage}
            onOpenBooking={() => handleOpenBooking()}
            onSelectDepartment={(dept) => {
              setActiveDeptModal(dept);
            }}
            onBookDepartment={handleBookFromDepartment}
            onBookDoctor={handleBookFromDoctor}
            onViewDoctorProfile={(doc) => setActiveDoctorModal(doc)}
          />
        )}

        {activePage === 'about' && (
          <AboutView
            onOpenBooking={() => handleOpenBooking()}
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'departments' && (
          <DepartmentsView
            departments={DEPARTMENTS}
            doctors={DOCTORS}
            onSelectDepartment={(dept) => setActiveDeptModal(dept)}
            onBookDepartment={handleBookFromDepartment}
            onBookDoctor={handleBookFromDoctor}
            onViewDoctorProfile={(doc) => setActiveDoctorModal(doc)}
          />
        )}

        {activePage === 'doctors' && (
          <DoctorsView
            doctors={DOCTORS}
            departments={DEPARTMENTS}
            onBookDoctor={handleBookFromDoctor}
            onViewDoctorProfile={(doc) => setActiveDoctorModal(doc)}
          />
        )}

        {activePage === 'my-appointments' && (
          <MyAppointmentsView
            appointments={appointments}
            doctors={DOCTORS}
            onCancelAppointment={handleCancelAppointment}
            onRescheduleAppointment={handleRescheduleAppointment}
            onOpenNewBooking={() => handleOpenBooking()}
            onViewDoctorProfile={(doc) => setActiveDoctorModal(doc)}
          />
        )}
      </main>

      {/* Primary Footer - hidden when in dedicated Admin Command Portal */}
      {activePage !== 'admin' && (
        <Footer
          setActivePage={setActivePage}
          onOpenBooking={() => handleOpenBooking()}
          onSelectDepartment={(deptId) => {
            const found = DEPARTMENTS.find((d) => d.id === deptId);
            if (found) setActiveDeptModal(found);
          }}
        />
      )}

      {/* Appointment Booking Modal (Accessible anywhere in the hospital app) */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        departments={DEPARTMENTS}
        doctors={DOCTORS}
        initialDoctor={prefilledDoctor}
        initialDepartment={prefilledDepartment}
        onAppointmentBooked={handleAppointmentBooked}
        onNavigateToMyAppointments={() => setActivePage('my-appointments')}
      />

      {/* Doctor Detailed Credentials Modal */}
      <DoctorDetailModal
        doctor={activeDoctorModal}
        onClose={() => setActiveDoctorModal(null)}
        onBookAppointment={handleBookFromDoctor}
      />

      {/* Department Detailed Modal */}
      <DepartmentDetailModal
        department={activeDeptModal}
        doctors={DOCTORS}
        onClose={() => setActiveDeptModal(null)}
        onBookDoctor={handleBookFromDoctor}
        onBookDepartment={handleBookFromDepartment}
        onViewDoctorProfile={(doc) => {
          setActiveDeptModal(null);
          setActiveDoctorModal(doc);
        }}
      />

      {/* Authentication Modal */}
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HospitalApp />
    </AuthProvider>
  );
}
