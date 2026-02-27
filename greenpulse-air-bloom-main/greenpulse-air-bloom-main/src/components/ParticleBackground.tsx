import { useEffect, useRef } from "react";

const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    interface Bubble {
      x: number;
      y: number;
      r: number;
      speed: number;
      opacity: number;
      wobble: number;
      wobbleSpeed: number;
    }

    const bubbles: Bubble[] = Array.from({ length: 35 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height + canvas.height,
      r: Math.random() * 6 + 2,
      speed: Math.random() * 0.8 + 0.2,
      opacity: Math.random() * 0.3 + 0.05,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.02 + 0.005,
    }));

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      bubbles.forEach((b) => {
        b.y -= b.speed;
        b.wobble += b.wobbleSpeed;
        const x = b.x + Math.sin(b.wobble) * 30;
        if (b.y < -20) {
          b.y = canvas.height + 20;
          b.x = Math.random() * canvas.width;
        }
        ctx.beginPath();
        ctx.arc(x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 136, ${b.opacity})`;
        ctx.fill();
        // glow
        ctx.beginPath();
        ctx.arc(x, b.y, b.r * 3, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(x, b.y, 0, x, b.y, b.r * 3);
        grad.addColorStop(0, `rgba(0, 255, 136, ${b.opacity * 0.5})`);
        grad.addColorStop(1, "rgba(0, 255, 136, 0)");
        ctx.fillStyle = grad;
        ctx.fill();
      });
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
};

export default ParticleBackground;
