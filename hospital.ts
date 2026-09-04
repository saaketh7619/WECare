export interface Doctor {
  id: string;
  name: string;
  title: string;
  departmentId: string;
  departmentName: string;
  photo: string;
  qualifications: string;
  experienceYears: number;
  consultationFee: number;
  rating: number;
  reviewCount: number;
  languages: string[];
  availableDays: string[];
  availableTimeSlots: string[];
  bio: string;
  specializations: string[];
  education: string[];
  roomNumber: string;
  awards?: string[];
  nextAvailableDate: string;
}

export interface Department {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  bannerImage: string;
  headOfDepartment: {
    name: string;
    title: string;
    photo: string;
  };
  keyServices: string[];
  technologies: string[];
  emergencyAvailable: boolean;
  floorLocation: string;
  stats: {
    label: string;
    value: string;
  }[];
}

export interface Appointment {
  id: string; // e.g. WEC-2026-9814
  userId?: string; // Firebase user UID of the patient who booked
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  patientId?: string;
  departmentId: string;
  departmentName: string;
  doctorId: string;
  doctorName: string;
  doctorPhoto: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // e.g. "10:30 AM"
  consultationType: 'in-person' | 'teleconsult';
  chiefComplaint: string;
  status: 'Confirmed' | 'Completed' | 'Cancelled' | 'Rescheduled';
  createdAt: string;
  roomNumber: string;
  consultationFee: number;
  notes?: string;
}

export interface Testimonial {
  id: string;
  patientName: string;
  patientLocation: string;
  treatment: string;
  doctorName: string;
  department: string;
  story: string;
  rating: number;
  date: string;
  avatar: string;
}

export interface HealthCheckupPackage {
  id: string;
  name: string;
  targetAudience: string;
  testCount: number;
  price: number;
  discountedPrice: number;
  recommendedFrequency: string;
  keyTests: string[];
  popular?: boolean;
}

export type ActivePage = 'home' | 'about' | 'departments' | 'doctors' | 'book' | 'my-appointments' | 'admin';
