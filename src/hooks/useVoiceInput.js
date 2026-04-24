import { useState, useRef, useCallback, useEffect } from 'react'

// ─────────────────────────────────────────────
//  useVoiceInput — Web Speech API Hook
//  Real-time speech-to-text for the query input.
//  Supports Chrome, Edge, Safari (partial).
//  Falls back gracefully with isSupported flag.
// ─────────────────────────────────────────────

export function useVoiceInput({ onTranscript, language = 'en-IN' }) {
  const [listening, setListening]   = useState(false)
  const [interim, setInterim]       = useState('')       // live preview while speaking
  const [supported, setSupported]   = useState(false)
  const recognitionRef = useRef(null)

  // ── Check browser support on mount ─────────
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setSupported(true)
    }
  }, [])

  // ── Start Listening ────────────────────────
  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    // Create fresh instance each time
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition

    recognition.lang = language
    recognition.interimResults = true    // Show live preview
    recognition.continuous = true        // Keep listening until manually stopped
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setListening(true)
      setInterim('')
    }

    recognition.onresult = (event) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      // Show live preview
      setInterim(interimTranscript)

      // Push final text to parent
      if (finalTranscript) {
        onTranscript?.(finalTranscript)
        setInterim('')
      }
    }

    recognition.onerror = (event) => {
      console.warn('[Voice] Error:', event.error)
      // Don't stop on 'no-speech' — user might just be thinking
      if (event.error !== 'no-speech') {
        setListening(false)
        setInterim('')
      }
    }

    recognition.onend = () => {
      setListening(false)
      setInterim('')
    }

    try {
      recognition.start()
    } catch (e) {
      console.error('[Voice] Start failed:', e)
      setListening(false)
    }
  }, [language, onTranscript])

  // ── Stop Listening ─────────────────────────
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setListening(false)
    setInterim('')
  }, [])

  // ── Toggle ─────────────────────────────────
  const toggleListening = useCallback(() => {
    if (listening) {
      stopListening()
    } else {
      startListening()
    }
  }, [listening, startListening, stopListening])

  // ── Cleanup on unmount ─────────────────────
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  return {
    listening,         // boolean — is mic currently active?
    interim,           // string  — real-time preview of what user is saying
    isSupported: supported,  // boolean — does this browser support Speech API?
    startListening,
    stopListening,
    toggleListening,
  }
}
