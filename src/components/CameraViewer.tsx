// ...existing code...
import React, { useEffect, useRef, useState } from 'react';

type Props = {
    wsUrl: string;
    autoStart?: boolean;
};

const CameraViewer: React.FC<Props> = ({ wsUrl, autoStart = false }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [running, setRunning] = useState(autoStart);
    const [fps, setFps] = useState(0);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        let fpsCounter = 0;
        let fpsTimer: any = null;

        if (!running) return;

        const ws = new WebSocket(wsUrl);
        ws.binaryType = 'arraybuffer';
        wsRef.current = ws;

        ws.onopen = () => {
            setIsConnected(true);
            setErrorMessage(null);
        };

        ws.onmessage = (event) => {
            // Binary frame
            if (event.data instanceof ArrayBuffer) {
                const blob = new Blob([event.data], { type: 'image/jpeg' });
                const img = new Image();
                img.onload = () => {
                    const canvas = canvasRef.current;
                    if (!canvas) return;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return;

                    // Resize canvas for CSS size and devicePixelRatio for sharp rendering
                    const dpr = window.devicePixelRatio || 1;
                    const displayWidth = canvas.clientWidth;
                    const displayHeight = canvas.clientHeight;
                    canvas.width = Math.round(displayWidth * dpr);
                    canvas.height = Math.round(displayHeight * dpr);
                    // make drawing coordinates in CSS pixels
                    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                    ctx.clearRect(0, 0, displayWidth, displayHeight);

                    // Calculate scale to COVER the canvas (like object-fit: cover)
                    const scale = Math.max(displayWidth / img.width, displayHeight / img.height);
                    const drawWidth = img.width * scale;
                    const drawHeight = img.height * scale;
                    const dx = (displayWidth - drawWidth) / 2;
                    const dy = (displayHeight - drawHeight) / 2;

                    ctx.drawImage(img, dx, dy, drawWidth, drawHeight);

                    URL.revokeObjectURL(img.src);
                };
                img.src = URL.createObjectURL(blob);

                fpsCounter += 1;
            } else {
                try {
                    const msg = typeof event.data === 'string' ? JSON.parse(event.data) : null;
                    console.debug('Camera JSON message', msg);
                } catch (e) {
                    console.debug('Unknown camera message', event.data);
                }
            }
        };

        ws.onclose = (event) => {
            setIsConnected(false);
            if (running) {
                const reason = event.reason || `Disconnected (code ${event.code})`;
                setErrorMessage(reason);
                console.error('Camera WS closed:', reason);
            }
        };

        ws.onerror = (err: Event) => {
            // Browser does not expose detailed error; log event and set generic message
            console.error('Camera WS error', err);
            setIsConnected(false);
            setErrorMessage('Không thể kết nối tới camera. Vui lòng kiểm tra URL và mạng.');
        };

        fpsTimer = setInterval(() => {
            setFps(fpsCounter);
            fpsCounter = 0;
        }, 1000);

        return () => {
            clearInterval(fpsTimer);
            try { ws.close(); } catch (e) { }
            wsRef.current = null;
            setIsConnected(false);
        };
    }, [running, wsUrl]);

    // stop when component unmounts
    useEffect(() => {
        return () => {
            if (wsRef.current) {
                try { wsRef.current.close(); } catch (e) { }
            }
        };
    }, []);

    return (
        <div className="camera-viewer" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ fontSize: 13 }}>{isConnected ? '✅ Connected' : '⏳ Disconnected'}</div>
                <div style={{ marginLeft: 'auto', fontSize: 13 }}>FPS: {fps}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { setErrorMessage(null); setRunning(true); }} disabled={running}>Start</button>
                <button onClick={() => setRunning(false)} disabled={!running}>Stop</button>
            </div>
            {errorMessage && (
                <div style={{ color: '#d32f2f', fontSize: 12 }}>
                    {errorMessage}
                </div>
            )}
            <div style={{ width: '100%', aspectRatio: '9/10', background: '#000', borderRadius: 0, overflow: 'hidden' }}>
                <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
            </div>
        </div>
    );
};

export default CameraViewer;