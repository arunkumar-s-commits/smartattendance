'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, AlertCircle, MapPin, Camera, QrCode } from 'lucide-react';

type ScanStep = 'scanning' | 'location' | 'face' | 'submitting' | 'success' | 'error';

interface QRSessionData {
  valid: boolean;
  sessionId: string;
  activationTime: string;
  expiryTime: string;
  latitude: number;
  longitude: number;
  allowedRadius: number;
}

export default function StudentScanPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [step, setStep] = useState<ScanStep>('scanning');
  const [error, setError] = useState('');
  const [qrSession, setQrSession] = useState<QRSessionData | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'getting' | 'got' | 'error'>('idle');
  const [faceApiLoaded, setFaceApiLoaded] = useState(false);
  const [faceStatus, setFaceStatus] = useState<'idle' | 'detecting' | 'captured' | 'error'>('idle');
  const [faceEmbedding, setFaceEmbedding] = useState<number[] | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [scannerReady, setScannerReady] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const faceapi = await import('face-api.js');
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        ]);
        setFaceApiLoaded(true);
      } catch (err) {
        console.error('Face models failed:', err);
      }
    };
    loadModels();
  }, []);

  const stopFaceCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startFaceCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      setError('Could not access front camera for face verification.');
      setStep('error');
    }
  }, []);

  const getUserLocation = useCallback((): Promise<{ lat: number; lon: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported by your browser.'));
        return;
      }
      setLocationStatus('getting');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          setUserLocation(loc);
          setLocationStatus('got');
          resolve(loc);
        },
        (err) => {
          setLocationStatus('error');
          let msg = 'Could not get your location.';
          if (err.code === 1) msg = 'Location permission denied. Please allow location access.';
          else if (err.code === 2) msg = 'Location unavailable. Ensure GPS is enabled.';
          else if (err.code === 3) msg = 'Location request timed out.';
          reject(new Error(msg));
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  }, []);

  const handleQRScanned = useCallback(async (scannedData: string) => {
    try {
      const parsed = JSON.parse(scannedData);
      if (!parsed.sessionId) throw new Error('Invalid QR code format.');

      const res = await fetch(`/api/qr/${parsed.sessionId}`);
      const data = await res.json();

      if (!res.ok || !data.valid) {
        setError(data.error || 'This QR code has expired or is invalid.');
        setStep('error');
        return;
      }

      setQrSession(data);
      setStep('location');

      let loc: { lat: number; lon: number };
      try {
        loc = await getUserLocation();
      } catch (err: any) {
        setError(err.message || 'Location verification failed.');
        setStep('error');
        return;
      }

      setStep('face');
      setTimeout(() => {
        startFaceCamera();
      }, 300);
    } catch {
      setError('Invalid attendance QR code. Please scan the official code.');
      setStep('error');
    }
  }, [getUserLocation, startFaceCamera]);

  useEffect(() => {
    if (step !== 'scanning') return;

    let scanner: any = null;
    let cancelled = false;

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (cancelled) return;

        scanner = new Html5Qrcode('qr-reader-container');
        setScannerReady(true);

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          async (decodedText: string) => {
            try { await scanner.stop(); } catch { /* ignore */ }
            handleQRScanned(decodedText);
          },
          () => {}
        );
      } catch (err: any) {
        if (!cancelled) {
          setError('Camera error: ' + (err.message || 'Could not start QR scanner.'));
          setStep('error');
        }
      }
    };

    const timer = setTimeout(startScanner, 200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (scanner) {
        try { scanner.stop(); } catch { /* ignore */ }
      }
    };
  }, [step, handleQRScanned]);

  const captureFace = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    setFaceStatus('detecting');

    try {
      const faceapi = await import('face-api.js');
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setFaceStatus('error');
        setError('No face detected. Look directly at the camera in good lighting.');
        return;
      }

      const descriptor = Array.from(detection.descriptor);
      setFaceEmbedding(descriptor);
      setFaceStatus('captured');
      stopFaceCamera();
      submitAttendance(descriptor);
    } catch {
      setFaceStatus('error');
      setError('Face verification failed. Please try again.');
    }
  };

  const submitAttendance = async (descriptor: number[]) => {
    setStep('submitting');
    try {
      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: qrSession?.sessionId,
          latitude: userLocation?.lat,
          longitude: userLocation?.lon,
          faceEmbedding: descriptor,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Attendance check-in failed.');
        setStep('error');
        return;
      }

      setSuccessMsg(data.message || 'Attendance marked successfully.');
      setStep('success');
    } catch {
      setError('Network error while marking attendance.');
      setStep('error');
    }
  };

  const stepLabels = ['Scan QR', 'GPS Check', 'Face Verify', 'Confirmed'];
  const currentStepIdx =
    step === 'scanning' ? 0 :
    step === 'location' ? 1 :
    step === 'face' ? 2 :
    step === 'submitting' ? 2 :
    step === 'success' ? 3 : 0;

  return (
    <div className="student-auth-page" style={{ alignItems: 'flex-start', paddingTop: 40, paddingBottom: 60 }}>
      <div style={{ maxWidth: 520, width: '100%', margin: '0 auto' }}>
        <Link href="/student/dashboard" className="back-link">
          <ArrowLeft size={14} /> Back to Student Dashboard
        </Link>

        {/* Step Progress Tracker */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28, background: '#ffffff', padding: '16px 20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          {stepLabels.map((label, i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < stepLabels.length - 1 ? 1 : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  border: `2px solid ${i <= currentStepIdx ? '#2563eb' : '#cbd5e1'}`,
                  background: i < currentStepIdx ? '#2563eb' : i === currentStepIdx ? '#eff6ff' : '#ffffff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 12,
                  color: i < currentStepIdx ? 'white' : i === currentStepIdx ? '#2563eb' : '#94a3b8',
                }}>
                  {i < currentStepIdx ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 11, color: i <= currentStepIdx ? '#0f172a' : '#94a3b8', fontWeight: 600 }}>{label}</span>
              </div>
              {i < stepLabels.length - 1 && (
                <div style={{ height: 2, flex: 1, background: i < currentStepIdx ? '#2563eb' : '#e2e8f0', margin: '0 8px', marginBottom: 14 }} />
              )}
            </div>
          ))}
        </div>

        {/* ── Step: Scanning ── */}
        {step === 'scanning' && (
          <div className="card">
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ width: 52, height: 52, background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#2563eb' }}>
                <QrCode size={26} />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Scan Classroom QR Code</h2>
              <p style={{ fontSize: 13, color: '#64748b' }}>Point your camera at the attendance QR code displayed by your teacher</p>
            </div>
            {!scannerReady && (
              <div className="alert alert-info" style={{ marginBottom: 14 }}>
                <div className="spinner" style={{ width: 15, height: 15 }} />
                <span>Initializing camera scanner...</span>
              </div>
            )}
            {error && (
              <div className="alert alert-danger" style={{ marginBottom: 14 }}>
                <AlertCircle size={15} /> <span>{error}</span>
              </div>
            )}
            <div id="qr-reader-container" style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #cbd5e1' }} />
          </div>
        )}

        {/* ── Step: Location ── */}
        {step === 'location' && (
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ width: 60, height: 60, background: '#fef3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#d97706' }}>
              <MapPin size={30} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Verifying Classroom Geofence</h2>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>
              Checking your GPS coordinates against classroom location...
            </p>
            <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto' }} />
          </div>
        )}

        {/* ── Step: Face Verification ── */}
        {step === 'face' && (
          <div className="card">
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ width: 52, height: 52, background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#2563eb' }}>
                <Camera size={26} />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Face Biometric Verification</h2>
              <p style={{ fontSize: 13, color: '#64748b' }}>Look at the camera and click Verify Face</p>
            </div>

            <div className="camera-frame" style={{ marginBottom: 16 }}>
              <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay muted playsInline />
              <div className="face-overlay"><div className="face-oval" /></div>
            </div>
            <canvas ref={canvasRef} hidden />

            {faceStatus === 'error' && error && (
              <div className="alert alert-danger" style={{ marginBottom: 12 }}>
                <AlertCircle size={15} /> <span>{error}</span>
              </div>
            )}

            {faceStatus === 'detecting' ? (
              <div className="alert alert-info">
                <div className="spinner" style={{ width: 15, height: 15 }} />
                <span>Matching face with registered biometric profile...</span>
              </div>
            ) : (
              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                onClick={captureFace}
                disabled={!faceApiLoaded}
                id="verify-face-btn"
              >
                <Camera size={16} />
                {faceApiLoaded ? 'Verify Face & Mark Attendance' : 'Loading models...'}
              </button>
            )}

            {faceStatus === 'error' && (
              <button
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: 8 }}
                onClick={() => {
                  setFaceStatus('idle');
                  setError('');
                  if (!streamRef.current) startFaceCamera();
                }}
              >
                Try Again
              </button>
            )}
          </div>
        )}

        {/* ── Step: Submitting ── */}
        {step === 'submitting' && (
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Submitting Check-in</h2>
            <p style={{ fontSize: 14, color: '#64748b' }}>Recording attendance into database...</p>
          </div>
        )}

        {/* ── Step: Success ── */}
        {step === 'success' && (
          <div className="card" style={{ textAlign: 'center', padding: 36 }}>
            <div style={{ width: 68, height: 68, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', color: '#16a34a' }}>
              <CheckCircle size={38} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#15803d', marginBottom: 6 }}>Attendance Recorded!</h2>
            <p style={{ fontSize: 15, color: '#334155', marginBottom: 4 }}>You have been marked <strong>PRESENT</strong> for this session.</p>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>{successMsg}</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
              {[
                { label: 'QR Code', icon: '✓ Valid' },
                { label: 'Geofence', icon: '✓ In Range' },
                { label: 'Face ID', icon: '✓ Match' },
              ].map(item => (
                <div key={item.label} style={{
                  background: '#f8fafc', border: '1px solid #e2e8f0',
                  borderRadius: 8, padding: '10px 8px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 13, color: '#16a34a', fontWeight: 700 }}>{item.icon}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{item.label}</div>
                </div>
              ))}
            </div>

            <Link href="/student/dashboard" className="btn btn-primary" style={{ width: '100%' }}>
              Return to Student Dashboard
            </Link>
          </div>
        )}

        {/* ── Step: Error ── */}
        {step === 'error' && (
          <div className="card" style={{ textAlign: 'center', padding: 36 }}>
            <div style={{ width: 64, height: 64, background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#dc2626' }}>
              <AlertCircle size={32} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#b91c1c', marginBottom: 8 }}>Attendance Verification Failed</h2>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>{error}</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                className="btn btn-primary"
                onClick={() => { setStep('scanning'); setError(''); setFaceStatus('idle'); setFaceEmbedding(null); setScannerReady(false); }}
                id="retry-scan-btn"
              >
                Scan Again
              </button>
              <Link href="/student/dashboard" className="btn btn-secondary">Dashboard</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
