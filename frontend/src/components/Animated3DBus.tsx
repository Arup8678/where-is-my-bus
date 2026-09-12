"use client";

import React from 'react';
import { Radio } from 'lucide-react';

export function Animated3DBus() {
  return (
    <div className="w-full relative overflow-hidden py-12 my-2 select-none">
      {/* Futuristic Holographic Road Bed */}
      <div className="w-full h-20 bg-slate-950/90 relative border-y border-blue-500/30 shadow-[0_0_30px_rgba(37,99,235,0.2)] flex items-center overflow-hidden backdrop-blur-xl">
        
        {/* Cyber Grid Lines */}
        <div 
          className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px]"
        />

        {/* Animated Glowing Highway Lane Marking */}
        <div 
          className="w-[200%] h-1.5 absolute inset-0 my-auto animate-road-move shadow-[0_0_15px_#FACC15]"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, #FACC15 0, #FACC15 45px, transparent 45px, transparent 90px)',
          }}
        />

        {/* Ambient Asphalt Glow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-slate-950 pointer-events-none" />
      </div>

      {/* 3D Animated Bus Container moving Left to Right */}
      <div className="absolute top-3 left-0 w-full pointer-events-none z-20">
        <div className="animate-bus-drive inline-block relative">
          
          {/* Main 3D Bus Body */}
          <div 
            className="relative w-84 h-32 rounded-3xl bg-gradient-to-r from-blue-900 via-blue-600 to-indigo-800 p-2.5 shadow-[0_20px_50px_rgba(15,23,42,0.9)] border-t-2 border-l-2 border-cyan-400/50 backdrop-blur-lg"
            style={{
              transformStyle: 'preserve-3d',
              transform: 'perspective(700px) rotateY(-10deg) rotateX(5deg)',
            }}
          >
            {/* LED Destination Board Top Header */}
            <div className="bg-slate-950/95 rounded-xl px-3 py-1 mb-2 border border-cyan-500/40 flex justify-between items-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34D399]" />
                <span className="text-[11px] font-mono tracking-widest text-amber-300 font-black uppercase drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]">
                  ARUP • WB-33-EXPRESS
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950/90 px-2 py-0.5 rounded-md border border-cyan-500/40 shadow-sm">
                <Radio className="w-3 h-3 animate-spin text-cyan-400" />
                <span>LIVE TRACKING</span>
              </div>
            </div>

            {/* Bus Side Windows Row */}
            <div className="grid grid-cols-5 gap-2 mb-3 px-1">
              {[1, 2, 3, 4, 5].map((w) => (
                <div 
                  key={w} 
                  className="h-10 rounded-lg bg-gradient-to-b from-cyan-100/90 via-sky-400/30 to-slate-950 border border-white/50 shadow-inner relative overflow-hidden flex items-center justify-center backdrop-blur-sm"
                >
                  {/* Glass Gloss Shine Reflection */}
                  <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/60 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Passenger Silhouettes */}
                  {w === 1 && <span className="text-xs opacity-80 filter drop-shadow">👤</span>}
                  {w === 3 && <span className="text-xs opacity-80 filter drop-shadow">👨‍💻</span>}
                  {w === 5 && <span className="text-xs opacity-80 filter drop-shadow">🚌</span>}
                </div>
              ))}
            </div>

            {/* Bus Branding "ARUP" */}
            <div className="px-2 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl font-black italic tracking-tighter text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-cyan-200">
                  ARUP
                </span>
                <span className="text-[10px] uppercase font-black tracking-widest text-cyan-200 bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-cyan-400/40 shadow-inner">
                  EXPRESS
                </span>
              </div>
              
              {/* Futuristic Neon Accent Line */}
              <div className="h-1.5 w-20 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-amber-400 shadow-[0_0_10px_#38BDF8]" />
            </div>

            {/* Front Headlight & Light Projection (Right Side) */}
            <div className="absolute -right-2 top-9 w-4 h-12 bg-slate-950 rounded-r-lg border-r-2 border-amber-400 flex flex-col justify-between p-0.5 shadow-md">
              <div className="w-2.5 h-3.5 bg-yellow-300 rounded-full animate-headlight-glow shadow-[0_0_16px_#FACC15]" />
              <div className="w-2.5 h-3.5 bg-yellow-300 rounded-full animate-headlight-glow shadow-[0_0_16px_#FACC15]" />
            </div>

            {/* Headlight Cone Light Projection */}
            <div 
              className="absolute -right-44 top-3 w-44 h-24 bg-gradient-to-r from-amber-200/60 via-yellow-300/20 to-transparent pointer-events-none transform -rotate-2 blur-xs opacity-90"
              style={{ clipPath: 'polygon(0 35%, 100% 0, 100% 100%, 0 65%)' }}
            />

            {/* Rear Taillight (Left Side) */}
            <div className="absolute -left-1.5 top-11 w-2.5 h-10 bg-red-600 rounded-l shadow-[0_0_14px_#EF4444]" />

            {/* 3D Spinning Alloy Wheels */}
            {/* Front Wheel */}
            <div className="absolute -bottom-4 right-10 w-11 h-11 rounded-full bg-slate-950 border-4 border-slate-700 shadow-2xl flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-cyan-400 animate-wheel-spin flex items-center justify-center shadow-inner">
                <div className="w-5 h-5 rounded-full border border-dashed border-cyan-200 bg-slate-700" />
              </div>
            </div>

            {/* Rear Wheel */}
            <div className="absolute -bottom-4 left-10 w-11 h-11 rounded-full bg-slate-950 border-4 border-slate-700 shadow-2xl flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-cyan-400 animate-wheel-spin flex items-center justify-center shadow-inner">
                <div className="w-5 h-5 rounded-full border border-dashed border-cyan-200 bg-slate-700" />
              </div>
            </div>

          </div>

          {/* Bus Ground Drop Shadow */}
          <div className="w-80 h-5 bg-black/80 rounded-full blur-md ml-4 -mt-1" />
        </div>
      </div>
    </div>
  );
}
