import React from 'react';
import {
  Heart,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Award,
  ChevronRight,
  ExternalLink,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { HOSPITAL_INFO, DEPARTMENTS } from '../data/hospitalData';
import { ActivePage } from '../types/hospital';
import { useAuth } from '../context/AuthContext';

interface FooterProps {
  setActivePage: (page: ActivePage) => void;
  onOpenBooking: () => void;
  onSelectDepartment?: (deptId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  setActivePage,
  onOpenBooking,
  onSelectDepartment,
}) => {
  const { user, isAdmin } = useAuth();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      {/* Top emergency triage callout strip */}
      <div className="bg-gradient-to-r from-teal-900/90 via-slate-900 to-slate-900 border-b border-teal-800/40 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-base">In need of critical or immediate medical care?</h4>
              <p className="text-slate-300 text-xs sm:text-sm">
                Our Level-1 Trauma Resuscitation Bays, Stroke & Cardiac CathLabs operate 24/7/365.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              id="footer-emergency-call"
              href={`tel:${HOSPITAL_INFO.emergencyPhone}`}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Emergency: {HOSPITAL_INFO.emergencyPhone}</span>
            </a>
            <button
              id="footer-book-now"
              onClick={onOpenBooking}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Hospital Overview */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white p-0.5 border border-slate-700 flex items-center justify-center shadow-md overflow-hidden shrink-0">
                <img
                  src="/logo.png"
                  alt="WECare Hospitals Logo"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="text-2xl font-bold tracking-tight text-white">
                  WE<span className="text-teal-400">Care</span> Hospitals
                </span>
                <p className="text-xs text-slate-400">Tertiary & Quaternary Care Institute</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              WECare Hospitals is dedicated to transforming healthcare delivery through clinical expertise, state-of-the-art robotic infrastructure, and empathetic patient care across 38+ medical and surgical specialties.
            </p>

            <div className="space-y-2 pt-2 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>{HOSPITAL_INFO.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <a href={`mailto:${HOSPITAL_INFO.email}`} className="hover:text-teal-300 transition-colors">
                  {HOSPITAL_INFO.email}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-teal-400 shrink-0" />
                <span>OPD: Mon - Sat 8:00 AM - 8:00 PM | ER: 24/7/365</span>
              </div>
            </div>

            {/* Accreditation Badges */}
            <div className="pt-3 border-t border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Certified Accreditations & Quality
              </span>
              <div className="flex flex-wrap gap-2">
                {HOSPITAL_INFO.accreditations.map((acc, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700/70 text-[11px] font-medium text-teal-300"
                  >
                    <ShieldCheck className="w-3 h-3 text-teal-400" />
                    {acc.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
              Hospital Pages
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => {
                    setActivePage('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  Home Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActivePage('about');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  About WECare
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActivePage('departments');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  Clinical Departments
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActivePage('doctors');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  Find Our Doctors
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenBooking}
                  className="text-teal-400 hover:text-teal-300 font-medium transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-teal-400" />
                  Book Appointment
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActivePage('my-appointments');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  My Booked Appointments
                </button>
              </li>
              {user && isAdmin && (
                <li>
                  <button
                    onClick={() => {
                      setActivePage('admin');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-teal-400 hover:text-teal-300 font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-teal-500" />
                    Staff & Admin Portal
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Departments Directory */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
              Specialties
            </h4>
            <ul className="space-y-2 text-sm">
              {DEPARTMENTS.slice(0, 6).map((dept) => (
                <li key={dept.id}>
                  <button
                    onClick={() => {
                      if (onSelectDepartment) onSelectDepartment(dept.id);
                      setActivePage('departments');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-slate-300 hover:text-teal-300 transition-colors text-left truncate max-w-full block"
                  >
                    {dept.name.split('&')[0]}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => {
                    setActivePage('departments');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-teal-400 hover:text-teal-300 text-xs font-semibold inline-flex items-center gap-1 pt-1"
                >
                  <span>View All 38+ Specialties</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </li>
            </ul>
          </div>

          {/* Hospital Visitor & Support Info */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
              Patient Services
            </h4>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60 space-y-1">
                <span className="font-semibold text-white block">Inpatient Visiting Hours</span>
                <p className="text-slate-400">Wards: 10:00 AM - 1:00 PM & 4:30 PM - 7:30 PM</p>
                <p className="text-slate-400">ICU: 11:00 AM - 12:00 PM (1 Visitor/patient)</p>
              </div>

              <div className="space-y-1.5">
                <p className="text-slate-400">General Enquiries:</p>
                <a href={`tel:${HOSPITAL_INFO.generalInquiryPhone}`} className="text-white font-medium hover:text-teal-300 block">
                  {HOSPITAL_INFO.generalInquiryPhone}
                </a>
              </div>

              <div className="space-y-1.5">
                <p className="text-slate-400">Blood Bank & Diagnostics:</p>
                <span className="text-slate-200 font-medium block">Tower A, 1st Floor (24/7)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Safety note */}
        <div className="mt-12 pt-8 border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} WECare Hospitals. All rights reserved. Medical Center of Clinical Excellence.</p>
          <div className="flex flex-wrap gap-4 text-slate-400">
            <span className="hover:text-slate-300 cursor-pointer">Patient Rights & Responsibilities</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">Clinical Governance</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
