import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { useNavigate } from 'react-router-dom'

export default function QrScannerModal({ isOpen, onClose }) {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const html5QrCodeRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    const qrCodeId = 'qr-reader-region'
    const html5QrCode = new Html5Qrcode(qrCodeId)
    html5QrCodeRef.current = html5QrCode

    html5QrCode
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          stopScannerAndRedirect(decodedText)
        },
        () => {}
      )
      .catch((err) => {
        console.warn('Camera access error:', err)
        setError('Camera access not permitted or device camera unavailable. You can upload a QR image below.')
      })

    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch((e) => console.error(e))
      }
    }
  }, [isOpen])

  function stopScannerAndRedirect(decodedText) {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      html5QrCodeRef.current.stop().then(() => {
        onClose()
        processTokenAndNavigate(decodedText)
      })
    } else {
      onClose()
      processTokenAndNavigate(decodedText)
    }
  }

  function processTokenAndNavigate(decodedText) {
    let token = decodedText
    if (decodedText.includes('/trace/')) {
      token = decodedText.split('/trace/').pop()
    }
    navigate(`/trace/${token.trim()}`)
  }

  function handleFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    if (!html5QrCodeRef.current) {
      html5QrCodeRef.current = new Html5Qrcode('qr-reader-region')
    }

    html5QrCodeRef.current
      .scanFile(file, true)
      .then((decodedText) => {
        stopScannerAndRedirect(decodedText)
      })
      .catch(() => {
        setError('Could not detect a valid QR Code in the uploaded image. Try another image.')
      })
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(6px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#1f2937',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '440px',
        width: '100%',
        color: '#fff',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            📷 Scan Product QR Code
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#9ca3af',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid #ef4444',
            color: '#fca5a5',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <div
          id="qr-reader-region"
          style={{
            width: '100%',
            minHeight: '260px',
            borderRadius: '12px',
            overflow: 'hidden',
            background: '#111827',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        />

        <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '16px' }}>
          <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '10px' }}>Or upload a photo of the QR Code:</p>
          <label className="btn btn--outline" style={{ display: 'inline-block', cursor: 'pointer', fontSize: '13px', padding: '8px 16px' }}>
            📁 Upload QR Code Image
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>
    </div>
  )
}
