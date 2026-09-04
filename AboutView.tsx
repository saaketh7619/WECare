import React from 'react';
import {
  Heart,
  ShieldCheck,
  Award,
  Users,
  Building2,
  Cpu,
  Clock,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Stethoscope,
  Microscope,
  Sparkles,
  BedDouble,
  GraduationCap
} from 'lucide-react';
import { HOSPITAL_INFO } from '../data/hospitalData';
import { ActivePage } from '../types/hospital';

interface AboutViewProps {
  onOpenBooking: () => void;
  setActivePage: (page: ActivePage) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({
  onOpenBooking,
  setActivePage,
}) => {
  const leadership = [
    {
      name: 'Dr. Arthur Sterling, MD, FACS',
      role: 'Chief Executive Officer & Medical Director',
      photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=500&q=80',
      bio: 'Former Professor of Surgery at Johns Hopkins with over 28 years championing quaternary clinical standards and compassionate healthcare governance.',
    },
    {
      name: 'Dr. Vivienne Marchese, MD, FAAN',
      role: 'Chief Medical Officer & Director of Academic Research',
      photo: 'https://images.unsplash.com/photo-1594824813501-4475e52331ff?auto=format&fit=crop&w=500&q=80',
      bio: 'Pioneering neurologist specializing in neuro-genetics and clinical trial design, leading WECare’s continuous research initiatives.',
    },
    {
      name: 'Margaret Vance, RN, MSN',
      role: 'Chief Nursing Officer & Patient Experience Director',
      photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=500&q=80',
      bio: 'Leading 850+ specialized nurses with a deep commitment to bedside compassion, patient dignity, and zero-infection safety protocols.',
    },
  ];

  const milestones = [
    { year: '2004', event: 'Founded as a 120-bed specialized cardiac and surgical care center.' },
    { year: '2011', event: 'Awarded first Joint Commission International (JCI) accreditation.' },
    { year: '2016', event: 'Inauguration of the Comprehensive Cancer Institute and Level-1 Trauma Center.' },
    { year: '2020', event: 'Commissioned Mako and da Vinci robotic surgical suites, surpassing 5,000 robotic procedures.' },
    { year: '2024', event: 'Expanded to 650+ beds with advanced Hybrid CathLabs and Level III-B Neonatal ICU.' },
  ];

  const coreValues = [
    {
      title: 'Compassion First',
      desc: 'Treating every patient and family with warmth, empathy, deep dignity, and open communication.',
      icon: <Heart className="w-5 h-5 text-rose-500" />,
    },
    {
      title: 'Clinical Excellence',
      desc: 'Adhering to rigorous evidence-based protocols, continuous peer review, and zero-compromise outcomes.',
      icon: <ShieldCheck className="w-5 h-5 text-teal-600" />,
    },
    {
      title: 'Surgical Innovation',
      desc: 'Investing in cutting-edge robotics, 3T intraoperative imaging, and precision genetic therapies.',
      icon: <Cpu className="w-5 h-5 text-indigo-500" />,
    },
    {
      title: 'Transparent Integrity',
      desc: 'Clear communication, transparent billing, and absolute ethical practice in all clinical recommendations.',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    },
  ];

  return (
    <div className="py-10 sm:py-16 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white p-8 sm:p-14 shadow-xl">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-teal-400" />
              <span>Over Two Decades of Healing</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              About WECare Hospitals
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Founded on the belief that world-class clinical expertise must always be paired with genuine human warmth, WECare Hospitals has grown into one of the nation’s premier tertiary healthcare institutions, delivering life-saving care across 38+ medical disciplines.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenBooking}
                className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Book a Consultation</span>
              </button>
              <button
                onClick={() => {
                  setActivePage('departments');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold rounded-xl backdrop-blur-xs transition-colors"
              >
                <span>Explore Departments</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-teal-600">650+</span>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Advanced Inpatient Beds</p>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-teal-600">140+</span>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Senior Consultants</p>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-teal-600">18,500+</span>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Surgeries Annually</p>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-teal-600">99.4%</span>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient Satisfaction</p>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Our Mission</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              To deliver compassionate, comprehensive, and evidence-driven medical care of the highest international caliber. We exist to preserve life, restore vitality, and accompany every patient and family through their healing journey with uncompromised integrity.
            </p>
          </div>

          <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
              <Microscope className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Our Vision</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              To remain an internationally recognized destination for quaternary medicine, recognized for breakthroughs in robotic surgery, genetic oncology, maternal-fetal health, and continuous medical education.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Guiding Principles & Clinical Ethics
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              The fundamental tenets governing every clinical recommendation and patient interaction at WECare Hospitals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((val, idx) => (
              <div
                key={idx}
                className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                  {val.icon}
                </div>
                <h4 className="text-base font-bold text-slate-900">{val.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Leadership Team */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Hospital Leadership & Medical Governance
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Our executive board comprises veteran clinicians with decades of international hospital administration experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {leadership.map((leader, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-6 text-center"
              >
                <img
                  src={leader.photo}
                  alt={leader.name}
                  className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-teal-50 shadow-xs"
                />
                <div>
                  <h4 className="text-base font-bold text-slate-900">{leader.name}</h4>
                  <p className="text-xs font-semibold text-teal-700 mt-0.5">{leader.role}</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{leader.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Historical Milestones */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-xs space-y-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-600" />
            <span>Two Decades of Clinical Milestones</span>
          </h3>

          <div className="space-y-4">
            {milestones.map((m, idx) => (
              <div key={idx} className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                <span className="font-mono font-bold text-sm text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200 shrink-0">
                  {m.year}
                </span>
                <p className="text-xs sm:text-sm text-slate-700 pt-0.5">{m.event}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Accreditations & Quality Badges */}
        <div className="p-8 bg-slate-900 rounded-3xl text-white space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-2xl font-bold">Gold-Standard Accreditations</h3>
            <p className="text-xs sm:text-sm text-slate-400">
              WECare Hospitals is audited annually by the highest domestic and international healthcare accreditation authorities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HOSPITAL_INFO.accreditations.map((acc, idx) => (
              <div key={idx} className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
                <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{acc.name}</span>
                </div>
                <p className="text-xs text-slate-400">{acc.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
