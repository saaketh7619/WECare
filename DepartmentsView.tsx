import React, { useState } from 'react';
import {
  Heart,
  Brain,
  Bone,
  ShieldAlert,
  Baby,
  HeartHandshake,
  Ambulance,
  Sparkles,
  Search,
  MapPin,
  Clock,
  CheckCircle2,
  Calendar,
  Users,
  ChevronRight,
  Cpu,
  ArrowUpRight,
  ShieldCheck,
  Star
} from 'lucide-react';
import { Department, Doctor } from '../types/hospital';

interface DepartmentsViewProps {
  departments: Department[];
  doctors: Doctor[];
  selectedDepartmentId?: string;
  onSelectDepartment: (dept: Department) => void;
  onBookDepartment: (dept: Department) => void;
  onBookDoctor: (doc: Doctor) => void;
  onViewDoctorProfile: (doc: Doctor) => void;
}

export const DepartmentsView: React.FC<DepartmentsViewProps> = ({
  departments,
  doctors,
  selectedDepartmentId,
  onSelectDepartment,
  onBookDepartment,
  onBookDoctor,
  onViewDoctorProfile,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>(selectedDepartmentId || 'all');
  const [searchQuery, setSearchQuery] = useState('');

  const filterOptions = [
    { id: 'all', label: 'All Specialties' },
    ...departments.map((d) => ({ id: d.id, label: d.name.split('&')[0].trim() })),
  ];

  const filteredDepartments = departments.filter((dept) => {
    const matchesFilter = activeFilter === 'all' || dept.id === activeFilter;
    const matchesSearch =
      searchQuery === '' ||
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.keyServices.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getDepartmentIcon = (iconName: string) => {
    switch (iconName) {
      case 'Heart':
        return <Heart className="w-5 h-5 text-rose-500" />;
      case 'Brain':
        return <Brain className="w-5 h-5 text-indigo-500" />;
      case 'Bone':
        return <Bone className="w-5 h-5 text-amber-500" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-5 h-5 text-purple-500" />;
      case 'Baby':
        return <Baby className="w-5 h-5 text-pink-500" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-5 h-5 text-emerald-500" />;
      case 'Ambulance':
        return <Ambulance className="w-5 h-5 text-red-500" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-teal-500" />;
      default:
        return <Heart className="w-5 h-5 text-teal-600" />;
    }
  };

  return (
    <div className="py-10 sm:py-16 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Centers of Medical Excellence</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Clinical Departments & Specialties
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            At WECare Hospitals, each clinical institute unites internationally certified department leaders, advanced surgical robotics, and dedicated multi-doctor specialty teams.
          </p>
        </div>

        {/* Filter Bar & Search */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                id="search-departments-input"
                type="text"
                placeholder="Search specialty, treatment, procedure..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 shadow-2xs"
              />
            </div>

            <span className="text-xs text-slate-500 font-medium self-end sm:self-auto">
              Showing {filteredDepartments.length} of {departments.length} Specialty Departments
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {filterOptions.map((opt) => {
              const isSelected = activeFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  id={`filter-dept-${opt.id}`}
                  onClick={() => setActiveFilter(opt.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Departments Grid / List */}
        <div className="space-y-8">
          {filteredDepartments.map((dept) => {
            const deptDocs = doctors.filter((doc) => doc.departmentId === dept.id);

            return (
              <div
                key={dept.id}
                id={`dept-card-${dept.id}`}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all overflow-hidden"
              >
                {/* Department Header Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12">
                  {/* Banner Image */}
                  <div className="lg:col-span-4 relative h-52 lg:h-auto overflow-hidden">
                    <img
                      src={dept.bannerImage}
                      alt={dept.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-950/80 via-slate-950/30 to-transparent"></div>

                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs">
                        {getDepartmentIcon(dept.icon)}
                      </div>
                      {dept.emergencyAvailable && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white shadow-xs">
                          24/7 ER
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white text-xs">
                      <p className="flex items-center gap-1.5 text-slate-200">
                        <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span>{dept.floorLocation}</span>
                      </p>
                    </div>
                  </div>

                  {/* Department Main Info */}
                  <div className="lg:col-span-8 p-6 lg:p-7 flex flex-col justify-between space-y-6">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                          {dept.name}
                        </h2>
                        <button
                          onClick={() => onSelectDepartment(dept)}
                          className="text-xs font-semibold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1 group"
                        >
                          <span>Department Details</span>
                          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                      </div>

                      <p className="text-xs font-semibold text-teal-700 mb-3">
                        {dept.tagline}
                      </p>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {dept.description}
                      </p>

                      {/* Procedures & Technologies */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 pt-5 border-t border-slate-100 text-xs">
                        <div>
                          <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block mb-2">
                            Key Clinical Procedures:
                          </span>
                          <ul className="space-y-1.5 text-slate-600">
                            {dept.keyServices.slice(0, 3).map((serv, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                                <span>{serv}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block mb-2">
                            Advanced Infrastructure:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {dept.technologies.slice(0, 3).map((tech, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium border border-slate-200"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Department Doctors Showcase - Critical Requirement: Each department has multiple doctors */}
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-teal-600" />
                          Consulting Specialists ({deptDocs.length} Doctors Available)
                        </span>
                        <button
                          onClick={() => onBookDepartment(dept)}
                          className="text-xs font-semibold text-teal-600 hover:text-teal-800"
                        >
                          Book with this Department →
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {deptDocs.map((doc) => (
                          <div
                            key={doc.id}
                            className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-teal-300 transition-all flex items-start gap-2.5"
                          >
                            <img
                              src={doc.photo}
                              alt={doc.name}
                              className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0 flex-1 text-xs">
                              <h4 className="font-bold text-slate-900 truncate">{doc.name}</h4>
                              <p className="text-[11px] text-slate-500 truncate">{doc.qualifications.split(',')[0]}</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-[11px] font-semibold text-teal-700">
                                  ${doc.consultationFee}
                                </span>
                                <button
                                  id={`book-dept-doc-${doc.id}`}
                                  onClick={() => onBookDoctor(doc)}
                                  className="text-[10px] font-bold text-white bg-teal-600 hover:bg-teal-700 px-2 py-0.5 rounded shadow-2xs"
                                >
                                  Book Slot
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
