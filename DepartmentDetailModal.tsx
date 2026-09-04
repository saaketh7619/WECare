import React from 'react';
import {
  X,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Stethoscope,
  Cpu,
  Star,
  Users
} from 'lucide-react';
import { Department, Doctor } from '../types/hospital';

interface DepartmentDetailModalProps {
  department: Department | null;
  doctors: Doctor[];
  onClose: () => void;
  onBookDoctor: (doctor: Doctor) => void;
  onBookDepartment: (department: Department) => void;
  onViewDoctorProfile: (doctor: Doctor) => void;
}

export const DepartmentDetailModal: React.FC<DepartmentDetailModalProps> = ({
  department,
  doctors,
  onClose,
  onBookDoctor,
  onBookDepartment,
  onViewDoctorProfile,
}) => {
  if (!department) return null;

  const departmentDoctors = doctors.filter((doc) => doc.departmentId === department.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header with Department Banner */}
        <div className="relative h-44 sm:h-52 overflow-hidden shrink-0">
          <img
            src={department.bannerImage}
            alt={department.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent"></div>

          <button
            id="close-dept-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-teal-500/90 text-white">
                Clinical Department
              </span>
              {department.emergencyAvailable && (
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-600/90 text-white flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  24/7 Emergency Active
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{department.name}</h2>
            <p className="text-xs sm:text-sm text-teal-200">{department.tagline}</p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Floor & Location Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Location: <strong>{department.floorLocation}</strong></span>
            </div>
            <div className="flex items-center gap-3">
              {department.stats.map((stat, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-slate-600">
                  <span className="font-bold text-slate-900">{stat.value}</span>
                  <span className="text-slate-500 text-[11px]">{stat.label}</span>
                  {idx < department.stats.length - 1 && <span className="text-slate-300">|</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Department Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Clinical Overview & Capabilities
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              {department.description}
            </p>
          </div>

          {/* Head of Department */}
          <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-100 flex items-center gap-4">
            <img
              src={department.headOfDepartment.photo}
              alt={department.headOfDepartment.name}
              className="w-16 h-16 rounded-xl object-cover border border-teal-200 shrink-0"
            />
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">Head of Department</span>
              <h4 className="text-sm font-bold text-slate-900">{department.headOfDepartment.name}</h4>
              <p className="text-xs text-slate-600">{department.headOfDepartment.title}</p>
            </div>
          </div>

          {/* Key Services & Procedures */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              Key Treatments & Clinical Procedures
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {department.keyServices.map((service, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                  <span>{service}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Specialized Equipment */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-slate-600" />
              Advanced Technology & Infrastructure
            </h4>
            <div className="flex flex-wrap gap-2">
              {department.technologies.map((tech, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-slate-100 rounded text-xs font-medium text-slate-700 border border-slate-200"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Associated Department Doctors (Critical Requirement: each department has multiple doctors) */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-teal-600" />
                Department Specialists & Surgeons ({departmentDoctors.length})
              </h4>
              <span className="text-xs text-slate-400">Available for OPD & Teleconsultation</span>
            </div>

            <div className="space-y-3">
              {departmentDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-teal-300 hover:shadow-xs transition-all flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 text-center sm:text-left">
                    <img
                      src={doc.photo}
                      alt={doc.name}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <h5 className="text-sm font-bold text-slate-900">{doc.name}</h5>
                      <p className="text-xs text-slate-600">{doc.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                        <span className="text-amber-600 font-semibold flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {doc.rating}
                        </span>
                        <span>•</span>
                        <span>{doc.experienceYears} yrs experience</span>
                        <span>•</span>
                        <span className="text-teal-700 font-semibold">${doc.consultationFee}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                    <button
                      onClick={() => onViewDoctorProfile(doc)}
                      className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => onBookDoctor(doc)}
                      className="flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs flex items-center justify-center gap-1"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book Slot</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            For department inquiries, call: <strong>+1 (800) 932-2731</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Close
            </button>
            <button
              id={`book-dept-general-${department.id}`}
              onClick={() => onBookDepartment(department)}
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Appointment with {department.name.split('&')[0]}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
