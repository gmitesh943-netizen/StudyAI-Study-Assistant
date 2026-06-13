"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/useToast";

export default function VoiceAssistant() {
  const { addToast } = useToast();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const recognitionRef = useRef<any>(null);
  const listeningRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const text = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join("");
      setTranscript(text);
      if (event.results[event.results.length - 1].isFinal) {
        setResponse(
          `Here's what I understood: "${text}". In demo mode, I would provide a spoken explanation. Connect the backend for full voice AI responses.`
        );
        listeningRef.current = false;
        setListening(false);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error !== "aborted") {
        addToast("Speech recognition error", "error");
      }
      listeningRef.current = false;
      setListening(false);
    };

    recognition.onend = () => {
      listeningRef.current = false;
      setListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      listeningRef.current = false;
      try {
        recognition.abort();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
    };
  }, [addToast]);

  const startListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      addToast("Speech recognition not supported in this browser", "error");
      return;
    }
    if (listeningRef.current) return;

    setTranscript("");
    setResponse("");

    try {
      recognition.start();
      listeningRef.current = true;
      setListening(true);
    } catch {
      // Already started — stop then retry once
      try {
        recognition.stop();
      } catch {
        /* ignore */
      }
      window.setTimeout(() => {
        try {
          recognition.start();
          listeningRef.current = true;
          setListening(true);
        } catch {
          addToast("Microphone is busy. Try again in a moment.", "error");
        }
      }, 300);
    }
  };

  const stopListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition || !listeningRef.current) return;
    try {
      recognition.stop();
    } catch {
      /* ignore */
    }
    listeningRef.current = false;
    setListening(false);
  };

  const toggle = () => {
    if (listeningRef.current) stopListening();
    else startListening();
  };

  const speak = () => {
    if (!response || typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(response);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <Card className="text-center py-12">
      <motion.div
        animate={listening ? { scale: [1, 1.1, 1] } : { scale: 1 }}
        transition={{ repeat: listening ? Infinity : 0, duration: 1.5 }}
        className={`mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full ${
          listening ? "bg-primary/20 ring-4 ring-primary/30" : "bg-primary/10"
        }`}
      >
        {listening ? (
          <Mic className="h-12 w-12 text-primary" />
        ) : (
          <MicOff className="h-12 w-12 text-muted" />
        )}
      </motion.div>

      <h2 className="text-xl font-bold mb-2">Voice Study Assistant</h2>
      <p className="text-muted text-sm mb-8 max-w-md mx-auto">
        Ask questions hands-free. Tap the microphone and speak your study question.
      </p>

      <Button onClick={toggle} size="lg" className="gap-2" disabled={!recognitionRef.current && typeof window !== "undefined"}>
        {listening ? <><MicOff className="h-5 w-5" /> Stop Listening</> : <><Mic className="h-5 w-5" /> Start Listening</>}
      </Button>

      {transcript && (
        <div className="mt-8 text-left max-w-lg mx-auto">
          <p className="text-sm font-medium mb-1">You said:</p>
          <p className="rounded-xl border border-border bg-card p-4 text-sm">{transcript}</p>
        </div>
      )}

      {response && (
        <div className="mt-4 text-left max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium">Response:</p>
            <Button variant="ghost" size="sm" onClick={speak} className="gap-1">
              <Volume2 className="h-4 w-4" /> Speak
            </Button>
          </div>
          <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted">{response}</p>
        </div>
      )}
    </Card>
  );
}
