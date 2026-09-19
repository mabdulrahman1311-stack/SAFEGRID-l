import React, { useState } from 'react';
import { 
  X, 
  Shield, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  AlertTriangle, 
  Presentation, 
  BookOpen, 
  HelpCircle, 
  ListChecks, 
  Sparkles, 
  Copy, 
  ChevronRight, 
  ChevronLeft,
  Search,
  ExternalLink,
  Smartphone,
  Heart,
  MapPin,
  Users,
  Activity,
  Server,
  Lock,
  ArrowRight
} from 'lucide-react';
import { 
  PPT_SLIDES, 
  JURY_QA_MASTER, 
  WHAT_IF_SCENARIOS, 
  MASTER_PITCH_30S, 
  JURY_ONE_LINER, 
  TECHNICAL_ONE_LINER, 
  THE_FINAL_MESSAGE, 
  PRODUCT_PRINCIPLES 
} from '../../data/masterBlueprintData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'slides' | 'blueprint' | 'jury' | 'whatif' | 'pitch';
}

export const MasterBlueprintModal: React.FC<Props> = ({ isOpen, onClose, initialTab = 'slides' }) => {
  const [activeTab, setActiveTab] = useState<'slides' | 'blueprint' | 'jury' | 'whatif' | 'pitch'>(initialTab);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [openQIndex, setOpenQIndex] = useState<string | null>('q1');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentSlide = PPT_SLIDES[currentSlideIndex];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const filteredJuryQA = JURY_QA_MASTER.filter(
    item => item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
            item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredWhatIf = WHAT_IF_SCENARIOS.filter(
    item => item.scenario.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.systemResponse.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-5xl h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-amber-600 p-0.5 shadow-lg shadow-rose-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-rose-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base sm:text-lg text-white">SAFEGRID Master Blueprint &amp; Pitch Deck</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  93 Sections Verified
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Authoritative Project Source of Truth • 15-Slide Deck • Jury Defense Guide • Edge-Case Matrix
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="px-4 sm:px-6 pt-3 pb-2 border-b border-slate-800/80 bg-slate-950/40 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('slides')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'slides'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Presentation className="w-3.5 h-3.5" />
            <span>15-Slide Presentation Deck</span>
          </button>

          <button
            onClick={() => setActiveTab('jury')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'jury'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Jury Defense Q&amp;A (Sec. 78)</span>
          </button>

          <button
            onClick={() => setActiveTab('whatif')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'whatif'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ListChecks className="w-3.5 h-3.5" />
            <span>&ldquo;What If?&rdquo; Edge Matrix (Sec. 86)</span>
          </button>

          <button
            onClick={() => setActiveTab('pitch')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'pitch'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>30s Pitch &amp; One-Liners</span>
          </button>

          <button
            onClick={() => setActiveTab('blueprint')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'blueprint'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Full 93 Sections Explorer</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-slate-300">
          {/* TAB 1: 15-SLIDE PRESENTATION DECK */}
          {activeTab === 'slides' && (
            <div className="space-y-6">
              {/* Slide Navigator Controls */}
              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-rose-400 bg-rose-500/15 border border-rose-500/30 px-2.5 py-1 rounded-lg">
                    Slide {currentSlide.slideNumber} / 15
                  </span>
                  <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
                    {currentSlide.tag}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentSlideIndex === 0}
                    className="p-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Slide dropdown selector */}
                  <select
                    value={currentSlideIndex}
                    onChange={e => setCurrentSlideIndex(Number(e.target.value))}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-200 font-medium focus:outline-none"
                  >
                    {PPT_SLIDES.map((slide, idx) => (
                      <option key={idx} value={idx}>
                        Slide {slide.slideNumber}: {slide.title}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => setCurrentSlideIndex(prev => Math.min(PPT_SLIDES.length - 1, prev + 1))}
                    disabled={currentSlideIndex === PPT_SLIDES.length - 1}
                    className="p-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Main Presentation Slide Canvas */}
              <div className="relative min-h-[380px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col justify-between overflow-hidden">
                {/* Background accent watermark */}
                <div className="absolute right-6 top-6 opacity-5 pointer-events-none">
                  <Shield className="w-64 h-64 text-white" />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-rose-400">
                      Section 77 • Slide {currentSlide.slideNumber}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                    <span className="text-[11px] font-semibold text-slate-400">{currentSlide.tag}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {currentSlide.title}
                  </h3>
                  {currentSlide.subtitle && (
                    <p className="text-sm sm:text-base text-slate-300 font-medium mt-1">
                      {currentSlide.subtitle}
                    </p>
                  )}

                  {currentSlide.quote && (
                    <blockquote className="my-4 p-4 rounded-2xl bg-rose-500/10 border-l-4 border-rose-500 text-white font-semibold text-sm sm:text-base italic">
                      {currentSlide.quote}
                    </blockquote>
                  )}

                  {currentSlide.diagram && (
                    <div className="my-4 p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/40 text-center font-mono text-xs sm:text-sm font-bold text-emerald-300 tracking-wide overflow-x-auto">
                      {currentSlide.diagram}
                    </div>
                  )}

                  <ul className="mt-6 space-y-3">
                    {currentSlide.bulletPoints.map((bp, i) => (
                      <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-200">
                        <span className="w-2 h-2 rounded-full bg-rose-500 mt-2 shrink-0" />
                        <span className="leading-relaxed">{bp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>SAFEGRID Community Emergency-Response &amp; Welfare Platform</span>
                  <span className="font-mono">Slide {currentSlideIndex + 1} of {PPT_SLIDES.length}</span>
                </div>
              </div>

              {/* Slide Thumbnail Quick Nav */}
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-15 gap-1.5 pt-1">
                {PPT_SLIDES.map((slide, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`py-2 px-1 rounded-xl text-center text-xs font-bold transition-all border ${
                      currentSlideIndex === idx
                        ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/30'
                        : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border-slate-800'
                    }`}
                    title={slide.title}
                  >
                    {slide.slideNumber}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: JURY DEFENSE Q&A (SECTION 78) */}
          {activeTab === 'jury' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    <span>Section 78 • Crucial Jury Questions &amp; Authoritative Answers</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Defend the platform transparently with grounded technical and operational truth.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search jury answers..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                {filteredJuryQA.map(item => {
                  const isOpen = openQIndex === item.id;
                  return (
                    <div
                      key={item.id}
                      className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60 transition-colors"
                    >
                      <button
                        onClick={() => setOpenQIndex(isOpen ? null : item.id)}
                        className="w-full text-left p-4 flex items-center justify-between gap-3 hover:bg-slate-900/60 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0">
                            Q
                          </span>
                          <span className="font-bold text-xs sm:text-sm text-white">
                            {item.question}
                          </span>
                        </div>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="p-4 pt-1 border-t border-slate-800/80 bg-slate-900/40 text-xs sm:text-sm text-slate-200 leading-relaxed pl-13">
                          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-amber-200/90 font-medium">
                            {item.answer}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: "WHAT IF?" EDGE-CASE MATRIX (SECTION 86) */}
          {activeTab === 'whatif' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-blue-400" />
                    <span>Section 86 • The Complete &ldquo;What If?&rdquo; Failure-First Matrix</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    How SAFEGRID handles real-world failure, network loss, and edge conditions.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search scenarios..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredWhatIf.map(item => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-blue-500/40 transition-colors space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>{item.scenario}</span>
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-blue-300 shrink-0 font-semibold">
                        {item.stateTransition}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      <strong className="text-white">System Response: </strong>
                      {item.systemResponse}
                    </p>

                    <div className="pt-2 border-t border-slate-900 text-[11px] text-slate-400 italic">
                      <strong className="text-slate-300 not-italic">Boundary: </strong>
                      {item.limitationHonesty}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: 30-SECOND ELEVATOR PITCH & MASTER ONE-LINERS */}
          {activeTab === 'pitch' && (
            <div className="space-y-6">
              {/* 30-Second Elevator Pitch Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-rose-950/40 via-slate-950 to-slate-900 border border-rose-500/40 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-rose-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                      Section 80 • The 30-Second Elevator Pitch
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopy(MASTER_PITCH_30S, 'pitch30')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-200 border border-slate-700 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedText === 'pitch30' ? 'Copied!' : 'Copy Pitch'}</span>
                  </button>
                </div>

                <blockquote className="text-sm sm:text-base text-white font-medium italic leading-relaxed pl-4 border-l-4 border-rose-500">
                  &ldquo;{MASTER_PITCH_30S}&rdquo;
                </blockquote>
              </div>

              {/* Master One-Liners Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Jury-Level One-Liner */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                      Section 89 • Jury-Level One-Liner
                    </span>
                    <button
                      onClick={() => handleCopy(JURY_ONE_LINER, 'jury1')}
                      className="text-slate-400 hover:text-white p-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-sm font-bold text-white leading-snug">
                    &ldquo;{JURY_ONE_LINER}&rdquo;
                  </p>
                </div>

                {/* Technical One-Liner */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-blue-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                      Section 90 • Technical Architecture One-Liner
                    </span>
                    <button
                      onClick={() => handleCopy(TECHNICAL_ONE_LINER, 'tech1')}
                      className="text-slate-400 hover:text-white p-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-slate-200 leading-snug">
                    &ldquo;{TECHNICAL_ONE_LINER}&rdquo;
                  </p>
                </div>
              </div>

              {/* The Core Pipeline Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/40 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest">
                  Section 93 • The Final Core Message
                </span>
                <p className="font-mono text-sm sm:text-base font-black text-white tracking-wide">
                  {THE_FINAL_MESSAGE}
                </p>
              </div>

              {/* 8 Core Product Principles (Section 82) */}
              <div className="space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Section 82 • The 8 Product Principles
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {PRODUCT_PRINCIPLES.map(p => (
                    <div key={p.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-[10px]">
                          {p.id}
                        </span>
                        <span>{p.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        {p.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FULL 93 SECTIONS EXPLORER */}
          {activeTab === 'blueprint' && (
            <div className="space-y-6">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <h3 className="text-sm font-bold text-white">
                  SAFEGRID Master Specification &amp; Defense Blueprint (93 Sections)
                </h3>
                <p className="text-xs text-slate-400">
                  Structured breakdown covering problem, multi-layer signals, failure engineering, architecture, and deployment boundaries.
                </p>
              </div>

              {/* Key Sections Accordion / Cards */}
              <div className="space-y-4">
                {/* 1-3: Foundations */}
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400">
                    Sections 1–3: The Core Paradigm Shift
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Most emergency applications follow a simple model: <code className="text-rose-300">Danger → SOS → Response</code>. 
                    SAFEGRID addresses the real-world gap: seniors falling, children commuting, unconscious victims, and interrupted journeys where an SOS cannot be actively sent.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-900 text-xs font-mono text-emerald-400 border border-slate-800">
                    SAFETY SIGNAL → VERIFICATION → SAFETY STATE → ESCALATION → RESPONDER → RESOLUTION
                  </div>
                </div>

                {/* 4-5: Target Users */}
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                    Sections 4–5: Target User Segment Workflows
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <strong className="text-white block mb-1">👩 4.1 Women</strong>
                      Safe Journey, expected arrival monitoring, active safety sessions, trusted circle alerts.
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <strong className="text-white block mb-1">👧 4.2 Children</strong>
                      Guardian Safety Circle, School → Home automated journey check, guardian notification.
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <strong className="text-white block mb-1">👴 5.0 Seniors</strong>
                      Large high-contrast &ldquo;I&apos;M OK&rdquo; button, daily scheduled check-ins, welfare verification.
                    </div>
                  </div>
                </div>

                {/* 11-13: Offline & Dual Timestamps */}
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">
                    Sections 11–13: Offline Event Queue &amp; Dual Timestamps
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    A phone losing connectivity does NOT automatically mean kidnapping. Actions are queued locally. When connectivity restores, the system synchronizes both:
                  </p>
                  <div className="p-3 rounded-xl bg-slate-900 text-xs font-mono text-blue-300 border border-slate-800 flex items-center justify-between">
                    <span>eventCreatedAt (Local Time)</span>
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                    <span>eventReceivedAt (Server Timestamp)</span>
                  </div>
                </div>

                {/* 16-19: Responder Matching */}
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Sections 16–19: Verified Community Responders
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Responders are scored by Verification, Availability, Incident Suitability (e.g. medical training prioritized for senior pings), and Quadrant Distance.
                    Maintains the full lifecycle: <code className="text-white font-mono">ASSIGNED → ACCEPTED → EN_ROUTE → ARRIVED → RESOLVED</code>. Automatic reassign timeout if responder stalls.
                  </p>
                </div>

                {/* 67-68: Honest Limitations */}
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-rose-500/30 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400">
                    Sections 67–68: What We Do NOT Claim (Jury Credibility)
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    <li>❌ We do NOT claim software can diagnose heart attacks or medical conditions.</li>
                    <li>❌ We do NOT claim software can communicate through a completely smashed phone.</li>
                    <li>❌ We do NOT claim police are directly dispatched without municipal authorization.</li>
                    <li>❌ We do NOT claim AI predicts crime.</li>
                    <li>✅ We detect missing safety signals and responsibly initiate community welfare verification.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-rose-500" />
            <span className="font-semibold text-white">SAFEGRID</span>
            <span>• One community. Safer together.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
          >
            Close Blueprint
          </button>
        </div>
      </div>
    </div>
  );
};
