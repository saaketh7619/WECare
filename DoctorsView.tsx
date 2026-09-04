import React, { useState } from 'react';
import {
  Search,
  Star,
  Calendar,
  Clock,
  MapPin,
  Languages,
  Award,
  ChevronRight,
  Filter,
  CheckCircle2,
  Stethoscope,
  GraduationCap
} from 'lucide-react';
import { Doctor, Department } from '../types/hospital';

interface DoctorsViewProps {
  doctors: Doctor[];
  departments: Department[];
  onBookDoctor: (doctor: Doctor) => void;
  onViewDoctorProfile: (doctor: Doctor) => void;
}

export const DoctorsView: React.FC<DoctorsViewProps> = ({
  doctors,
  departments,
  onBookDoctor,
  onViewDoctorProfile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'experience' | 'rating' | 'fee'>('experience');

  const filteredDoctors = doctors
    .filter((doc) => {
      const matchesDept = selectedDepartment === 'all' || doc.departmentId === selectedDepartment;
      const matchesSearch =
        searchQuery === '' ||
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.departmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specializations.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        doc.qualifications.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDept && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'experience') return b.experienceYears - a.experienceYears;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'fee') return a.consultationFee - b.consultationFee;
      return 0;
    });

  return (
    <div className="py-10 sm:py-16 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider">
            <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
            <span>Distinguished Medical Faculty</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Find Your Doctor & Specialist
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Connect with over 140 internationally trained consultants and surgeons across all specialized departments. View credentials, clinical focus, and book instant OPD or virtual consultations.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                id="search-doctors-input"
                type="text"
                placeholder="Search by doctor name, condition, procedure..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Department Dropdown */}
            <div className="sm:col-span-4">
              <select
                id="filter-doctor-department"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:border-teal-500 text-slate-700"
              >
                <option value="all">All Clinical Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="sm:col-span-2">
              <select
                id="sort-doctor-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:border-teal-500 text-slate-700"
              >
                <option value="experience">Sort: Experience</option>
                <option value="rating">Sort: Patient Rating</option>
                <option value="fee">Sort: Lowest Fee</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Showing <strong>{filteredDoctors.length}</strong> of {doctors.length} Doctors
            </span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Same-day and next-day appointment slots available</span>
            </div>
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              id={`doctor-card-${doc.id}`}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-teal-300 transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5 sm:p-6 space-y-4">
                {/* Doctor Header (Photo + Basic Details) */}
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={doc.photo}
                      alt={doc.name}
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-teal-100 shadow-2xs group-hover:scale-102 transition-transform"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs">
                      <span className="flex items-center justify-center w-5 h-5 bg-teal-600 rounded-full text-white">
                        <CheckCircle2 className="w-3 h-3" />
                      </span>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100 truncate max-w-full">
                      {doc.departmentName.split('&')[0]}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 leading-tight truncate">
                      {doc.name}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-1">{doc.title}</p>
                    <p className="text-[11px] text-slate-400 truncate">{doc.qualifications}</p>
                  </div>
                </div>

                {/* Rating, Experience, Fee metrics */}
                <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 rounded-xl border border-slate-100 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Rating</span>
                    <span className="font-bold text-amber-600 flex items-center justify-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {doc.rating}
                    </span>
                  </div>
                  <div className="border-x border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Experience</span>
                    <span className="font-bold text-slate-800">{doc.experienceYears}+ Yrs</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Consult Fee</span>
                    <span className="font-bold text-teal-700">${doc.consultationFee}</span>
                  </div>
                </div>

                {/* Specializations Pills */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Clinical Focus:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {doc.specializations.slice(0, 2).map((spec, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 truncate max-w-full"
                      >
                        {spec}
                      </span>
                    ))}
                    {doc.specializations.length > 2 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-500 bg-slate-100">
                        +{doc.specializations.length - 2} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Next Available Slot & Location */}
                <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>Next Slot: <strong className="text-emerald-700">{doc.nextAvailableDate}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{doc.roomNumber}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  id={`view-profile-btn-${doc.id}`}
                  onClick={() => onViewDoctorProfile(doc)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  View Profile
                </button>
                <button
                  id={`book-doctor-card-btn-${doc.id}`}
                  onClick={() => onBookDoctor(doc)}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-1"
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
  );
};
