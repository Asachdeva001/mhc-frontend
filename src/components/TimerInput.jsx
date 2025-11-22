'use client';

import { useState, useRef, useEffect } from 'react';

export default function TimerInput({ initialSeconds, onConfirm, onCancel }) {
  const minutes = Math.floor(initialSeconds / 60);
  const seconds = initialSeconds % 60;
  
  // Keep raw values for editing, NOT padded
  const [minValue, setMinValue] = useState(minutes.toString());
  const [secValue, setSecValue] = useState(seconds.toString().padStart(2, '0'));
  const [error, setError] = useState('');
  
  const minInputRef = useRef(null);
  const secInputRef = useRef(null);

  // Auto-focus minutes on mount
  useEffect(() => {
    minInputRef.current?.focus();
  }, []);

  const handleMinChange = (e) => {
    const value = e.target.value;
    // Allow only digits, no max length during input
    if (/^\d*$/.test(value)) {
      setMinValue(value);
      setError('');
    }
  };

  const handleSecChange = (e) => {
    let value = e.target.value;
    
    // Allow only digits
    if (!/^\d*$/.test(value)) return;
    
    // Max 2 characters
    if (value.length > 2) value = value.slice(0, 2);
    
    const numVal = parseInt(value) || 0;
    
    // Validate seconds (0-59)
    if (numVal <= 59 || value === '') {
      setSecValue(value);
      setError('');
    } else {
      setError('Seconds must be 0-59');
      return;
    }
  };

  const handleConfirm = () => {
    const mins = parseInt(minValue) || 0;
    const secs = parseInt(secValue) || 0;
    
    // Validation
    if (mins === 0 && secs === 0) {
      setError('Time must be at least 00:01');
      return;
    }
    
    if (secs > 59) {
      setError('Seconds must be 0-59');
      return;
    }
    
    const totalSeconds = mins * 60 + secs;
    onConfirm(totalSeconds);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="text-lg text-slate-700 font-medium">Set Duration</div>
      
      <div className="flex items-center justify-center gap-2 text-4xl font-bold">
        <input
          ref={minInputRef}
          type="text"
          inputMode="numeric"
          placeholder="0"
          value={minValue}
          onChange={handleMinChange}
          onKeyDown={handleKeyPress}
          className="w-20 text-center px-3 py-2 text-4xl font-bold text-black bg-white border-2 border-teal-500 rounded-lg focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-300"
        />
        <span className="text-slate-800 font-bold">:</span>
        <input
          ref={secInputRef}
          type="text"
          inputMode="numeric"
          placeholder="00"
          value={secValue}
          onChange={handleSecChange}
          onKeyDown={handleKeyPress}
          className="w-20 text-center px-3 py-2 text-4xl font-bold text-black bg-white border-2 border-teal-500 rounded-lg focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-300"
          maxLength="2"
        />
      </div>
      
      {error && (
        <p className="text-sm text-red-600 font-medium">{error}</p>
      )}
      
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="px-6 py-2 bg-slate-300 text-slate-800 font-medium rounded-full hover:bg-slate-400 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          className="px-6 py-2 bg-gradient-to-r from-teal-500 to-sky-600 text-white font-medium rounded-full transition-all hover:shadow-lg"
        >
          Set
        </button>
      </div>
    </div>
  );
}
