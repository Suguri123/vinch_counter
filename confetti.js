// Canvas Confetti Library (Standalone / Offline compatible)
class ConfettiEffect {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'confetti-canvas';
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100vw';
    this.canvas.style.height = '100vh';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '9999';
    document.body.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * window.devicePixelRatio;
    this.canvas.height = this.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  fire(options = {}) {
    const particleCount = options.particleCount || 100;
    const origin = options.origin || { x: 0.5, y: 0.5 };
    const colors = options.colors || ['#ff4b2b', '#ff416c', '#ffb703', '#00f2fe', '#4facfe', '#ffffff', '#ffd700'];

    for (let i = 0; i < particleCount; i++) {
      const angle = (options.angle !== undefined ? options.angle : Math.random() * 360) * (Math.PI / 180);
      const spread = (options.spread || 70) * (Math.PI / 180);
      const actualAngle = angle + (Math.random() - 0.5) * spread;
      const velocity = (options.startVelocity || 35) * (0.6 + Math.random() * 0.8);

      this.particles.push({
        x: origin.x * this.width,
        y: origin.y * this.height,
        vx: Math.cos(actualAngle) * velocity,
        vy: -Math.abs(Math.sin(actualAngle) * velocity),
        gravity: options.gravity || 0.45,
        drag: 0.96,
        size: 7 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        decay: 0.008 + Math.random() * 0.008,
        shape: Math.random() > 0.3 ? 'rect' : 'circle'
      });
    }

    if (!this.animationId) {
      this.animate();
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= p.drag;
      p.vy = p.vy * p.drag + p.gravity;
      p.rotation += p.rotationSpeed;
      p.opacity -= p.decay;

      if (p.opacity <= 0 || p.y > this.height + 50) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = Math.max(0, p.opacity);
      this.ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        this.ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 3, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.animationId = null;
    }
  }

  celebrate() {
    // 팡파레 연출 (여러 각도에서 발사)
    this.fire({ origin: { x: 0.2, y: 0.7 }, angle: 60, particleCount: 80, spread: 60, startVelocity: 45 });
    this.fire({ origin: { x: 0.8, y: 0.7 }, angle: 120, particleCount: 80, spread: 60, startVelocity: 45 });
    setTimeout(() => {
      this.fire({ origin: { x: 0.5, y: 0.5 }, angle: 90, particleCount: 120, spread: 100, startVelocity: 40 });
    }, 250);
  }
}

window.confettiEffect = null;
document.addEventListener('DOMContentLoaded', () => {
  window.confettiEffect = new ConfettiEffect();
});
