"use client";

import styles from "./page.module.css";
import { useEffect, useMemo, useRef, useState } from "react";

export default function Home() {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");

  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState<string>("");
  const [mockBalance, setMockBalance] = useState<string>("");

  const mediaRecorderMimeType = useMemo(() => {
    const candidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/ogg",
    ];
    for (const c of candidates) {
      if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(c)) {
        return c;
      }
    }
    return "";
  }, []);

  async function refreshBalance() {
    setBalanceLoading(true);
    setBalanceError("");
    try {
      const res = await fetch("/api/balance");
      const data = (await res.json()) as
        | { balance?: string; error?: string; details?: string }
        | undefined;

      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to fetch balance");
      }

      setMockBalance(data?.balance ?? "");
    } catch (e) {
      setMockBalance("");
      setBalanceError(e instanceof Error ? e.message : "Failed to fetch balance");
    } finally {
      setBalanceLoading(false);
    }
  }

  useEffect(() => {
    void refreshBalance();
    return () => {
      try {
        recorderRef.current?.stop();
      } catch {}
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startRecording() {
    setError("");
    setStatus("");
    setTranscript("");

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("This browser doesn't support audio recording.");
      return;
    }
    if (typeof MediaRecorder === "undefined") {
      setError("This browser doesn't support MediaRecorder.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(
        stream,
        mediaRecorderMimeType ? { mimeType: mediaRecorderMimeType } : undefined,
      );
      recorderRef.current = recorder;

      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      recorder.onstart = () => {
        setIsRecording(true);
        setStatus("Recording…");
      };
      recorder.onstop = async () => {
        setIsRecording(false);
        setStatus("Processing audio…");

        const blob = new Blob(chunksRef.current, {
          type: mediaRecorderMimeType || "audio/webm",
        });

        if (audioUrl) URL.revokeObjectURL(audioUrl);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        try {
          setStatus("Transcribing…");
          const form = new FormData();
          const ext = blob.type.includes("ogg") ? "ogg" : "webm";
          form.set("audio", new File([blob], `recording.${ext}`, { type: blob.type }));

          const res = await fetch("/api/transcribe", { method: "POST", body: form });
          const data = (await res.json()) as { transcript?: string; error?: string };
          if (!res.ok) throw new Error(data.error ?? "Transcription failed");

          setTranscript(data.transcript ?? "");
          setStatus("Done.");
          void refreshBalance();
        } catch (e) {
          setStatus("");
          setError(e instanceof Error ? e.message : "Transcription failed");
        } finally {
          streamRef.current?.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
      };

      recorder.start();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start recording");
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  function stopRecording() {
    setError("");
    setStatus("Stopping…");
    try {
      recorderRef.current?.stop();
    } catch (e) {
      setStatus("");
      setError(e instanceof Error ? e.message : "Failed to stop recorder");
    }
  }

  async function copyTranscript() {
    setError("");
    try {
      await navigator.clipboard.writeText(transcript);
      setStatus("Copied to clipboard.");
      setTimeout(() => setStatus(""), 1200);
    } catch {
      setError("Copy failed (clipboard permission).");
    }
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Voice Notes Maker</h1>
            <p className={styles.subtitle}>
              Record in your browser, transcribe with Deepgram, keep plain text notes.
            </p>
          </div>

          <div className={styles.balanceCard}>
            <div className={styles.balanceRow}>
              <span className={styles.muted}>Wallet</span>
              <button
                className={styles.linkButton}
                onClick={refreshBalance}
                disabled={balanceLoading}
                type="button"
              >
                {balanceLoading ? "Refreshing…" : "Refresh"}
              </button>
            </div>
            {balanceError ? (
              <div className={styles.balanceError}>{balanceError}</div>
            ) : mockBalance ? (
              <div className={styles.balanceValue}>
                <div>
                  <span className={styles.amount}>{mockBalance}</span>
                </div>
              </div>
            ) : (
              <span className={styles.muted}>—</span>
            )}
          </div>
        </header>

        <section className={styles.card}>
          <div className={styles.controls}>
            <button
              className={styles.primaryButton}
              onClick={startRecording}
              disabled={isRecording}
              type="button"
            >
              Record
            </button>
            <button
              className={styles.secondaryButton}
              onClick={stopRecording}
              disabled={!isRecording}
              type="button"
            >
              Stop
            </button>
            <div className={styles.status}>
              {error ? <span className={styles.error}>{error}</span> : status || ""}
            </div>
          </div>

          <div className={styles.preview}>
            <span className={styles.muted}>Preview</span>
            {audioUrl ? (
              <audio className={styles.audio} controls src={audioUrl} />
            ) : (
              <div className={styles.placeholder}>
                {mediaRecorderMimeType
                  ? "Record something to preview and transcribe it."
                  : "This browser may not support a suitable audio format for recording."}
              </div>
            )}
          </div>

          <div className={styles.transcript}>
            <div className={styles.transcriptHeader}>
              <h2 className={styles.h2}>Transcript</h2>
              <button
                className={styles.secondaryButton}
                onClick={copyTranscript}
                disabled={!transcript}
                type="button"
              >
                Copy
              </button>
            </div>
            <textarea
              className={styles.textarea}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Your transcription will appear here…"
              rows={10}
            />
            <div className={styles.note}>
              No database: your note stays in the page as plain text.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
