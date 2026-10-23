import { useEffect, useRef } from 'react';

interface Props { value: string | null; onChange: (dataUrl: string | null) => void; clearLabel: string; placeholder: string }

export default function SignaturePad({ value, onChange, clearLabel, placeholder }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const dirty = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#062b45';
    if (value) { const img = new Image(); img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height); img.src = value; dirty.current = true; }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top] as const;
  };
  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    const ctx = e.currentTarget.getContext('2d')!; const [x, y] = point(e);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 0.1, y + 0.1); ctx.stroke();
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = e.currentTarget.getContext('2d')!; const [x, y] = point(e);
    ctx.lineTo(x, y); ctx.stroke(); dirty.current = true;
  };
  const up = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (!dirty.current) return;
    // Export a small PNG (max 600px wide) to keep the upload light.
    const src = canvasRef.current!;
    const out = document.createElement('canvas');
    const w = Math.min(600, src.width); out.width = w; out.height = Math.round(src.height * (w / src.width));
    out.getContext('2d')!.drawImage(src, 0, 0, out.width, out.height);
    onChange(out.toDataURL('image/png'));
  };
  const clear = () => {
    const c = canvasRef.current!; c.getContext('2d')!.clearRect(0, 0, c.width, c.height);
    dirty.current = false; onChange(null);
  };

  return <div className="sig-pad">
    <canvas ref={canvasRef} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up} onPointerCancel={up} aria-label={placeholder} />
    {!value && <span className="sig-placeholder">{placeholder}</span>}
    <button type="button" className="sig-clear" onClick={clear}>{clearLabel}</button>
  </div>;
}
