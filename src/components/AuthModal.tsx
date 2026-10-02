import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, User as UserIcon, ArrowRight, CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  enforceGating?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, enforceGating = false }) => {
  const {
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    loginAsDemoUser,
    resetPassword,
    error,
    clearError,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setResetSuccessMessage(null);
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
        if (onClose) onClose();
      } else if (mode === 'register') {
        await registerWithEmail(email, password, name);
        if (onClose) onClose();
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setResetSuccessMessage(`Password recovery instructions dispatched to ${email}`);
      }
    } catch (err) {
      // Error handled in auth context
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoSignIn = async (role: 'customer' | 'merchant') => {
    clearError();
    setSubmitting(true);
    try {
      await loginAsDemoUser(role);
      if (onClose) onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    clearError();
    setSubmitting(true);
    try {
      await loginWithGoogle();
      if (onClose) onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#080808]/60 backdrop-blur-md transition-opacity"
        onClick={() => {
          if (!enforceGating && onClose) onClose();
        }}
      />

      {/* Modal Surface */}
      <div className="relative w-full max-w-md bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl shadow-2xl p-8 z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Dismiss Button (only if not strictly gated) */}
        {!enforceGating && onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1 text-[#777777] hover:text-[#080808] transition-colors rounded-lg cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Brand Kicker */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-display font-bold text-lg tracking-tight text-[#080808]">
              NOVA CART
            </span>
            <span className="text-[#777777] text-xs">/</span>
            <span className="text-xs text-[#777777] uppercase tracking-wider font-mono">
              Secure Gateway
            </span>
          </div>
          <h2 className="text-xl font-semibold text-[#080808] tracking-tight">
            {mode === 'login'
              ? 'Access Your Portal'
              : mode === 'register'
              ? 'Create Collector Account'
              : 'Password Recovery'}
          </h2>
          <p className="text-xs text-[#777777] mt-1 leading-relaxed">
            {mode === 'login'
              ? 'Sign in to access your synchronized cart, order history, and 3D studio.'
              : mode === 'register'
              ? 'Join the private collective for high-precision design acquisitions.'
              : 'Enter your verified email to receive credentials reset link.'}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 p-1 bg-[#F0F1F3] rounded-lg mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                clearError();
              }}
              className={`py-2 text-xs font-medium rounded-md transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-[#FFFFFF] text-[#080808] shadow-xs'
                  : 'text-[#777777] hover:text-[#080808]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                clearError();
              }}
              className={`py-2 text-xs font-medium rounded-md transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-[#FFFFFF] text-[#080808] shadow-xs'
                  : 'text-[#777777] hover:text-[#080808]'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* Error Feedback */}
        {error && (
          <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Success Feedback for Reset */}
        {resetSuccessMessage && (
          <div className="mb-5 p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{resetSuccessMessage}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-[#171717] mb-1.5">
                Full Legal Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  className="w-full px-3.5 py-2.5 pl-10 text-xs bg-[#F8F9FB] border border-[#E5E5E5] rounded-lg text-[#080808] placeholder:text-[#777777] focus:outline-none focus:border-[#080808] focus:bg-[#FFFFFF] transition-all"
                />
                <UserIcon className="w-4 h-4 text-[#777777] absolute left-3.5 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#171717] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.com"
                className="w-full px-3.5 py-2.5 pl-10 text-xs bg-[#F8F9FB] border border-[#E5E5E5] rounded-lg text-[#080808] placeholder:text-[#777777] focus:outline-none focus:border-[#080808] focus:bg-[#FFFFFF] transition-all"
              />
              <Mail className="w-4 h-4 text-[#777777] absolute left-3.5 top-3" />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-[#171717]">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      clearError();
                    }}
                    className="text-[11px] text-[#777777] hover:text-[#080808] transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3.5 py-2.5 pl-10 text-xs bg-[#F8F9FB] border border-[#E5E5E5] rounded-lg text-[#080808] placeholder:text-[#777777] focus:outline-none focus:border-[#080808] focus:bg-[#FFFFFF] transition-all"
                />
                <Lock className="w-4 h-4 text-[#777777] absolute left-3.5 top-3" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 bg-[#080808] hover:bg-[#171717] disabled:opacity-50 text-[#FFFFFF] text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs mt-2"
          >
            <span>
              {submitting
                ? 'Processing...'
                : mode === 'login'
                ? 'Authorize & Enter'
                : mode === 'register'
                ? 'Complete Registration'
                : 'Send Password Reset Link'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {mode === 'forgot' && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                clearError();
              }}
              className="text-xs text-[#171717] hover:underline cursor-pointer font-medium"
            >
              Return to Sign In
            </button>
          </div>
        )}

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E5E5E5]" />
          </div>
          <div className="relative flex justify-center text-[11px]">
            <span className="px-2 bg-[#FFFFFF] text-[#777777]">
              Or continue with
            </span>
          </div>
        </div>

        {/* Alternative Auth Methods */}
        <div className="space-y-2.5">
          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={submitting}
            className="w-full py-2.5 px-4 bg-[#FFFFFF] hover:bg-[#F8F9FB] border border-[#E5E5E5] text-[#080808] text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Quick Demo Accounts for Immediate Frictionless Review */}
          <div className="pt-2">
            <p className="text-[11px] text-[#777777] mb-2 text-center">
              Quick Evaluation Credentials:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoSignIn('customer')}
                disabled={submitting}
                className="py-2 px-3 bg-[#F8F9FB] hover:bg-[#F0F1F3] border border-[#E5E5E5] text-[#171717] text-[11px] font-medium rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <UserIcon className="w-3 h-3 text-[#777777]" />
                <span>Demo Collector</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoSignIn('merchant')}
                disabled={submitting}
                className="py-2 px-3 bg-[#F8F9FB] hover:bg-[#F0F1F3] border border-[#E5E5E5] text-[#171717] text-[11px] font-medium rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3 h-3 text-[#171717]" />
                <span>Demo Director</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security Assurance Footer */}
        <div className="mt-6 pt-4 border-t border-[#F0F1F3] flex items-center justify-center gap-2 text-[10px] text-[#777777]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#171717]" />
          <span>Encrypted with Cloud Database & Zero-Trust Security Rules</span>
        </div>
      </div>
    </div>
  );
};
