import React, { useState } from 'react';
import { X, HelpCircle, Shield, ChevronDown, ChevronUp, CheckCircle, AlertTriangle } from 'lucide-react';
import { JURY_QA_ITEMS } from '../../data/mockData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const JuryGuideModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white">SAFEGRID Master Defense &amp; Jury Q&amp;A</h2>
              <p className="text-xs text-slate-400">Core Architecture, Design Decisions, and Technical Boundaries</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* Core Philosophy Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-rose-500/30 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
              The 30-Second Elevator Pitch
            </span>
            <blockquote className="text-sm font-semibold text-white italic leading-relaxed">
              &ldquo;Most emergency systems assume that a person in danger can actively ask for help. But what happens when they cannot? SAFEGRID is a software-only community safety and welfare platform that combines manual SOS with scheduled check-ins, safe-arrival journeys, and progressive welfare escalation. Instead of treating every missed signal as an emergency, SAFEGRID progressively verifies the situation to reduce false alarms while ensuring real distress is never ignored.&rdquo;
            </blockquote>
          </div>

          {/* The 3-State Model */}
          <div className="space-y-3">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">
              The SAFEGRID 3-State Model
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-1">
                <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  🟢 SAFE
                </span>
                <p className="text-xs text-slate-300">
                  Expected safety signal received. User confirmed &ldquo;I&apos;M OK&rdquo; or completed safe commute.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-1">
                <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  🟡 ATTENTION
                </span>
                <p className="text-xs text-slate-300">
                  Anomalous condition or missed signal. Initiates verification &amp; grace period. Not an immediate emergency.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-rose-500/40 space-y-1">
                <span className="text-xs font-black text-rose-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  🔴 EMERGENCY
                </span>
                <p className="text-xs text-slate-300">
                  Manual SOS confirmed or unverified high-risk welfare concern passed escalation threshold.
                </p>
              </div>
            </div>
          </div>

          {/* Collapsible FAQ List (Jury Questions from Section 78) */}
          <div className="space-y-3">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">
              Essential Jury Questions &amp; Architectural Answers
            </h3>

            <div className="space-y-2">
              {JURY_QA_ITEMS.map((item, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60"
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : idx)}
                      className="w-full text-left p-4 flex items-center justify-between gap-3 hover:bg-slate-900/60 transition-colors"
                    >
                      <span className="font-bold text-xs text-white">Q: {item.question}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="p-4 pt-0 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 mt-2 bg-slate-950/80">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
