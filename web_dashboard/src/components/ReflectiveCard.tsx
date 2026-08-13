import React, { useEffect, useRef, useState, useCallback } from 'react';
import './ReflectiveCard.css';
import { Fingerprint, Activity, Lock, Camera, CameraOff } from 'lucide-react';
import { getAvatarUrl } from '../utils/avatarGenerator';

export interface ReflectiveCardProps {
  userName?: string;
  userRole?: string;
  idNumber?: string;
  blurStrength?: number;
  color?: string;
  metalness?: number;
  roughness?: number;
  overlayColor?: string;
  displacementStrength?: number;
  noiseScale?: number;
  specularConstant?: number;
  grayscale?: number;
  glassDistortion?: number;
  className?: string;
  style?: React.CSSProperties;
}

const ReflectiveCard: React.FC<ReflectiveCardProps> = ({
  userName = 'ALEXANDER DOE',
  userRole = 'SENIOR DEVELOPER',
  idNumber = '8901-2345-6789',
  blurStrength = 12,
  color = 'white',
  metalness = 1,
  roughness = 0.4,
  overlayColor = 'rgba(255, 255, 255, 0.1)',
  displacementStrength = 20,
  noiseScale = 1,
  specularConstant = 1.2,
  grayscale = 1,
  glassDistortion = 0,
  className = '',
  style = {}
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const centerVideoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [avatarStyleIndex, setAvatarStyleIndex] = useState<number>(0);

  const startWebcam = useCallback(async () => {
    setCameraError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Webcam API unavailable in non-secure context (HTTP). Using simulated live scanner.');
      setCameraActive(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => { });
      }
      if (centerVideoRef.current) {
        centerVideoRef.current.srcObject = stream;
        centerVideoRef.current.play().catch(() => { });
      }
      setCameraActive(true);
    } catch (err: unknown) {
      console.warn('Webcam permission error:', err);
      const errMsg = err instanceof Error ? err.message : 'Camera access denied';
      setCameraError(errMsg);
      setCameraActive(false);
    }
  }, []);

  useEffect(() => {
    startWebcam();
  }, [startWebcam]);

  // FALLBACK ANIMATED IDENTITY CANVAS LOOP (WHEN WEBCAM IS DENIED / HTTP NETWORK PREVIEW)
  useEffect(() => {
    if (cameraActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;

    const drawScanAnimation = () => {
      angle += 0.04;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dark violet gradient background
      const bgGrad = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        10,
        canvas.width / 2,
        canvas.height / 2,
        150
      );
      bgGrad.addColorStop(0, '#1e1b2e');
      bgGrad.addColorStop(1, '#0d0b17');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid mesh lines
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 15) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 15) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Facial wireframe silhouette
      const cx = canvas.width / 2;
      const cy = canvas.height / 2 - 5;

      ctx.strokeStyle = 'rgba(192, 132, 252, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 32, 0, Math.PI * 2);
      ctx.stroke();

      // Rotating radar beam
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      const beamGrad = ctx.createConicGradient(0, 0, 0);
      beamGrad.addColorStop(0, 'rgba(139, 92, 246, 0.6)');
      beamGrad.addColorStop(0.2, 'rgba(139, 92, 246, 0)');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 48, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Pulsing scanning line
      const scanY = cy + Math.sin(angle * 1.5) * 35;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(cx - 40, scanY);
      ctx.lineTo(cx + 40, scanY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(drawScanAnimation);
    };

    drawScanAnimation();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [cameraActive]);

  const baseFrequency = 0.03 / Math.max(0.1, noiseScale);
  const saturation = 1 - Math.max(0, Math.min(1, grayscale));

  const cssVariables: Record<string, string | number> = {
    '--blur-strength': `${blurStrength}px`,
    '--metalness': metalness,
    '--roughness': roughness,
    '--overlay-color': overlayColor,
    '--text-color': color,
    '--saturation': saturation
  };

  return (
    <div
      className={`reflective-card-container ${className}`.trim()}
      style={{ ...style, ...cssVariables } as React.CSSProperties}
    >
      <svg className="reflective-svg-filters" aria-hidden="true">
        <defs>
          <filter id="metallic-displacement" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="turbulence" baseFrequency={baseFrequency} numOctaves="2" result="noise" />
            <feColorMatrix in="noise" type="luminanceToAlpha" result="noiseAlpha" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={displacementStrength}
              xChannelSelector="R"
              yChannelSelector="G"
              result="rippled"
            />
            <feSpecularLighting
              in="noiseAlpha"
              surfaceScale={displacementStrength}
              specularConstant={specularConstant}
              specularExponent="20"
              lightingColor="#ffffff"
              result="light"
            >
              <fePointLight x="0" y="0" z="300" />
            </feSpecularLighting>
            <feComposite in="light" in2="rippled" operator="in" result="light-effect" />
            <feBlend in="light-effect" in2="rippled" mode="screen" result="metallic-result" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="solidAlpha"
            />
            <feMorphology in="solidAlpha" operator="erode" radius="45" result="erodedAlpha" />
            <feGaussianBlur in="erodedAlpha" stdDeviation="10" result="blurredMap" />
            <feComponentTransfer in="blurredMap" result="glassMap">
              <feFuncA type="linear" slope="0.5" intercept="0" />
            </feComponentTransfer>
            <feDisplacementMap
              in="metallic-result"
              in2="glassMap"
              scale={glassDistortion}
              xChannelSelector="A"
              yChannelSelector="A"
              result="final"
            />
          </filter>
        </defs>
      </svg>

      <video ref={videoRef} autoPlay playsInline muted className="reflective-video" style={{ display: cameraActive ? 'block' : 'none' }} />

      <div className="reflective-noise" />
      <div className="reflective-sheen" />
      <div className="reflective-border" />

      <div className="reflective-content">
        <div className="card-header">
          <button
            type="button"
            className="security-badge camera-trigger-badge"
            onClick={startWebcam}
            title={cameraError || 'Click to request webcam access'}
          >
            <Lock size={13} className="security-icon" />
            <span>{cameraActive ? 'CAMERA FEED ACTIVE' : 'ENABLE LIVE CAMERA'}</span>
          </button>
          <div className="status-indicator-group">
            {cameraActive ? (
              <Camera size={16} className="status-icon active-cam-icon" />
            ) : (
              <CameraOff size={16} className="status-icon inactive-cam-icon" />
            )}
            <Activity className="status-icon" size={18} />
          </div>
        </div>

        <div className="card-body">
          {/* CENTER BLURRED LIVE CAMERA AVATAR OR FALLBACK GRAPHIC */}
          <div
            className="center-avatar-container"
            onClick={() => setAvatarStyleIndex(prev => prev + 1)}
            title="Click to randomize avatar style"
          >
            {cameraActive ? (
              <video ref={centerVideoRef} autoPlay playsInline muted className="center-avatar-video" />
            ) : (
              <img
                src={getAvatarUrl(userName + userRole, avatarStyleIndex)}
                alt="Dynamic Avatar"
                className="center-avatar-img"
              />
            )}
            <div className="avatar-scan-ring" />
            {!cameraActive && (
              <span className="randomize-chip-btn">🎲 Randomize</span>
            )}
          </div>

          {/* REPOSITIONED CENTER TEXT - IDENTITY BADGE STYLE */}
          <div className="user-info">
            <h2 className="user-name">{userName}</h2>
            <p className="user-role">{userRole}</p>
          </div>
        </div>

        <div className="card-footer">
          <div className="id-section">
            <span className="label">ID NUMBER</span>
            <span className="value">{idNumber}</span>
          </div>
          <div className="fingerprint-section">
            <Fingerprint size={30} className="fingerprint-icon" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReflectiveCard;
