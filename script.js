/* ===== Academic Portfolio - Interactive Scripts ===== */
document.addEventListener('DOMContentLoaded', () => {

    // --- Theme Toggle ---
    const themeToggle = document.getElementById('themeToggle');
    const saved = localStorage.getItem('theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);

    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    });

    // --- Mobile Nav ---
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
    navLinks.querySelectorAll('a').forEach(a =>
        a.addEventListener('click', () => navLinks.classList.remove('open'))
    );

    // --- Navbar Scroll ---
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('.section, .hero');
    const navAnchors = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
        // Active link
        let current = '';
        sections.forEach(sec => {
            if (window.scrollY >= sec.offsetTop - 200) current = sec.id;
        });
        navAnchors.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === '#' + current);
        });
    });

    // --- Cursor Glow ---
    const glow = document.getElementById('cursorGlow');
    if (window.innerWidth > 768) {
        document.addEventListener('mousemove', e => {
            glow.style.left = e.clientX + 'px';
            glow.style.top = e.clientY + 'px';
        });
    }

    // --- Typing Effect ---
    const titles = [
        'Researcher in AI & Systems',
        'Cloud Computing Enthusiast',
        'GNN & LLM Explorer',
        'Open Source Contributor'
    ];
    let titleIdx = 0, charIdx = 0, deleting = false;
    const typingEl = document.getElementById('typingText');

    function type() {
        const current = titles[titleIdx];
        if (!deleting) {
            typingEl.textContent = current.substring(0, charIdx + 1);
            charIdx++;
            if (charIdx === current.length) {
                deleting = true;
                setTimeout(type, 2000);
                return;
            }
            setTimeout(type, 80);
        } else {
            typingEl.textContent = current.substring(0, charIdx - 1);
            charIdx--;
            if (charIdx === 0) {
                deleting = false;
                titleIdx = (titleIdx + 1) % titles.length;
                setTimeout(type, 500);
                return;
            }
            setTimeout(type, 40);
        }
    }
    type();

    // --- Stat Counter Animation ---
    const statNumbers = document.querySelectorAll('.stat-number');
    let statAnimated = false;

    function animateStats() {
        if (statAnimated) return;
        statNumbers.forEach(el => {
            const target = parseInt(el.dataset.target);
            const duration = 2000;
            const step = target / (duration / 16);
            let val = 0;
            const timer = setInterval(() => {
                val += step;
                if (val >= target) { val = target; clearInterval(timer); }
                el.textContent = Math.floor(val);
            }, 16);
        });
        statAnimated = true;
    }

    // --- Scroll Reveal ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Trigger stat animation when hero stats come into view
                if (entry.target.closest('.hero-stats') || entry.target.closest('.hero')) {
                    animateStats();
                }
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));

    // Also trigger stats when hero is visible
    const heroObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) animateStats();
    }, { threshold: 0.3 });
    const heroSection = document.getElementById('hero');
    if (heroSection) heroObserver.observe(heroSection);

    // --- Publication Filters ---
    const filters = document.querySelectorAll('.pub-filter');
    const pubs = document.querySelectorAll('.pub-item');

    filters.forEach(btn => {
        btn.addEventListener('click', () => {
            filters.forEach(f => f.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            pubs.forEach(pub => {
                if (filter === 'all' || pub.dataset.type === filter) {
                    pub.classList.remove('hidden');
                    pub.style.animation = 'fadeInUp 0.5s forwards';
                } else {
                    pub.classList.add('hidden');
                }
            });
        });
    });

    // --- Particle Canvas ---
    const canvas = document.getElementById('particleCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouse = { x: 0, y: 0 };
        let w, h;

        function resize() {
            w = canvas.width = canvas.parentElement.offsetWidth;
            h = canvas.height = canvas.parentElement.offsetHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        canvas.parentElement.addEventListener('mousemove', e => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        class Particle {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;
                this.opacity = Math.random() * 0.5 + 0.1;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x < 0 || this.x > w || this.y < 0 || this.y > h) this.reset();
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(108, 92, 231, ${this.opacity})`;
                ctx.fill();
            }
        }

        // Create particles - fewer for performance
        const count = Math.min(80, Math.floor((w * h) / 15000));
        for (let i = 0; i < count; i++) particles.push(new Particle());

        function drawLines() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(108, 92, 231, ${0.08 * (1 - dist / 150)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
                // Mouse interaction
                const dx = particles[i].x - mouse.x;
                const dy = particles[i].y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 200) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(162, 155, 254, ${0.15 * (1 - dist / 200)})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }

        function animate() {
            ctx.clearRect(0, 0, w, h);
            particles.forEach(p => { p.update(); p.draw(); });
            drawLines();
            requestAnimationFrame(animate);
        }
        animate();
    }

    // --- Smooth scroll for all anchor links ---
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            const target = document.querySelector(a.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });
});
