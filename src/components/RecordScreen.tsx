import { useEffect, useMemo, useState } from "react";
import { Mic, MicOff, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import AudioRecorder from "./RecordButton";
import  LoadScreen from "./LoadScreen";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import ReactMarkdown from "react-markdown";

const QUESTION_TIME = 30;

const QUESTIONS = [
  "Tell me about a challenging bug you fixed recently.",
  "How do you design an API for a AI interview backend with GCP?",
  "Explain how you’d optimize a React list",
  "What’s your approach to structuring an Express + Postgres codebase?",
];

export default function AIInterview() {
  const [micOn, setMicOn] = useState(false);
  const [seconds, setSeconds] = useState(QUESTION_TIME);
  const [evaluation, setEvaluation] = useState("");
  const [isCounting, setIsCounting] = useState(false);
  const [Description,setDescription]=useState(`Answer each question within ${QUESTION_TIME}s. Recording auto-stops at 0.`);

    const [loading,setLoading]=useState(false);

  const [qIndex, setQIndex] = useState(0);
  const question = useMemo(() => QUESTIONS[qIndex], [qIndex]);

  // A simple "tick" value that we bump to force-stop the child recorder
  const [forceStopTick, setForceStopTick] = useState(0);

  // Start the timer when recording starts
  const handleRecordingStart = () => {
    setSeconds(QUESTION_TIME);
    setIsCounting(true);
  };

  // Stop the timer when recording stops (manually or auto)
  const handleRecordingStop = () => {
    setIsCounting(false);
    setMicOn(false);
    setSeconds(0);
  };

  // Countdown effect
  useEffect(() => {
    if (!isCounting || !micOn) return;

    if (seconds <= 0) {
      // Auto-stop recording at 0
      setForceStopTick((t) => t + 1);
      setIsCounting(false);
      setMicOn(false);
      return;
    }

    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    
    return () => clearTimeout(id);
  }, [isCounting, micOn, seconds]);

  const goNext = () => {
    if (micOn) return; 

    setEvaluation("");
    setSeconds(QUESTION_TIME);
    setQIndex((i) => Math.min(i + 1, QUESTIONS.length - 1));
  };

  const isRecording = micOn;
const progressPct = Math.round(((qIndex + 1) / QUESTIONS.length) * 100);

  return (
    <div className="min-h-screen w-full bg-[#0b0d10] text-white">
      {/* Top bar */}
      <div className="border-b border-white/10">
       
        {/* Progress bar */}
        <div className="h-1 w-full bg-white/5">
    <div
      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-[width] duration-500 ease-out"
      style={{ width: `${progressPct}%` }}
      aria-valuenow={progressPct}
      aria-valuemin={0}
      aria-valuemax={100}
      role="progressbar"
    />
  </div>
      </div>

      {/* Main layout */}
      <main className="mx-auto max-w-[1200px] px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
        {/* Left primary panel */}
        <section className="rounded-2xl border border-white/10 bg-black/40 shadow-2xl shadow-black/40 overflow-hidden">
          {/* Timer & mic status area */}
          <div className="relative flex flex-col items-center justify-center gap-6 py-14 sm:py-16">
            <div className="text-sm uppercase tracking-widest text-white/60">Question {qIndex + 1} of {QUESTIONS.length}</div>
            <div className="px-6 text-center text-lg sm:text-xl text-white/80 max-w-3xl">{question}</div>

            <div className="text-[84px] sm:text-[112px] leading-none font-semibold tabular-nums">
              {seconds}
            </div>

            <div className="relative">
              <div className="rounded-full bg-white/5 p-4">
                {micOn ? <Mic className="h-12 w-12" /> : <MicOff className="h-12 w-12" />}
              </div>
              {isRecording && (
                <motion.span
                  initial={{ opacity: 0.6, scale: 1 }}
                  animate={{ opacity: [0.6, 0.1, 0.6], scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.6 }}
                  className="absolute inset-0 -z-10 rounded-full ring-8 ring-rose-500/20"
                />
              )}
            </div>
            <div className="text-lg text-white/70">{micOn ? "Mic is on" : "Mic is off"}</div>
          </div>

          {/* Transcript / evaluation box */}
        <div className="border-t border-white/10 bg-[#0a0c0f] p-5 sm:p-6">
  <div className="rounded-xl border border-white/10 bg-black/30 p-4 min-h-[160px] text-white/80 prose prose-invert max-w-none">
    {loading ? (
      <LoadScreen />
    ) : (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-white mt-4 mb-2" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-white mt-3 mb-1" {...props} />,
          strong: ({node, ...props}) => <strong className="text-rose-400" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-1" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-1" {...props} />,
          li: ({node, ...props}) => <li className="ml-2" {...props} />,
          p: ({node, ...props}) => <p className="leading-relaxed mb-2" {...props} />,
        }}
      >
        {evaluation || "Your AI interviewer's feedback will appear here after you record your answer."}
      </ReactMarkdown>
    )}
  </div>
</div>
        </section>

        {/* Right sidebar */}
        <aside className="rounded-2xl border border-white/10 bg-[#0f1216] p-5 sm:p-6 shadow-2xl shadow-black/40">
          <div className="text-xl font-semibold">AI Interviewer</div>
          <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-4 text-white/80 leading-relaxed">
            <p>{Description}</p>
          </div>

          {/* Controls */}
          <div className="mt-5 space-y-3">
            <AudioRecorder
              micOn={micOn}
              setMicOn={setMicOn}
              setEvaluation={setEvaluation}
              onRecordingStart={handleRecordingStart}
              onRecordingStop={handleRecordingStop}
              forceStopTick={forceStopTick}
              setDescription={setDescription}
              setLoading={setLoading}
              question={question}
              qIndex={qIndex}
            />
         
              <button
              onClick={goNext}
              disabled={micOn || qIndex === QUESTIONS.length - 1}
              className={`flex w-full items-center justify-center gap-3 rounded-xl px-4 py-3 text-base font-semibold focus-visible:outline-none focus-visible:ring-2 active:translate-y-[1px]
                ${micOn ? "bg-white/10 cursor-not-allowed" : "bg-sky-700/90 hover:bg-sky-600 focus-visible:ring-sky-400/60"}`}
              title={micOn ? "Stop recording before moving to the next question" : ""}
            >
              Next Question
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </aside>
      </main>

      {/* Footer hint */}
      <div className="pb-8" />
    </div>
  );
}
