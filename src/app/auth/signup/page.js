'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../lib/authContext';

import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiAlertCircle } from 'react-icons/fi';
import { ImSpinner9 } from 'react-icons/im';

const TOTAL_STEPS = 3;

export default function SignUpPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { signUp, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && formData.name.trim().length < 2) {
      setError('Please enter a valid name.');
      return;
    }
    if (step === 2) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address.');
        return;
      }
    }
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    if (step > 1) setStep(step - 1);
  };

  const validatePasswordStrength = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push("At least 8 characters");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("One uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("One lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("One number");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("One special character");
    }
    
    return errors;
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    const passwordErrors = validatePasswordStrength(formData.password);
    if (passwordErrors.length > 0) {
      setError(`Password must contain: ${passwordErrors.join(', ')}`);
      return;
    }

    setIsLoading(true);
    try {
      await signUp(formData.email, formData.password, formData.name);
      router.push('/dashboard');
    } catch (error) {
      setError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
        <ImSpinner9 className="text-4xl text-emerald-600 animate-spin mb-4" />
        <h2 className="text-2xl font-semibold text-gray-800">Checking Session...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sanctuary-sand p-6 relative overflow-hidden">
      
      {/* Floating blurred blobs with sanctuary theme */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-sanctuary-sage/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-sanctuary-misty/30 rounded-full blur-3xl animate-pulse delay-2000" />

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block neumorphic text-sanctuary-slate font-semibold px-5 py-2 rounded-3xl text-sm hover:shadow-sanctuary-hover transition-sanctuary mb-4 font-quicksand">
            Back to Home
          </Link>
          <h1 className="text-3xl font-extrabold text-sanctuary-slate font-quicksand">Create your account</h1>
        </div>

        <div className="neumorphic rounded-3xl p-8">
          {/* Progress tracker as dots */}
          <div className="flex justify-center gap-3 mb-8">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className={`h-3 w-3 rounded-full ${step >= i ? 'bg-sanctuary-sage shadow-sanctuary' : 'bg-sanctuary-misty/50'}`}
                animate={{ scale: step === i ? 1.3 : 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              />
            ))}
          </div>

          <form onSubmit={handleEmailSignUp}>
            <div className="min-h-[200px]">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                    <h2 className="text-lg font-semibold text-sanctuary-slate mb-4 font-quicksand">What should we call you?</h2>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sanctuary-slate/60"><FiUser /></span>
                      <input id="name" name="name" type="text" value={formData.name} onChange={handleInputChange} 
                        className="w-full pl-10 text-sanctuary-slate pr-3 py-3 rounded-3xl border border-sanctuary-misty/40 focus-sanctuary bg-white/90 placeholder:text-sanctuary-slate/40 font-nunito"
                        placeholder="Enter your name" autoFocus />
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                    <h2 className="text-lg font-semibold text-sanctuary-slate mb-4 font-quicksand">What's your email?</h2>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sanctuary-slate/60"><FiMail /></span>
                      <input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} 
                        className="w-full pl-10 pr-3 text-sanctuary-slate py-3 rounded-3xl border border-sanctuary-misty/40 focus-sanctuary bg-white/90 placeholder:text-sanctuary-slate/40 font-nunito"
                        placeholder="you@example.com" autoFocus />
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                    <h2 className="text-lg font-semibold text-sanctuary-slate mb-4 font-quicksand">Create a secure password</h2>
                    <div className="space-y-4">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sanctuary-slate/60"><FiLock /></span>
                        <input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange}
                          className="w-full text-sanctuary-slate pl-10 pr-3 py-3 rounded-3xl border border-sanctuary-misty/40 focus-sanctuary bg-white/90 placeholder:text-sanctuary-slate/40 font-nunito"
                          placeholder="Password (min. 8 characters)" autoFocus />
                      </div>
                      {formData.password && (
                        <div className="text-xs space-y-1 px-2 font-nunito">
                          <p className="font-semibold text-sanctuary-slate/70 mb-1">Password must contain:</p>
                          <p className={formData.password.length >= 8 ? 'text-green-600' : 'text-sanctuary-slate/60'}>
                            ✓ At least 8 characters
                          </p>
                          <p className={/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-sanctuary-slate/60'}>
                            ✓ One uppercase letter
                          </p>
                          <p className={/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-sanctuary-slate/60'}>
                            ✓ One lowercase letter
                          </p>
                          <p className={/[0-9]/.test(formData.password) ? 'text-green-600' : 'text-sanctuary-slate/60'}>
                            ✓ One number
                          </p>
                          <p className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'text-green-600' : 'text-sanctuary-slate/60'}>
                            ✓ One special character
                          </p>
                        </div>
                      )}
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sanctuary-slate/60"><FiLock /></span>
                        <input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange}
                          className="w-full text-sanctuary-slate pl-10 pr-3 py-3 rounded-3xl border border-sanctuary-misty/40 focus-sanctuary bg-white/90 placeholder:text-sanctuary-slate/40 font-nunito"
                          placeholder="Confirm password" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {error && (
              <div className="flex items-center mt-4 p-3 bg-red-50 rounded-3xl text-red-600 text-sm border border-red-200 font-nunito">
                <FiAlertCircle className="mr-2" /> {error}
              </div>
            )}

            <div className="mt-8 flex items-center justify-between">
              <button type="button" onClick={handleBack}
                className={`font-medium text-sanctuary-slate/70 hover:text-sanctuary-slate transition-sanctuary font-quicksand ${step === 1 ? 'opacity-0 cursor-default' : 'opacity-100'}`}
                disabled={step === 1}>
                Back
              </button>
              {step < TOTAL_STEPS ? (
                <button type="button" onClick={handleNext}
                  className="bg-[#52796F] hover:bg-[#3d5a52] text-white font-semibold py-2 px-6 rounded-3xl shadow-sanctuary transition-sanctuary touch-target font-quicksand">
                  Next
                </button>
              ) : (
                <button type="submit" disabled={isLoading}
                  className="bg-[#52796F] hover:bg-[#3d5a52] text-white font-semibold py-2 px-6 rounded-3xl shadow-sanctuary transition-sanctuary flex items-center disabled:opacity-60 touch-target font-quicksand">
                  {isLoading ? (<><ImSpinner9 className="animate-spin mr-2" /> Creating...</>) : 'Create Account'}
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-sanctuary-slate/80 font-nunito">
            Already have an account?{' '}
            <Link href="/auth/signin" className="font-semibold text-[#52796F] hover:text-sanctuary-sage transition-sanctuary">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}