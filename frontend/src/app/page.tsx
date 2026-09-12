"use client";

import { useLanguage } from '@/lib/i18n';
import { Navbar } from '@/components/Navbar';
import { SearchCard } from '@/components/search/SearchCard';
import { Animated3DBus } from '@/components/Animated3DBus';
import { ContributeSection } from '@/components/ContributeSection';
import { Map, Navigation, Clock, Sparkles, UserCheck, Phone, Mail, Code2, ShieldAlert } from 'lucide-react';

export default function Home() {
  const { language } = useLanguage();

  return (
    <main className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      <Navbar />
      
      {/* Modern & Futuristic Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950/90 pt-10 pb-24 px-4 overflow-hidden border-b border-blue-900/30">
        {/* Cyber Neon Grid & Radial Background Lights */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-cyan-500/15 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-10 right-10 w-80 h-80 bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto relative z-10 text-center max-w-4xl">
          {/* Futuristic Live Status Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold px-4 py-1.5 rounded-full mb-6 backdrop-blur-xl shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
            <span>{language === 'en' ? 'FUTURISTIC LIVE BUS TRACKER • WEST BENGAL' : 'পশ্চিমবঙ্গের লাইভ বাস সময়সূচী ও ট্র্যাকার'}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-4 text-white drop-shadow-2xl">
            🚌 WHERE IS MY BUS?
          </h1>
          
          <p className="text-lg sm:text-2xl text-slate-300 font-medium max-w-2xl mx-auto mb-6 leading-relaxed">
            {language === 'en' 
              ? 'Real-time timetable schedules, interpolated live bus tracking & stoppage timing.' 
              : 'লাইভ সময়সূচী, বাসের আনুমানিক অবস্থান এবং সমস্ত স্টপেজ ট্র্যাক করুন।'}
          </p>

          {/* Key Metrics Counters */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-slate-300 mb-6">
            <div className="flex items-center gap-2.5 bg-slate-900/90 px-5 py-2.5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
              <span className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">119+</span>
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Bus Trips</span>
            </div>
            <div className="flex items-center gap-2.5 bg-slate-900/90 px-5 py-2.5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
              <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">190+</span>
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Stoppages</span>
            </div>
            <div className="flex items-center gap-2.5 bg-slate-900/90 px-5 py-2.5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">2800+</span>
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Schedules</span>
            </div>
          </div>
        </div>

        {/* 3D Animated ARUP Bus Moving Across Highway */}
        <div className="w-full my-4 relative z-10">
          <Animated3DBus />
        </div>

        {/* Search Options Form Card */}
        <div className="container mx-auto px-4 relative z-30 max-w-lg mt-2">
          <SearchCard />
        </div>
      </section>

      {/* Contribute & Feedback Section */}
      <ContributeSection />

      {/* How It Works Section */}
      <section className="py-16 bg-slate-950">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 tracking-tight">
              How It Works
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm">
              Find bus schedules and live estimated location in 3 simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-900/90 p-8 rounded-2xl border border-slate-800 hover:border-cyan-500/50 transition-all hover:shadow-xl hover:shadow-cyan-500/10 group">
              <div className="w-14 h-14 bg-cyan-950 text-cyan-400 rounded-2xl flex items-center justify-center mb-6 border border-cyan-500/30 group-hover:scale-110 transition-transform">
                <Map className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">1. Select Stoppages</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Choose origin and destination from our database of West Bengal stoppages.
              </p>
            </div>

            <div className="bg-slate-900/90 p-8 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-all hover:shadow-xl hover:shadow-emerald-500/10 group">
              <div className="w-14 h-14 bg-emerald-950 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/30 group-hover:scale-110 transition-transform">
                <Navigation className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">2. Track Live Position</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                View real-time interpolated bus position on interactive map with progress timeline.
              </p>
            </div>

            <div className="bg-slate-900/90 p-8 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition-all hover:shadow-xl hover:shadow-amber-500/10 group">
              <div className="w-14 h-14 bg-amber-950 text-amber-400 rounded-2xl flex items-center justify-center mb-6 border border-amber-500/30 group-hover:scale-110 transition-transform">
                <Clock className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">3. Exact Timetables</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Get departure and arrival schedules in 12-hour AM/PM format with delay updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Contact Section */}
      <section className="py-16 bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950/80 border-t border-slate-800">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-slate-900/90 rounded-3xl p-8 sm:p-10 border border-blue-500/30 shadow-[0_0_50px_rgba(37,99,235,0.15)] relative overflow-hidden backdrop-blur-xl">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-extrabold px-3.5 py-1 rounded-full mb-3 shadow-inner">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span>PLATFORM DEVELOPER</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Get In Touch With The Developer
              </h3>
              <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
                Have feedback, route updates, or technical inquiries? Reach out directly.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 text-center">
              {/* Developer Name */}
              <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col items-center justify-center group shadow-md">
                <div className="w-12 h-12 rounded-xl bg-cyan-950/80 text-cyan-400 flex items-center justify-center mb-3 border border-cyan-500/30 group-hover:scale-110 transition-transform">
                  <UserCheck className="w-6 h-6" />
                </div>
                <span className="text-xs uppercase font-bold tracking-widest text-slate-500 mb-1">Developer</span>
                <span className="text-base font-black text-white font-mono">RootX (Alpha)</span>
              </div>

              {/* Phone Number */}
              <a 
                href="tel:9382326813"
                className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col items-center justify-center group shadow-md hover:-translate-y-0.5"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-950/80 text-emerald-400 flex items-center justify-center mb-3 border border-emerald-500/30 group-hover:scale-110 transition-transform">
                  <Phone className="w-6 h-6" />
                </div>
                <span className="text-xs uppercase font-bold tracking-widest text-slate-500 mb-1">Phone Number</span>
                <span className="text-base font-black text-emerald-400 font-mono group-hover:underline">9382326813</span>
              </a>

              {/* Gmail / Email */}
              <a 
                href="mailto:cosxisinx369@gmail.com"
                className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col items-center justify-center group shadow-md hover:-translate-y-0.5"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-950/80 text-amber-400 flex items-center justify-center mb-3 border border-amber-500/30 group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6" />
                </div>
                <span className="text-xs uppercase font-bold tracking-widest text-slate-500 mb-1">Email Support</span>
                <span className="text-sm font-black text-amber-300 font-mono group-hover:underline break-all">cosxisinx369@gmail.com</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-950 text-slate-400 py-8 border-t border-slate-900 text-center">
        <div className="container mx-auto px-4">
          <p className="font-black text-white text-lg mb-1 flex items-center justify-center gap-2">
            🚌 WHERE IS MY BUS
          </p>
          <p className="text-xs text-slate-500 mb-3">
            West Bengal Timetable & Live Bus Tracking System
          </p>
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} WHERE IS MY BUS. Developed by <span className="text-cyan-400 font-mono font-bold">RootX (Alpha)</span>. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
