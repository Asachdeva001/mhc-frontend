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

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-cyan-100">
        <ImSpinner9 className="text-4xl text-blue-600 animate-spin mb-4" />
        <h2 className="text-2xl font-semibold text-gray-800">Checking Session...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-cyan-100 p-6 relative overflow-hidden">
      
      {/* Floating blurred blobs for calm background */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl animate-pulse delay-2000" />

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block bg-white/60 backdrop-blur-md text-blue-800 font-semibold px-5 py-2 rounded-full text-sm hover:bg-white/80 transition shadow-sm mb-4">
            Back to Home
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900">Create your account</h1>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/40">
          {/* Progress tracker as dots */}
          <div className="flex justify-center gap-3 mb-8">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className={`h-3 w-3 rounded-full ${step >= i ? 'bg-blue-600' : 'bg-gray-300'}`}
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
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">What should we call you?</h2>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><FiUser /></span>
                      <input id="name" name="name" type="text" value={formData.name} onChange={handleInputChange} 
                        className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 placeholder-gray-400"
                        placeholder="Enter your name" autoFocus />
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">What's your email?</h2>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><FiMail /></span>
                      <input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} 
                        className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 placeholder-gray-400"
                        placeholder="you@example.com" autoFocus />
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Create a secure password</h2>
                    <div className="space-y-4">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><FiLock /></span>
                        <input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange}
                          className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 placeholder-gray-400"
                          placeholder="Password (min. 6 characters)" autoFocus />
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><FiLock /></span>
                        <input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange}
                          className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 placeholder-gray-400"
                          placeholder="Confirm password" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {error && (
              <div className="flex items-center mt-4 p-3 bg-red-50 rounded-lg text-red-700 text-sm">
                <FiAlertCircle className="mr-2" /> {error}
              </div>
            )}

            <div className="mt-8 flex items-center justify-between">
              <button type="button" onClick={handleBack}
                className={`font-medium text-gray-600 hover:text-gray-900 transition ${step === 1 ? 'opacity-0' : ''}`}
                disabled={step === 1}>
                Back
              </button>
              {step < TOTAL_STEPS ? (
                <button type="button" onClick={handleNext}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-6 rounded-xl shadow-md transition">
                  Next
                </button>
              ) : (
                <button type="submit" disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-6 rounded-xl shadow-md transition flex items-center disabled:opacity-60">
                  {isLoading ? (<><ImSpinner9 className="animate-spin mr-2" /> Creating...</>) : 'Create Account'}
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-700">
            Already have an account?{' '}
            <Link href="/auth/signin" className="font-semibold text-blue-600 hover:text-blue-800">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
