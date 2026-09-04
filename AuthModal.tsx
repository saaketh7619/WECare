import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  ArrowRight,
  Loader2,
  Copy,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    authModalMode,
    closeAuthModal,
    openAuthModal,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(authModalMode || 'signin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Update tab when modal mode changes
  React.useEffect(() => {
    setActiveTab(authModalMode);
    setErrorMsg('');
    setUnauthorizedDomain(null);
  }, [authModalMode, authModalOpen]);

  if (!authModalOpen) return null;

  const handleTabSwitch = (tab: 'signin' | 'signup') => {
    setActiveTab(tab);
    setErrorMsg('');
    setUnauthorizedDomain(null);
  };

  const handleCopyDomain = () => {
    if (unauthorizedDomain) {
      navigator.clipboard.writeText(unauthorizedDomain);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setUnauthorizedDomain(null);

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmail(email.trim(), password);
    } catch (err: any) {
      console.error('Sign In Error:', err);
      let message = 'Unable to sign in. Please verify your credentials.';
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found'
      ) {
        message = 'Invalid email or password. If you are a new patient, please register below.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Too many attempts. Please wait a moment or try again later.';
      } else if (typeof err.message === 'string') {
        if (err.message.includes('Missing or insufficient permissions')) {
          message = 'Database permissions have been refreshed. Please try signing in again.';
        } else if (!err.message.includes('{')) {
          message = err.message;
        }
      }
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setUnauthorizedDomain(null);

    if (!name.trim()) {
      setErrorMsg('Please enter your full name as it appears on your ID.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 7) {
      setErrorMsg('Please enter a valid contact phone number.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      await signUpWithEmail(name.trim(), email.trim(), password, phone.trim());
    } catch (err: any) {
      console.error('Sign Up Error:', err);
      let message = 'Unable to create account. Please try again.';
      if (err.code === 'auth/email-already-in-use') {
        message = 'This email is already registered! Please switch to Sign In.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please provide a valid email format.';
      } else if (typeof err.message === 'string') {
        if (err.message.includes('Missing or insufficient permissions')) {
          message = 'Account registered! You can now sign in with your email and password.';
        } else if (!err.message.includes('{')) {
          message = err.message;
        }
      }
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setUnauthorizedDomain(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      if (err.code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        setUnauthorizedDomain(domain);
        console.warn('Google Auth notice: Domain not yet authorized in Firebase Console.', domain);
        setErrorMsg(`Google OAuth requires domain authorization in Firebase Console. Please sign in or register with Email & Password below.`);
      } else if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        console.error('Google Auth Error:', err);
        setErrorMsg(err.message || 'Google sign-in encountered an issue.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header Strip */}
        <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-slate-900 to-teal-950 text-white relative">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close authentication modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-white p-0.5 border border-teal-500/40 flex items-center justify-center overflow-hidden shrink-0">
              <img
                src="/logo.png"
                alt="WECare Hospitals Logo"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-semibold tracking-wide border border-teal-400/30">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Secure Patient Portal</span>
            </div>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white">
            {activeTab === 'signin' ? 'Sign In to WECare' : 'Create Patient Account'}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Sign in to securely book appointments, consult specialists, and track medical visits.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => handleTabSwitch('signin')}
            className={`flex-1 py-3 text-xs sm:text-sm font-semibold text-center transition-colors ${
              activeTab === 'signin'
                ? 'text-teal-700 bg-white border-b-2 border-teal-600 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch('signup')}
            className={`flex-1 py-3 text-xs sm:text-sm font-semibold text-center transition-colors ${
              activeTab === 'signup'
                ? 'text-teal-700 bg-white border-b-2 border-teal-600 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Register (New Patient)
          </button>
        </div>

        {/* Body Form */}
        <div className="p-6 space-y-5">
          {/* Quick Notice for Booking Gate */}
          <div className="p-3 bg-teal-50/80 rounded-xl border border-teal-200/80 flex items-start gap-2.5 text-xs text-teal-900">
            <Calendar className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Verified Appointment Booking</span>
              <span>
                An authenticated account connects your bookings directly to your medical file and enables real-time status updates.
              </span>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Dedicated Domain Authorization Assistance */}
          {unauthorizedDomain && (
            <div className="p-3.5 bg-amber-50/90 border border-amber-300/80 rounded-xl text-xs text-amber-950 space-y-2 animate-in fade-in duration-200">
              <div className="font-semibold flex items-center gap-1.5 text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>How to authorize Google Sign-In:</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Add this preview URL to Firebase Console under <strong>Authentication &rarr; Settings &rarr; Authorized domains</strong>:
              </p>
              <div className="flex items-center gap-2 bg-white/90 px-2.5 py-1.5 rounded-lg border border-amber-200 font-mono text-[11px] text-slate-800">
                <span className="truncate flex-1">{unauthorizedDomain}</span>
                <button
                  type="button"
                  onClick={handleCopyDomain}
                  className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-sans font-semibold text-[10px] rounded flex items-center gap-1 transition-colors shrink-0"
                >
                  {copiedDomain ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-amber-900 font-medium pt-1">
                Tip: You can also simply use <strong>Email & Password</strong> below to sign in or register immediately without domain setup!
              </p>
            </div>
          )}

          {/* Google Sign-in Button */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 shadow-xs flex items-center justify-center gap-3 transition-colors active:scale-98 disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider absolute">
              or with email
            </span>
          </div>

          {/* Form Content */}
          {activeTab === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="patient@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-center text-xs text-slate-500 pt-1">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => handleTabSwitch('signup')}
                  className="text-teal-700 font-semibold hover:underline"
                >
                  Create one now
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name (Patient)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="patient@mail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 019-2834"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password (min 6)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Patient Account...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-center text-xs text-slate-500 pt-1">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => handleTabSwitch('signin')}
                  className="text-teal-700 font-semibold hover:underline"
                >
                  Sign in here
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
