import React from 'react';
import {
  X,
  Star,
  Award,
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  Languages,
  CheckCircle2,
  Phone,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';
import { Doctor } from '../types/hospital';

interface DoctorDetailModalProps {
  doctor: Doctor | null;
  onClose: () => void;
  onBookAppointment: (doctor: Doctor) => void;
}

export const DoctorDetailModal: React.FC<DoctorDetailModalProps> = ({
  doctor,
  onClose,
  onBookAppointment,
}) => {
  if (!doctor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Doctor Profile & Clinical Credentials
            </span>
          </div>
          <button
            id="close-doctor-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Profile Card */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <img
              src={doctor.photo}
              alt={doctor.name}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-2 border-teal-100 shadow-md shrink-0"
            />
            <div className="text-center sm:text-left space-y-1.5 flex-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200/80">
                {doctor.departmentName}
              </span>
              <h3 className="text-xl font-bold text-slate-900">{doctor.name}</h3>
              <p className="text-xs text-slate-600 font-medium">{doctor.title}</p>
              <p className="text-xs text-slate-500">{doctor.qualifications}</p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs">
                <div className="flex items-center gap-1 text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{doctor.rating}</span>
                  <span className="text-slate-400 font-normal">({doctor.reviewCount} reviews)</span>
                </div>

                <div className="flex items-center gap-1 text-slate-600">
                  <span className="font-semibold text-slate-800">{doctor.experienceYears}+</span>
                  <span>Years Exp.</span>
                </div>

                <div className="flex items-center gap-1 text-slate-600">
                  <span className="font-semibold text-teal-700">${doctor.consultationFee}</span>
                  <span>Fee</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
            <div className="flex items-center gap-2.5 text-slate-700">
              <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Location: <strong>{doctor.roomNumber}</strong></span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700">
              <Languages className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Languages: <strong>{doctor.languages.join(', ')}</strong></span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700">
              <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Available Days: <strong>{doctor.availableDays.join(', ')}</strong></span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700">
              <Clock className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Next Available: <strong className="text-emerald-700">{doctor.nextAvailableDate}</strong></span>
            </div>
          </div>

          {/* Bio */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Professional Biography
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              {doctor.bio}
            </p>
          </div>

          {/* Specializations */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Clinical Specializations & Areas of Expertise
            </h4>
            <div className="flex flex-wrap gap-2">
              {doctor.specializations.map((spec, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-teal-50/70 text-teal-900 border border-teal-200/60"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Education & Fellowships */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-slate-600" />
              Education & Clinical Fellowships
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {doctor.education.map((edu, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0"></span>
                  <span>{edu}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Awards if any */}
          {doctor.awards && doctor.awards.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                Honors & Distinctions
              </h4>
              <ul className="space-y-1 text-xs text-slate-700">
                {doctor.awards.map((award, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                    <span>{award}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Typical Available Time Slots */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Typical Daily Consultation Slots
            </h4>
            <div className="flex flex-wrap gap-2">
              {doctor.availableTimeSlots.map((slot, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-slate-100 rounded text-xs font-medium text-slate-700 border border-slate-200"
                >
                  {slot}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            <span>Consultation Fee: </span>
            <span className="text-slate-900 font-bold text-sm">${doctor.consultationFee}</span>
            <span className="text-slate-400"> (In-person & Virtual)</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Close
            </button>
            <button
              id={`book-doctor-from-modal-${doctor.id}`}
              onClick={() => {
                onClose();
                onBookAppointment(doctor);
              }}
              className="flex-1 sm:flex-none px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm flex items-center justify-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book with Dr. {doctor.name.split(' ')[doctor.name.split(' ').length - 1]}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
