'use client';

import { useState, useEffect, useRef } from 'react';
import TeacherNav from '@/components/TeacherNav';
import { QrCode, MapPin, Clock, CheckCircle, AlertCircle, RefreshCw, Database, Zap } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface QRSession {
  sessionId: string;
  activationTime: string;
  expiryTime: string;
  latitude: number;
  longitude: number;
  allowedRadius: number;
}

type QRStatus = 'not_started' | 'active' | 'expired';

export default function QRGeneratorPage() {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radius, setRadius] = useState('50');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrSession, setQrSession] = useState<QRSession | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [qrStatus, setQrStatus] = useState<QRStatus>('not_started');
  const [countdown, setCountdown] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const now = new Date();
    const end = new Date(now.getTime() + 10 * 60 * 1000);
    const toLocal = (d: Date) => {
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    setStartTime(toLocal(now));
    setEndTime(toLocal(end));
  }, []);

  useEffect(() => {
    if (!qrSession) return;
    const update = () => {
      const now = new Date();
      const activation = new Date(qrSession.activationTime);
      const expiry = new Date(qrSession.expiryTime);
      if (now < activation) {
        setQrStatus('not_started');
        const diff = activation.getTime() - now.getTime();
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setCountdown(`Starts in ${m}m ${s}s`);
      } else if (now > expiry) {
        setQrStatus('expired');
        setCountdown('Expired');
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        setQrStatus('active');
        const diff = expiry.getTime() - now.getTime();
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setCountdown(`Expires in ${m}m ${s}s`);
      }
    };
    update();
    timerRef.current = setInterval(update, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [qrSession]);

  const getLocation = () => {
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        setGettingLocation(false);
      },
      () => {
        setError('Could not access device location. Please enter coordinates manually.');
        setGettingLocation(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/qr/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activationTime: new Date(startTime).toISOString(),
          expiryTime: new Date(endTime).toISOString(),
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          allowedRadius: parseFloat(radius),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to generate QR session'); return; }
      setQrSession(data);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const statusColor = qrStatus === 'active' ? '#059669' : qrStatus === 'expired' ? '#dc2626' : '#d97706';

  return (
    <TeacherNav>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0',
            borderRadius: 999, padding: '3px 10px', marginBottom: 8,
          }}>
            <Database size={12} color="#059669" />
            <span style={{ fontSize: 11, color: '#047857', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>QR Session Generation</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
            Generate Attendance QR
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
            Create dynamic, time-limited, and GPS-geofenced QR codes for students to scan in the frontend.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
          {/* Configuration Form Card */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 26,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={17} color="#059669" /> Session Parameters
            </h3>

            <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {error && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px', backgroundColor: '#fee2e2',
                  border: '1px solid #fecaca', borderRadius: 8,
                  color: '#b91c1c', fontSize: 13,
                }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {/* Time Window */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 8 }}>
                  <Clock size={15} color="#2563eb" /> Active Time Window
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }}>Start Time</label>
                    <input
                      type="datetime-local"
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                      required
                      id="start-time"
                      style={{
                        width: '100%', padding: '9px 12px', borderRadius: 8,
                        border: '1px solid #cbd5e1', backgroundColor: '#ffffff',
                        color: '#0f172a', fontSize: 13, outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }}>End Time</label>
                    <input
                      type="datetime-local"
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                      required
                      id="end-time"
                      style={{
                        width: '100%', padding: '9px 12px', borderRadius: 8,
                        border: '1px solid #cbd5e1', backgroundColor: '#ffffff',
                        color: '#0f172a', fontSize: 13, outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Classroom Geofencing */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155' }}>
                    <MapPin size={15} color="#059669" /> Classroom GPS Geofence
                  </label>
                  <button
                    type="button"
                    onClick={getLocation}
                    disabled={gettingLocation}
                    id="get-location-btn"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '5px 10px', borderRadius: 6,
                      backgroundColor: '#eff6ff', border: '1px solid #bfdbfe',
                      color: '#1d4ed8', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    {gettingLocation ? (
                      <><RefreshCw size={12} className="animate-spin" /> Locating...</>
                    ) : (
                      <><MapPin size={12} /> Auto-Detect GPS</>
                    )}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }}>Latitude</label>
                    <input
                      type="number" step="any"
                      placeholder="e.g. 11.0168"
                      value={latitude}
                      onChange={e => setLatitude(e.target.value)}
                      required
                      id="latitude"
                      style={{
                        width: '100%', padding: '9px 12px', borderRadius: 8,
                        border: '1px solid #cbd5e1', backgroundColor: '#ffffff',
                        color: '#0f172a', fontSize: 13, outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }}>Longitude</label>
                    <input
                      type="number" step="any"
                      placeholder="e.g. 76.9558"
                      value={longitude}
                      onChange={e => setLongitude(e.target.value)}
                      required
                      id="longitude"
                      style={{
                        width: '100%', padding: '9px 12px', borderRadius: 8,
                        border: '1px solid #cbd5e1', backgroundColor: '#ffffff',
                        color: '#0f172a', fontSize: 13, outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }}>
                    Allowed Radius (meters)
                  </label>
                  <input
                    type="number"
                    value={radius}
                    onChange={e => setRadius(e.target.value)}
                    min="10" max="500"
                    id="radius"
                    style={{
                      width: '100%', padding: '9px 12px', borderRadius: 8,
                      border: '1px solid #cbd5e1', backgroundColor: '#ffffff',
                      color: '#0f172a', fontSize: 13, outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                  <span style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, display: 'block' }}>
                    Students must be within {radius} meters of this coordinate to verify.
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                id="generate-qr-btn"
                style={{
                  backgroundColor: '#059669', color: '#ffffff',
                  fontWeight: 600, fontSize: 14, padding: '11px',
                  borderRadius: 8, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1, marginTop: 4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <QrCode size={18} />}
                {loading ? 'Generating QR Session...' : 'Generate Attendance QR'}
              </button>
            </form>
          </div>

          {/* QR Display Card */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 26,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
              <QrCode size={17} color="#059669" /> Active QR Display
            </h3>

            {!qrSession ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  width: 80, height: 80, backgroundColor: '#f8fafc',
                  borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16, border: '2px dashed #cbd5e1', color: '#94a3b8',
                }}>
                  <QrCode size={36} />
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>No Active QR Generated</p>
                <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Configure session parameters to launch a live code.</p>
              </div>
            ) : (
              <>
                {/* Status banner */}
                <div style={{ marginBottom: 16, width: '100%' }}>
                  {qrStatus === 'not_started' && (
                    <div style={{ padding: '10px 14px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, color: '#b45309', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Clock size={16} />
                      <div><strong>Scheduled:</strong> {countdown}</div>
                    </div>
                  )}
                  {qrStatus === 'active' && (
                    <div style={{ padding: '10px 14px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 8, color: '#047857', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle size={16} />
                      <div><strong>Active Session:</strong> {countdown}</div>
                    </div>
                  )}
                  {qrStatus === 'expired' && (
                    <div style={{ padding: '10px 14px', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, color: '#b91c1c', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AlertCircle size={16} />
                      <div><strong>Session Expired</strong> - Attendance window closed</div>
                    </div>
                  )}
                </div>

                {/* QR Code Container */}
                <div style={{
                  padding: 20,
                  backgroundColor: '#ffffff',
                  borderRadius: 12,
                  border: `2px solid ${statusColor}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  marginBottom: 20,
                  opacity: qrStatus === 'expired' ? 0.35 : 1,
                }}>
                  <QRCodeSVG
                    value={qrSession.sessionId}
                    size={210}
                    bgColor="#ffffff"
                    fgColor={qrStatus === 'expired' ? '#94a3b8' : '#0f172a'}
                    level="H"
                    includeMargin={false}
                  />
                </div>

                {/* Session Details */}
                <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { label: 'Start Time', value: new Date(qrSession.activationTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) },
                    { label: 'End Time', value: new Date(qrSession.expiryTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) },
                    { label: 'Radius', value: `${qrSession.allowedRadius} meters` },
                    { label: 'Session Token', value: `${qrSession.sessionId.slice(0, 8)}...` },
                  ].map(item => (
                    <div key={item.label} style={{ backgroundColor: '#f8fafc', borderRadius: 8, padding: '9px 12px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 13, marginTop: 2 }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                {qrStatus === 'expired' && (
                  <button
                    onClick={() => setQrSession(null)}
                    style={{
                      marginTop: 16, width: '100%', padding: '10px',
                      backgroundColor: '#059669', color: '#ffffff',
                      border: 'none', borderRadius: 8, fontWeight: 600,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    <QrCode size={15} /> Create Another Session
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </TeacherNav>
  );
}
