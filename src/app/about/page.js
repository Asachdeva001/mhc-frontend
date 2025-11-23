'use client';

import Navigation from '../../components/Navigation';
import { useAuth } from '../../lib/authContext';
import { motion } from 'framer-motion';
import { Heart, Shield, Lock, Brain, BookOpen, Activity, Mail, Phone, AlertCircle } from 'lucide-react';

export default function AboutPage() {
  const { isAuthenticated } = useAuth();

  const coreFeatures = [
    {
      icon: Brain,
      title: 'AI Companion',
      description: 'A compassionate AI that listens without judgment, understands your emotions, and provides personalized support 24/7. Your mental wellness companion is always here when you need to talk.',
    },
    {
      icon: Activity,
      title: 'Mood Tracking',
      description: 'Log your daily emotions, energy levels, and sleep patterns. Visualize your mental health journey with insightful graphs and patterns to better understand what affects your wellbeing.',
    },
    {
      icon: BookOpen,
      title: 'Mindful Journaling',
      description: 'Express your thoughts freely in a private, encrypted journal. Reflect on your day, process emotions, and track your personal growth over time with AI-powered prompts.',
    },
  ];

  return (
    <div className="min-h-screen mesh-gradient-sanctuary relative">
      <Navigation currentPage={isAuthenticated ? 'about' : ''} />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section - Why Mental Buddy Exists */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-24"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-sanctuary-slate mb-8 font-nunito leading-tight">
            Why <span className="text-sanctuary-sage">Mental Buddy</span> Exists
          </h1>
          <p className="text-xl md:text-2xl text-sanctuary-slate/70 max-w-4xl mx-auto font-quicksand leading-relaxed px-4">
            Because everyone deserves a safe space to be heard, understood, and supported—
            without judgment, without barriers, and without compromise on privacy.
          </p>
        </motion.div>

        {/* Our Mission - Digital Sanctuary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-20"
        >
          <div className="frosted-glass rounded-3xl p-10 md:p-16">
            <motion.div 
              className="flex items-center justify-center mb-10"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            >
              <div className="w-24 h-24 rounded-3xl bg-sanctuary-sage/20 flex items-center justify-center shadow-xl">
                <Heart size={42} className="text-sanctuary-sage" />
              </div>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-sanctuary-slate mb-8 text-center font-nunito">
              Our Mission: A Digital Sanctuary
            </h2>
            <p className="text-lg text-sanctuary-slate/70 max-w-4xl mx-auto text-center mb-4 font-quicksand leading-relaxed">
              Mental Buddy is more than an app—it&apos;s a <span className="font-semibold text-sanctuary-sage">Digital Sanctuary</span> where 
              your mental wellness comes first. We&apos;ve created a space where privacy isn&apos;t an afterthought, 
              it&apos;s the foundation. Where AI doesn&apos;t replace human connection, but bridges the gap when you 
              need support most.
            </p>
            <p className="text-lg text-sanctuary-slate/70 max-w-4xl mx-auto text-center font-quicksand leading-relaxed">
              In a world that&apos;s always rushing, we offer you a moment to pause, reflect, and heal—on your terms, 
              at your pace, with complete confidentiality.
            </p>
          </div>
        </motion.div>

        {/* Features Recap - 3 Core Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-sanctuary-slate mb-8 text-center font-nunito">
            What Makes Mental Buddy Special
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="frosted-glass rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 breathing-scale"
                  whileHover={{ y: -8 }}
                >
                  <div className="w-16 h-16 rounded-2xl bg-sanctuary-sage/20 flex items-center justify-center mb-6 shadow-lg">
                    <Icon size={32} className="text-sanctuary-sage" />
                  </div>
                  <h3 className="text-2xl font-bold text-sanctuary-slate mb-4 font-nunito">
                    {feature.title}
                  </h3>
                  <p className="text-sanctuary-slate/70 font-quicksand leading-relaxed text-lg">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Privacy Promise */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-20"
        >
          <div className="frosted-glass rounded-3xl p-10 md:p-16 bg-gradient-to-br from-sanctuary-sage/10 to-sanctuary-misty/20">
            <motion.div 
              className="flex items-center justify-center mb-10"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.9, type: 'spring', stiffness: 200 }}
            >
              <div className="w-24 h-24 rounded-3xl bg-sanctuary-sage/20 flex items-center justify-center shadow-xl">
                <Lock size={42} className="text-sanctuary-sage" />
              </div>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-sanctuary-slate mb-8 text-center font-nunito">
              Our Privacy Promise
            </h2>
            <div className="max-w-4xl mx-auto space-y-6">
              <motion.div 
                className="flex items-start gap-6 p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40 shadow-md hover:shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.02, x: 5 }}
              >
                <Shield size={28} className="text-sanctuary-sage flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-sanctuary-slate mb-2 text-lg font-nunito">Your Conversations Are Encrypted</h3>
                  <p className="text-sanctuary-slate/70 font-quicksand leading-relaxed">
                    Every chat, every journal entry, every mood log is protected with end-to-end encryption. 
                    Not even we can read your private thoughts.
                  </p>
                </div>
              </motion.div>
              <motion.div 
                className="flex items-start gap-6 p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40 shadow-md hover:shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.02, x: 5 }}
              >
                <Lock size={28} className="text-sanctuary-sage flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-sanctuary-slate mb-2 text-lg font-nunito">We Don&apos;t Sell Your Data. Ever.</h3>
                  <p className="text-sanctuary-slate/70 font-quicksand leading-relaxed">
                    Your personal information, mental health data, and conversations will never be sold, 
                    shared, or monetized. Your trust is not for sale.
                  </p>
                </div>
              </motion.div>
              <motion.div 
                className="flex items-start gap-6 p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40 shadow-md hover:shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.02, x: 5 }}
              >
                <Heart size={28} className="text-sanctuary-sage flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-sanctuary-slate mb-2 text-lg font-nunito">Built for You, Not Advertisers</h3>
                  <p className="text-sanctuary-slate/70 font-quicksand leading-relaxed">
                    No ads. No tracking. No hidden agendas. Mental Buddy exists solely to support your 
                    mental wellness journey with integrity and respect.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Support/Contact - Get Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mb-12"
        >
          <div className="frosted-glass rounded-3xl p-10 md:p-16">
            <motion.div 
              className="flex items-center justify-center mb-10"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.1, type: 'spring', stiffness: 200 }}
            >
              <div className="w-24 h-24 rounded-3xl bg-sanctuary-sage/20 flex items-center justify-center shadow-xl">
                <AlertCircle size={42} className="text-sanctuary-sage" />
              </div>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-sanctuary-slate mb-10 text-center font-nunito">
              Need Help? We&apos;re Here.
            </h2>
            
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Support Email */}
              <motion.div 
                className="frosted-glass rounded-3xl p-8 hover:shadow-xl transition-all duration-300 breathing-scale"
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-14 h-14 rounded-xl bg-sanctuary-sage/10 flex items-center justify-center shadow-md">
                    <Mail size={28} className="text-sanctuary-sage" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-sanctuary-slate font-nunito">General Support</h3>
                    <p className="text-sm text-sanctuary-slate/60 font-quicksand">Questions, feedback, or technical issues</p>
                  </div>
                </div>
                <a 
                  href="mailto:support@mentalbuddy.com" 
                  className="inline-flex items-center gap-2 text-sanctuary-sage hover:text-sanctuary-sage/80 transition-colors font-medium font-quicksand"
                >
                  support@mentalbuddy.com
                  <span className="text-sm">→</span>
                </a>
              </motion.div>

              {/* Crisis Helplines */}
              <motion.div 
                className="frosted-glass rounded-3xl p-8 bg-gradient-to-br from-red-50/60 to-orange-50/60 border-2 border-red-200/40 hover:shadow-xl transition-all duration-300 breathing-scale"
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-red-100 flex items-center justify-center shadow-md">
                    <Phone size={28} className="text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-sanctuary-slate font-nunito">Crisis Support</h3>
                    <p className="text-sm text-sanctuary-slate/60 font-quicksand">If you&apos;re in crisis, please reach out immediately</p>
                  </div>
                </div>
                <div className="space-y-3 ml-16">
                  <div>
                    <p className="font-semibold text-sanctuary-slate font-nunito mb-1">🇺🇸 United States & Canada</p>
                    <p className="text-sanctuary-slate/70 font-quicksand">
                      <span className="font-semibold">988</span> - Suicide & Crisis Lifeline (Call or Text)
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-sanctuary-slate font-nunito mb-1">🇮🇳 India</p>
                    <p className="text-sanctuary-slate/70 font-quicksand">
                      <span className="font-semibold">1800-599-0019</span> - iCall Psychosocial Helpline
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-sanctuary-slate font-nunito mb-1">🇬🇧 United Kingdom</p>
                    <p className="text-sanctuary-slate/70 font-quicksand">
                      <span className="font-semibold">111</span> - NHS Urgent Mental Health Helpline
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-sanctuary-slate font-nunito mb-1">🌍 International</p>
                    <p className="text-sanctuary-slate/70 font-quicksand">
                      Visit <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className="text-sanctuary-sage hover:underline">findahelpline.com</a> for your country
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Important Notice */}
              <div className="text-center pt-4">
                <p className="text-sm text-sanctuary-slate/60 font-quicksand leading-relaxed">
                  <strong className="text-sanctuary-slate">Important:</strong> Mental Buddy is a wellness support tool, 
                  not a replacement for professional mental health care. If you&apos;re experiencing a mental health emergency, 
                  please contact emergency services or a licensed mental health professional immediately.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
