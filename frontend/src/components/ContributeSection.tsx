"use client";

import React, { useState } from 'react';
import { submitFeedback } from '@/lib/api';
import { MessageSquarePlus, Send, CheckCircle2, Lock, Sparkles, AlertCircle } from 'lucide-react';

export function ContributeSection() {
  const [name, setName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMsg('Please write a message or route contribution details.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      // Pass contactInfo as phone or email if provided
      await submitFeedback({
        name: name.trim() || undefined,
        email: contactInfo.includes('@') ? contactInfo.trim() : undefined,
        phone: !contactInfo.includes('@') && contactInfo.trim() ? contactInfo.trim() : undefined,
        message: message.trim(),
      });

      setSubmitted(true);
      setMessage('');
      setName('');
      setContactInfo('');
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.error || 'Failed to submit message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-slate-900 border-y border-slate-800/80 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-10 w-72 h-72 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-72 h-72 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        <div className="bg-slate-950/90 rounded-3xl p-6 sm:p-10 border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.1)] backdrop-blur-xl">
          
          {/* Header */}
          <div className="text-center max-w-xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold px-3.5 py-1.5 rounded-full mb-3 shadow-inner">
              <MessageSquarePlus className="w-4 h-4 text-cyan-400" />
              <span>COMMUNITY CONTRIBUTION & FEEDBACK</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
              Contribute Route Data or Send Feedback
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Know a bus timing update, new route stoppage, or have suggestions for the developer? Share it below.
            </p>
          </div>

          {/* Confidential Notice */}
          <div className="mb-8 p-3.5 rounded-2xl bg-blue-950/50 border border-blue-500/30 flex items-center gap-3 text-blue-200 text-xs sm:text-sm font-medium shadow-inner">
            <Lock className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>
              <strong>Private & Secure:</strong> All messages sent here are delivered directly to the <span className="text-cyan-300 font-bold">Admin Panel</span> and visible only to system administrators.
            </span>
          </div>

          {submitted ? (
            <div className="bg-emerald-950/80 border border-emerald-500/50 p-8 rounded-2xl text-center flex flex-col items-center justify-center gap-3 animate-in fade-in zoom-in duration-300">
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/40">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Thank You for Your Contribution!</h3>
              <p className="text-slate-300 text-sm max-w-md">
                Your message has been logged securely in the Admin Dashboard. Our admin team will review your feedback/route updates shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/40 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Optional Name */}
                <div>
                  <label className="block text-xs font-mono font-semibold uppercase text-slate-400 mb-1.5">
                    Your Name <span className="text-slate-600">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Das"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-100 placeholder-slate-600 rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  />
                </div>

                {/* Optional Phone / Email */}
                <div>
                  <label className="block text-xs font-mono font-semibold uppercase text-slate-400 mb-1.5">
                    Phone No or Email <span className="text-slate-600">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="e.g. 9876543210 or user@gmail.com"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-100 placeholder-slate-600 rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  />
                </div>
              </div>

              {/* Required Message */}
              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-slate-400 mb-1.5">
                  Route Details, Timetable Updates or Feedback <span className="text-cyan-400">*</span>
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g., MAA SARADA bus has updated departure time from Silda at 7:30 AM via Belpahari..."
                  required
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-100 placeholder-slate-600 rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Submitting to Admin...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Message to Admin</span>
                  </>
                )}
              </button>
            </form>
          )}

        </div>
      </div>
    </section>
  );
}
