'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, Camera, Upload, CheckCircle, AlertCircle, ArrowLeft, X, User } from 'lucide-react';

const DEPARTMENTS = [
  'Artificial Intelligence & Data Science',
  'Computer Science Engineering',
  'Information Technology',
  'Electronics and Communication Engineering',
  'Electrical and Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
];

type Step = 'photo' | 'info' | 'processing' | 'done';

export default function StudentRegisterPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('photo');
  const [cameraActive, setCameraActive] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [faceEmbedding, setFaceEmbedding] = useState<number[] | null>(null);
  const [faceStatus, setFaceStatus] = useState<'idle' | 'detecting' | 'found' | 'error'>('idle');
  const [faceError, setFaceError] = useState('');
  const [faceApiLoaded, setFaceApiLoaded] = useState(false);
  const [streamRef, setStreamRef] = useState<MediaStream | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Creating Account...');
  const [error, setError] = useState('');
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadModels = async () => {
      try {
        const faceapi = await import('face-api.js');
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        ]);
        if (mounted) setFaceApiLoaded(true);
      } catch (err) {
        console.error('Failed to load face models:', err);
        if (mounted) setFaceError('Failed to load AI face models. Refresh the page.');
      }
    };
    loadModels();
    return () => { mounted = false; };
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef) {
      streamRef.getTracks().forEach(t => t.stop());
      setStreamRef(null);
    }
    setCameraActive(false);
  }, [streamRef]);

  const startCamera = async () => {
    try {
      setFaceError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
      });
      setStreamRef(stream);
      setCameraActive(true);

      // Wait for React to render the <video> element, then attach the stream
      const attachStream = (retries = 10) => {
        if (videoRef.current) {
          const video = videoRef.current;
          video.srcObject = stream;
          video.onloadedmetadata = () => {
            video.play().catch(() => {
              // autoplay blocked — muted + playsInline should handle this
            });
          };
          // Fallback: if loadedmetadata already fired
          if (video.readyState >= 2) {
            video.play().catch(() => {});
          }
        } else if (retries > 0) {
          setTimeout(() => attachStream(retries - 1), 50);
        }
      };
      attachStream();
    } catch (err) {
      console.error('Camera error:', err);
      setFaceError('Could not access camera. Please allow camera permissions or upload a photo.');
    }
  };

  const processImageForFace = async (imageElement: HTMLImageElement | HTMLVideoElement) => {
    setFaceStatus('detecting');
    setFaceError('');
    try {
      const faceapi = await import('face-api.js');
      const detection = await faceapi
        .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setFaceStatus('error');
        setFaceError('No face detected. Please face the camera directly with good lighting.');
        return false;
      }

      setFaceEmbedding(Array.from(detection.descriptor));
      setFaceStatus('found');
      return true;
    } catch (err) {
      console.error(err);
      setFaceStatus('error');
      setFaceError('Face detection error. Please try another photo.');
      return false;
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setPhotoDataUrl(dataUrl);
    stopCamera();

    const img = new Image();
    img.src = dataUrl;
    img.onload = () => processImageForFace(img);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    stopCamera();
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPhotoDataUrl(dataUrl);
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => processImageForFace(img);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faceEmbedding || !photoDataUrl) {
      setError('Please take or upload a photo with your face first.');
      return;
    }
    if (!consent) {
      setError('Please accept the biometric data consent.');
      return;
    }

    setError('');
    setLoading(true);
    setLoadingMsg('Creating Account...');
    // Show escalating messages so user knows server is waking up
    const t1 = setTimeout(() => setLoadingMsg('Connecting to server...'), 5000);
    const t2 = setTimeout(() => setLoadingMsg('Server is waking up, please wait...'), 15000);
    const t3 = setTimeout(() => setLoadingMsg('Almost there... (Render cold-start ~30s)'), 28000);
    const clearTimers = () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };

    // Compress photo to reduce payload size (base64 can be very large)
    const compressPhoto = (dataUrl: string, quality = 0.6): Promise<string> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX = 480;
          const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;
          canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = dataUrl;
      });
    };

    try {
      const compressedPhoto = await compressPhoto(photoDataUrl);

      // 60-second timeout — Render free tier can take 15-30s to cold-start
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const res = await fetch('/api/student/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          name,
          email,
          mobile,
          department,
          photo: compressedPhoto,
          faceEmbedding,
        }),
      });
      clearTimeout(timeoutId);
      clearTimers();

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed.');
        return;
      }

      setStep('done');
    } catch (err: unknown) {
      clearTimers();
      if (err instanceof Error && err.name === 'AbortError') {
        setError('⏱ Server took too long to respond. The backend is waking up — please wait 30 seconds and try again.');
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
      setLoadingMsg('Creating Account...');
    }
  };

  if (step === 'done') {
    return (
      <div className="student-auth-page">
        <div className="student-auth-card" style={{ textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, background: '#dcfce7', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
            color: '#15803d',
          }}>
            <CheckCircle size={36} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
            Registration Successful!
          </h2>
          <p style={{ fontSize: 14, color: '#475569', marginBottom: 24, lineHeight: 1.6 }}>
            Welcome, <strong>{name}</strong>! Your facial biometric profile has been verified and registered. You can now log in using your mobile number.
          </p>
          <button
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            onClick={() => router.push('/student/login')}
            id="go-to-login-btn"
          >
            Go to Student Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="student-auth-page" style={{ alignItems: 'flex-start', paddingTop: 40, paddingBottom: 60 }}>
      <div style={{ maxWidth: 560, width: '100%', margin: '0 auto' }}>
        <Link href="/student/login" className="back-link">
          <ArrowLeft size={14} /> Back to Sign In
        </Link>

        <div className="student-auth-card">
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 52, height: 52, background: '#eff6ff', border: '1px solid #bfdbfe',
              borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px', color: '#2563eb',
            }}>
              <GraduationCap size={28} />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>
              Student Registration
            </h1>
            <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
              Register your face ID for attendance verification
            </p>
          </div>

          {/* ─── STEP 1: Photo ─── */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: faceStatus === 'found' ? '#dcfce7' : '#eff6ff',
                border: `1.5px solid ${faceStatus === 'found' ? '#16a34a' : '#2563eb'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: faceStatus === 'found' ? '#15803d' : '#2563eb',
              }}>
                {faceStatus === 'found' ? '✓' : '1'}
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                Face Photo Registration
              </h3>
            </div>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16, paddingLeft: 36 }}>
              Position your face clearly within good lighting. One face per photo.
            </p>

            {!faceApiLoaded && (
              <div className="alert alert-info" style={{ marginBottom: 14 }}>
                <div className="spinner" style={{ width: 15, height: 15 }} />
                <span>Loading face detection AI models...</span>
              </div>
            )}

            {photoDataUrl && faceStatus === 'found' ? (
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img
                    src={photoDataUrl}
                    alt="Captured face"
                    style={{ width: 140, height: 140, objectFit: 'cover', borderRadius: 12, border: '3px solid #16a34a' }}
                  />
                  <button
                    onClick={() => { setPhotoDataUrl(null); setFaceEmbedding(null); setFaceStatus('idle'); }}
                    style={{
                      position: 'absolute', top: -8, right: -8, background: '#dc2626',
                      border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    title="Remove Photo"
                  >
                    <X size={12} color="white" />
                  </button>
                </div>
                <div className="alert alert-success" style={{ marginTop: 12 }}>
                  <CheckCircle size={16} /> <span>Face detected and biometric descriptor saved!</span>
                </div>
              </div>
            ) : cameraActive ? (
              <div>
                <div className="camera-frame" style={{ marginBottom: 14 }}>
                  <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay muted playsInline />
                  <div className="face-overlay"><div className="face-oval" /></div>
                </div>
                <canvas ref={canvasRef} hidden />

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    onClick={capturePhoto}
                    id="snap-btn"
                  >
                    <Camera size={16} /> Take Selfie
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={stopCamera}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {faceError && (
                  <div className="alert alert-danger" style={{ marginBottom: 12 }}>
                    <AlertCircle size={16} /> <span>{faceError}</span>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    onClick={startCamera}
                    disabled={!faceApiLoaded}
                    id="open-camera-btn"
                  >
                    <Camera size={16} /> Use Web Camera
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!faceApiLoaded}
                    id="upload-photo-btn"
                  >
                    <Upload size={16} /> Upload Photo
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ─── STEP 2: Info ─── */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: '#eff6ff', border: '1.5px solid #2563eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: '#2563eb',
              }}>
                2
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                Student Details
              </h3>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {error && (
                <div className="alert alert-danger">
                  <AlertCircle size={16} /> <span>{error}</span>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  id="fullname"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">College Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="student@college.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  id="reg-email"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Mobile Number <span style={{ color: '#64748b', fontWeight: 400 }}>(used as sign-in password)</span>
                </label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="10-digit mobile number"
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  required
                  maxLength={10}
                  id="mobile"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Department</label>
                <select
                  className="form-input form-select"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  required
                  id="department"
                >
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              {/* Consent */}
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: 14, border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'flex', gap: 10, cursor: 'pointer', alignItems: 'flex-start' }}>
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={e => setConsent(e.target.checked)}
                    id="consent"
                    style={{ marginTop: 3, flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                    I consent to my photo and facial biometric descriptor being used exclusively for classroom attendance validation.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: 8 }}
                disabled={loading || faceStatus !== 'found' || !consent}
                id="register-btn"
              >
                {loading ? <span className="spinner" style={{ borderTopColor: 'white' }} /> : null}
                {loading ? loadingMsg : 'Complete Registration'}
              </button>

              {faceStatus !== 'found' && (
                <p style={{ textAlign: 'center', fontSize: 13, color: '#64748b' }}>
                  Please complete Step 1 (face photo) before submitting.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
