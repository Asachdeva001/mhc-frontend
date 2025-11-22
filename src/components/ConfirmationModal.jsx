'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger' }) => {
  if (!isOpen) return null;

  const colors = {
    danger: {
      button: 'bg-red-600 hover:bg-red-700 text-white',
      icon: 'text-red-600',
    },
    warning: {
      button: 'bg-orange-600 hover:bg-orange-700 text-white',
      icon: 'text-orange-600',
    },
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl ${type === 'danger' ? 'bg-red-100' : 'bg-orange-100'} flex items-center justify-center`}>
                <AlertTriangle className={colors[type].icon} size={24} />
              </div>
              <h3 className="text-xl font-bold text-sanctuary-slate">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-sanctuary-slate/60 hover:text-sanctuary-slate transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <p className="text-sanctuary-slate/70 mb-6 ml-15">{message}</p>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-sanctuary-misty/30 text-sanctuary-slate hover:bg-sanctuary-misty/50 transition-sanctuary font-medium"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2 rounded-xl transition-sanctuary font-medium ${colors[type].button}`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConfirmationModal;
