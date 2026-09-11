import React, { useState, useEffect } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";

export default function VoiceInputButton({
  onSpeechTranscribed,
  currentLang = "en",
}) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang =
        { en: "en-IN", ta: "ta-IN", hi: "hi-IN" }[currentLang] || "en-IN";

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript && onSpeechTranscribed) {
          onSpeechTranscribed(transcript);
        }
        setIsListening(false);
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    } else {
      setIsSupported(false);
    }
  }, [onSpeechTranscribed, currentLang]);

  const toggleListening = () => {
    if (!isSupported) {
      alert(
        "Speech recognition API is supported in modern Chrome, Edge, and Safari browsers.",
      );
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  return (
    <button
      type="button"
      className={`voice-input-btn ${isListening ? "listening-active" : ""}`}
      onClick={toggleListening}
      title={
        isListening
          ? "Listening... Speak your request"
          : "Speak your request naturally"
      }
    >
      {isListening ? (
        <>
          <Loader2 size={16} className="spin-anim text-amber" />
          <span className="voice-label">Listening...</span>
        </>
      ) : (
        <>
          <Mic size={16} />
          <span className="voice-label">Voice</span>
        </>
      )}
    </button>
  );
}
