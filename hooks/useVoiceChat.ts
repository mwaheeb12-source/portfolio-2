"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseVoiceChatProps {
  onMessageSent?: (msg: string) => void;
  onRobotReply?: (reply: string) => void;
}

export function useVoiceChat({ onMessageSent, onRobotReply }: UseVoiceChatProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        setTranscript('');
      };

      recognition.onresult = (event: any) => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);

        silenceTimerRef.current = setTimeout(() => {
          recognition.stop();
        }, 1500);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        setError(`Mic error: ${event.error}`);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Failed to start listening", e);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const playTTS = useCallback((text: string, onStart?: () => void, onEnd?: () => void) => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    const audioUrl = `/api/tts?text=${encodeURIComponent(text)}`;
    const audio = new Audio(audioUrl);
    currentAudioRef.current = audio;

    audio.onplay = () => { if (onStart) onStart(); };
    audio.onended = () => { if (onEnd) onEnd(); };
    audio.onerror = (e) => {
      console.error("TTS Audio Error:", e);
      if (onEnd) onEnd();
    };

    audio.play().catch(e => {
      console.error("Audio playback failed", e);
      if (onEnd) onEnd();
    });
  }, []);

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;
    
    if (onMessageSent) onMessageSent(message);
    setTranscript('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      const data = await res.json();

      if (res.ok && data.reply) {
        if (onRobotReply) onRobotReply(data.reply);
        // Automatic TTS removed as requested
      } else {
        setError(data.error || 'Failed to fetch AI response');
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    sendMessage,
    playTTS
  };
}
