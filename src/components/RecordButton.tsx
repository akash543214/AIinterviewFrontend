import { ChevronRight, Mic, MicOff } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

type AudioRecorderProps = {
  micOn: boolean;
  setMicOn: React.Dispatch<React.SetStateAction<boolean>>;
  setEvaluation: React.Dispatch<React.SetStateAction<string>>;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  question: string;
  /** bump this number to force the recorder to stop (e.g., when timer hits 0) */
  forceStopTick?: number;
  qIndex: number;
};

const AudioRecorder = ({
  micOn,
  setMicOn,
  setEvaluation,
  onRecordingStart,
  onRecordingStop,
  setDescription,
  setLoading,
  question,
  forceStopTick = 0,
  qIndex
}: AudioRecorderProps) => {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mimeType = MediaRecorder.isTypeSupported("audio/ogg; codecs=opus")
        ? "audio/ogg; codecs=opus"
        : "audio/webm; codecs=opus";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blobType = mediaRecorder.mimeType; 
        const extension = blobType.includes("ogg") ? "ogg" : "webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: blobType });

        stream.getTracks().forEach((t) => t.stop());

        setLoading(true);
        try {

          const formData = new FormData();
          formData.append("file", audioBlob, `recording.${extension}`);
            formData.append("question", question); 

          const response = await fetch("http://localhost:3000/api/transcribe", {
            method: "POST",
            body: formData,
          });

          const data = await response.json();
          setEvaluation(data?.result ?? "");
        } catch (err) {
          console.error("Upload error:", err);
        } finally {
          setRecording(false);
          onRecordingStop?.();
          setLoading(false);
        }
      };

      mediaRecorder.start();
      setRecording(true);
      setMicOn(true);
      onRecordingStart?.();
    } catch (err) {
      console.error("Error starting recording:", err);
    }
  };

  const stopRecording = () => {
    // Safe-guard: only stop if  actually recording
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
    } else {
      // If for some reason there no active MediaRecorder, still run stop callbacks
      setRecording(false);
      onRecordingStop?.();
      setMicOn(false);
    }
  };

  // External force stop
  useEffect(() => {
    if (recording) {
      stopRecording();
    }
  }, [forceStopTick]);

  const handleClick = () => {

   // console.log("handleClick called, recording:");
    if (recording) {
      setMicOn(false);
      stopRecording();

      console.log(qIndex);
       if(qIndex===3){
        setDescription("Thank you for completing all the questions! Interview is now complete.");
      }
    } else {
      startRecording();
    }
  };

  const handleEndSession = () => {

    if (recording) {
      setMicOn(false);
      stopRecording();

      if(qIndex===3){
        setDescription("Thank you for completing all the questions! Interview is now complete.");
      }
    } 
  };

  return (
    <>
    <button
      onClick={handleClick}
      className="group flex w-full items-center justify-center gap-3 rounded-xl bg-[#22c55e] px-4 py-3 text-base text-black font-semibold hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 active:translate-y-[1px]"
    >
      {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
      {micOn ? "Stop Recording" : "Record Answer"}
    </button>
       <button
        onClick={handleEndSession}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-rose-600/90 px-4 py-3 text-base font-semibold hover:bg-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60 active:translate-y-[1px]"
            >
              End Session & Get Feedback
              <ChevronRight className="h-5 w-5" />
            </button>
    </>
  );
};

export default AudioRecorder;
