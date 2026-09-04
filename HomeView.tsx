import React, { useState } from 'react';
import {
  Heart,
  Calendar,
  Clock,
  ShieldCheck,
  Stethoscope,
  Users,
  Award,
  ChevronRight,
  Phone,
  AlertCircle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Star,
  Activity,
  BedDouble,
  HeartPulse,
  Brain,
  Bone,
  Baby,
  Building2
} from 'lucide-react';
import { HOSPITAL_INFO, DEPARTMENTS, TESTIMONIALS, HEALTH_PACKAGES } from '../data/hospitalData';
import { Department, Doctor, ActivePage } from '../types/hospital';

interface HomeViewProps {
  doctors: Doctor[];
  setActivePage: (page: ActivePage) => void;
  onOpenBooking: () => void;
  onSelectDepartment: (dept: Department) => void;
  onBookDepartment: (dept: Department) => void;
  onBookDoctor: (doc: Doctor) => void;
  onViewDoctorProfile: (doc: Doctor) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  doctors,
  setActivePage,
  onOpenBooking,
  onSelectDepartment,
  onBookDepartment,
  onBookDoctor,
  onViewDoctorProfile,
}) => {
  const getDepartmentIcon = (iconName: string) => {
    switch (iconName) {
      case 'Heart':
        return <Heart className="w-5 h-5 text-rose-500" />;
      case 'Brain':
        return <Brain className="w-5 h-5 text-indigo-500" />;
      case 'Bone':
        return <Bone className="w-5 h-5 text-amber-500" />;
      case 'Baby':
        return <Baby className="w-5 h-5 text-pink-500" />;
      default:
        return <Activity className="w-5 h-5 text-teal-600" />;
    }
  };

  // Top 4 featured doctors from different departments
  const featuredDoctors = doctors.slice(0, 4);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-50/90 via-sky-50/60 to-emerald-50/50 text-slate-900 pt-10 pb-20 sm:pt-16 sm:pb-28 border-b border-teal-100/70">
        {/* Soft luminous ambient glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-cyan-200/25 rounded-full blur-3xl pointer-events-none" />
        {/* Subtle dot grid pattern */}
        <div className="absolute inset-0 opacity-35 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [background-size:24px_24px]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100/90 border border-teal-200 text-teal-800 text-xs font-bold tracking-wide shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>JCI & NABH Accredited Quaternary Center</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight sm:leading-none text-slate-900">
                Compassionate Care. <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-teal-700 to-cyan-600">
                  Advanced Medicine.
                </span>
              </h1>

              <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                At WECare Hospitals, world-leading super specialists, cutting-edge surgical robotics, and 24/7 Level-1 emergency trauma care come together to heal what matters most.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  id="hero-book-appointment-btn"
                  onClick={onOpenBooking}
                  className="px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center gap-2 active:scale-98"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book an Appointment</span>
                </button>

                <button
                  id="hero-find-doctors-btn"
                  onClick={() => {
                    setActivePage('doctors');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold rounded-xl border border-slate-300 shadow-xs transition-all flex items-center gap-2"
                >
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  <span>Find a Doctor</span>
                </button>

                <a
                  id="hero-emergency-hotline-btn"
                  href={`tel:${HOSPITAL_INFO.emergencyPhone}`}
                  className="px-4 py-3.5 bg-rose-50 hover:bg-rose-100/80 text-rose-700 border border-rose-200/80 text-sm font-semibold rounded-xl shadow-xs transition-all flex items-center gap-2"
                >
                  <Phone className="w-4 h-4 text-rose-600" />
                  <span>24/7 ER: {HOSPITAL_INFO.emergencyPhone}</span>
                </a>
              </div>
            </div>

            {/* Right Card / Clinical Trust Pod */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white/95 backdrop-blur-md rounded-3xl border border-teal-100/90 p-6 shadow-xl shadow-teal-950/5 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-slate-900 font-bold text-base">WECare Clinical Pulse</h3>
                    <p className="text-xs text-slate-500">Real-time tertiary campus overview</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>All Units Active</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-50/90 hover:bg-teal-50/30 rounded-xl border border-slate-200/70 flex items-center justify-between transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                        <HeartPulse className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-slate-900 font-semibold block">CathLab & Emergency Angioplasty</span>
                        <span className="text-slate-500">Door-to-balloon record under 45m</span>
                      </div>
                    </div>
                    <span className="text-teal-700 font-mono font-bold">24/7 Open</span>
                  </div>

                  <div className="p-3 bg-slate-50/90 hover:bg-teal-50/30 rounded-xl border border-slate-200/70 flex items-center justify-between transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <Brain className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-slate-900 font-semibold block">Stroke & Neuro Resuscitation</span>
                        <span className="text-slate-500">Immediate tPA & Thrombectomy team</span>
                      </div>
                    </div>
                    <span className="text-teal-700 font-mono font-bold">Standby</span>
                  </div>

                  <div className="p-3 bg-slate-50/90 hover:bg-teal-50/30 rounded-xl border border-slate-200/70 flex items-center justify-between transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                        <BedDouble className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-slate-900 font-semibold block">OPD Specialist Clinics</span>
                        <span className="text-slate-500">Mon - Sat: 8:00 AM - 8:00 PM</span>
                      </div>
                    </div>
                    <span className="text-teal-700 font-mono font-bold">Slots Open</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span>Need help choosing a doctor?</span>
                  <button
                    onClick={onOpenBooking}
                    className="text-teal-700 hover:text-teal-800 font-semibold inline-flex items-center gap-1"
                  >
                    <span>Instant Booking</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-teal-600">650+</span>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Tertiary Care Beds</p>
          </div>
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-teal-600">140+</span>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Super Specialists</p>
          </div>
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-teal-600">38+</span>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Clinical Departments</p>
          </div>
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-teal-600">99.4%</span>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Patient Satisfaction</p>
          </div>
        </div>
      </section>

      {/* 3. CLINICAL DEPARTMENTS OVERVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-700">
              <Activity className="w-4 h-4" />
              <span>Specialized Medicine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Centers of Clinical Excellence
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Each department is equipped with multi-disciplinary doctor teams and modern diagnostic technologies.
            </p>
          </div>

          <button
            id="home-view-all-depts"
            onClick={() => {
              setActivePage('departments');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-xs sm:text-sm font-semibold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1.5 group shrink-0"
          >
            <span>View All 38+ Specialties</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Department Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {DEPARTMENTS.slice(0, 8).map((dept) => {
            const deptDocs = doctors.filter((doc) => doc.departmentId === dept.id);

            return (
              <div
                key={dept.id}
                id={`home-dept-card-${dept.id}`}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-teal-300 transition-all p-5 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                      {getDepartmentIcon(dept.icon)}
                    </div>
                    <span className="text-[11px] font-semibold text-teal-700 bg-teal-50/80 px-2.5 py-0.5 rounded-full border border-teal-200/60">
                      {deptDocs.length} Specialists
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                      {dept.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {dept.description}
                    </p>
                  </div>

                  <div className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                    <span className="font-semibold text-slate-700 block">Highlights:</span>
                    <p className="text-slate-500 truncate">• {dept.keyServices[0]}</p>
                    <p className="text-slate-500 truncate">• {dept.keyServices[1]}</p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <button
                    onClick={() => onSelectDepartment(dept)}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
                  >
                    <span>Overview</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => onBookDepartment(dept)}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
                  >
                    Book OPD
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. WHY CHOOSE WECARE HOSPITALS */}
      <section className="bg-white py-16 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-700">
              <ShieldCheck className="w-4 h-4" />
              <span>World-Class Clinical Standards</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Why Patients Entrust Their Health to WECare
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Setting international benchmarks in surgical safety, zero-infection ICUs, and compassionate bedside care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-11 h-11 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Door-to-Balloon Under 45m</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Emergency cardiac cath labs operate round the clock, opening blocked arteries in half the global standard time.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Robotic Precision Surgery</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Equipped with Mako robotic arm joint replacement and da Vinci Xi robotic systems for microscopic surgical precision.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Level-1 Trauma & Rooftop Helipad</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rapid aeromedical evacuation and 24/7 polytrauma resuscitation suites with instant intra-ER CT scanning.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Zero-Infection ICU Protocols</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                HEPA filtered laminar airflow suites with dedicated 1:1 patient-to-nurse critical care coverage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURED DOCTORS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-700">
              <Users className="w-4 h-4" />
              <span>Expert Medical Team</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Featured Consultants & Surgeons
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Book consultations with our department chairs and senior clinical faculty.
            </p>
          </div>

          <button
            id="home-view-all-doctors"
            onClick={() => {
              setActivePage('doctors');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-xs sm:text-sm font-semibold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1.5 group shrink-0"
          >
            <span>View All Doctors ({doctors.length})</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-teal-300 transition-all p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={doc.photo}
                    alt={doc.name}
                    className="w-16 h-16 rounded-xl object-cover border border-teal-100 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded truncate max-w-full">
                      {doc.departmentName.split('&')[0]}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 truncate mt-0.5">{doc.name}</h4>
                    <p className="text-[11px] text-slate-500 truncate">{doc.qualifications.split(',')[0]}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1 text-amber-600 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {doc.rating}
                  </span>
                  <span>{doc.experienceYears}+ Yrs Exp.</span>
                  <span className="text-teal-700 font-bold">${doc.consultationFee}</span>
                </div>

                <p className="text-[11px] text-slate-600 line-clamp-2">
                  {doc.bio}
                </p>

                <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Next: {doc.nextAvailableDate}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2 border-t border-slate-100">
                <button
                  onClick={() => onViewDoctorProfile(doc)}
                  className="flex-1 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Profile
                </button>
                <button
                  onClick={() => onBookDoctor(doc)}
                  className="flex-1 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-1"
                >
                  <Calendar className="w-3 h-3" />
                  <span>Book</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. PREVENTIVE HEALTH CHECKUP PACKAGES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-700">
            <Sparkles className="w-4 h-4" />
            <span>Preventive Wellness</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Master Health Checkup Packages
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Early screening saves lives. Comprehensive laboratory and imaging packages reviewed by senior physicians.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {HEALTH_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`rounded-2xl p-6 flex flex-col justify-between space-y-5 transition-all ${
                pkg.popular
                  ? 'bg-gradient-to-b from-teal-50 to-white border-2 border-teal-500 shadow-md relative'
                  : 'bg-white border border-slate-200 shadow-xs'
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-teal-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-xs">
                  Most Popular
                </span>
              )}

              <div className="space-y-3">
                <div>
                  <h4 className="text-base font-bold text-slate-900">{pkg.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{pkg.targetAudience}</p>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-900">${pkg.discountedPrice}</span>
                  <span className="text-xs text-slate-400 line-through">${pkg.price}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    {pkg.testCount} Tests Included
                  </span>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <span className="font-bold text-slate-700 block">Package Includes:</span>
                  <ul className="space-y-1.5 text-slate-600">
                    {pkg.keyTests.slice(0, 4).map((test, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                        <span>{test}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={onOpenBooking}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book Checkup</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 7. PATIENT TESTIMONIALS */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-400">
              <Heart className="w-4 h-4" />
              <span>Real Patient Journeys</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">
              Restoring Health, Rebuilding Lives
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Hear from our patients who experienced compassionate, life-changing care at WECare Hospitals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.id}
                className="bg-slate-800/80 rounded-2xl border border-slate-700 p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(t.rating)].map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "{t.story}"
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-700 flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.patientName}
                    className="w-10 h-10 rounded-full object-cover border border-teal-500/40 shrink-0"
                  />
                  <div className="min-w-0 text-xs">
                    <p className="font-bold text-white truncate">{t.patientName}</p>
                    <p className="text-[11px] text-teal-400 truncate">{t.treatment}</p>
                    <p className="text-[10px] text-slate-400">{t.doctorName}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. CAMPUS LOCATION & VISITING HOURS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Visit WECare Hospital Campus
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
              742 Healthcare Boulevard, Medical District
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Located conveniently off Interstate 90 with dedicated multi-level parking, valet service for patients with mobility impairments, and round-the-clock emergency vehicle ramp access.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block">Outpatient (OPD) Clinics</span>
                <p className="text-slate-600 mt-0.5">Monday - Saturday: 8:00 AM - 8:00 PM</p>
                <p className="text-slate-400 text-[11px]">Sunday: Emergency & Teleconsult only</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block">Emergency & Trauma Unit</span>
                <p className="text-rose-600 font-semibold mt-0.5">Open 24/7/365</p>
                <p className="text-slate-400 text-[11px]">Direct Ambulance Line: 1800-932-273</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-gradient-to-br from-teal-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-4 text-center">
            <h4 className="text-lg font-bold">Ready to Consult a Specialist?</h4>
            <p className="text-xs text-slate-300">
              Book an appointment with any of our 140+ board-certified doctors in under 2 minutes.
            </p>
            <button
              onClick={onOpenBooking}
              className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment Now</span>
            </button>
            <p className="text-[11px] text-slate-400">
              Zero booking fees • Instant SMS/Email confirmation pass
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
