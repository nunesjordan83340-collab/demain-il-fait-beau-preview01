/**
 * Accueil : carrousel vidéo + animations GSAP/ScrollTrigger.
 * Traduction directe de la logique décrite dans passation/README.md
 * (section "Animations"), sans le runtime propriétaire des maquettes.
 */
(function () {
	'use strict';

	var heroZoom = (window.dibHome && window.dibHome.heroZoom) || 3.2;

	/* ---------- Carrousel vidéo ---------- */
	function setupVideoCarousel() {
		var vids = Array.prototype.slice.call(document.querySelectorAll('[data-a="heroVideo"]'));
		var dots = Array.prototype.slice.call(document.querySelectorAll('[data-a="heroDot"]'));
		if (!vids.length) return;

		var current = 0;

		vids.forEach(function (v) {
			v.muted = true;
			v.defaultMuted = true;
			v.playsInline = true;
		});

		function tryPlay(v) {
			var p = v.play();
			if (p && p.catch) {
				p.catch(function () {
					var retry = function () { v.play().catch(function () {}); };
					v.addEventListener('canplay', retry, { once: true });
				});
			}
		}

		function show(n) {
			current = n;
			vids.forEach(function (v, i) {
				var active = i === n;
				v.classList.toggle('is-active', active);
				if (active) {
					try { v.currentTime = 0; } catch (e) {}
					tryPlay(v);
				} else if (!v.paused) {
					v.pause();
				}
			});
			var next = vids[(n + 1) % vids.length];
			if (next && next.preload !== 'auto') {
				next.preload = 'auto';
				next.load();
			}
			dots.forEach(function (d, i) {
				d.classList.toggle('is-active', i === n);
			});
		}

		vids.forEach(function (v, i) {
			v.addEventListener('ended', function () { show((i + 1) % vids.length); });
			v.addEventListener('error', function () { if (current === i) show((i + 1) % vids.length); });
			v.addEventListener('stalled', function () { if (current === i) tryPlay(v); });
		});

		function kick() {
			var v = vids[current];
			if (v && v.paused) tryPlay(v);
		}
		window.addEventListener('pointerdown', kick, { passive: true });
		window.addEventListener('keydown', kick);

		show(0);
	}

	/* ---------- Animations GSAP ---------- */
	function setupAnimations() {
		if (!window.gsap || !window.ScrollTrigger) return;
		var gsap = window.gsap;
		var ScrollTrigger = window.ScrollTrigger;
		gsap.registerPlugin(ScrollTrigger);

		var ctx = gsap.context(function () {
			gsap.set('[data-a="gTile"]', { opacity: 0, y: 26 });

			ScrollTrigger.create({
				start: 0,
				end: 'max',
				refreshPriority: -10,
				onUpdate: function (self) {
					gsap.set('#dib-progress', { scaleX: self.progress });
				}
			});
			gsap.to('#dib-progress', {
				opacity: 1, duration: 0.3, ease: 'power1.out',
				scrollTrigger: { start: 40, end: 'max', toggleActions: 'play none none reverse' }
			});

			gsap.timeline({
				scrollTrigger: { trigger: '[data-a="heroSpacer"]', start: 'top top', end: 'bottom top', scrub: true }
			})
				.to('[data-a="heroPhoto"]', { scale: heroZoom, ease: 'none', duration: 1 }, 0)
				.to('[data-a="heroDark"]', { opacity: 1, ease: 'power1.in', duration: 1 }, 0)
				.to('[data-a="heroNav"]', { opacity: 0, ease: 'none', duration: 0.45 }, 0)
				.to('[data-a="heroText"]', { opacity: 0, y: -55, ease: 'none', duration: 0.45 }, 0);

			gsap.to('[data-a="scrollHint"]', {
				opacity: 0, duration: 0.3, ease: 'power1.out',
				scrollTrigger: { start: 40, end: 'max', toggleActions: 'play none none reverse' }
			});

			ScrollTrigger.create({
				trigger: '[data-a="heroSpacer"]',
				start: 'bottom top',
				onEnter: function () { gsap.set('[data-a="hero"]', { autoAlpha: 0, pointerEvents: 'none' }); },
				onLeaveBack: function () { gsap.set('[data-a="hero"]', { autoAlpha: 1, pointerEvents: 'auto' }); }
			});

			ScrollTrigger.batch('[data-a="gTile"]', {
				start: 'top 96%',
				onEnter: function (batch) {
					gsap.to(batch, { opacity: 1, y: 0, duration: 1.1, ease: 'power2.out', stagger: 0.09, overwrite: true });
				},
				onEnterBack: function (batch) {
					gsap.to(batch, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', stagger: 0.06, overwrite: true });
				}
			});

			document.querySelectorAll('[data-a="gTile"]').forEach(function (tile) {
				var img = tile.querySelector('[data-a="gImg"]');
				var title = tile.querySelector('[data-a="gTitle"]');
				var rule = tile.querySelector('[data-a="gRule"]');
				var tint = tile.querySelector('[data-a="gTint"]');
				var cat = tile.querySelector('[data-a="gCat"]');

				var enter = gsap.timeline({ paused: true, defaults: { ease: 'power3.out', duration: 0.5 } })
					.to(img, { scale: 1.1 }, 0)
					.to(tint, { opacity: 0.35 }, 0)
					.to(title, { y: -12 }, 0)
					.to(cat, { y: -8 }, 0)
					.to(rule, { scaleX: 1, duration: 0.6 }, 0);

				tile.addEventListener('mouseenter', function () { enter.play(); });
				tile.addEventListener('mouseleave', function () { enter.reverse(); });
				tile.addEventListener('focus', function () { enter.play(); });
				tile.addEventListener('blur', function () { enter.reverse(); });

				tile.addEventListener('mousemove', function (e) {
					var r = tile.getBoundingClientRect();
					var dx = (e.clientX - r.left) / r.width - 0.5;
					var dy = (e.clientY - r.top) / r.height - 0.5;
					gsap.to(img, { x: dx * 18, y: dy * 18, duration: 0.6, ease: 'power2.out', overwrite: 'auto' });
				});
				tile.addEventListener('mouseleave', function () {
					gsap.to(img, { x: 0, y: 0, duration: 0.7, ease: 'power3.out', overwrite: 'auto' });
				});
			});
		});

		if (ScrollTrigger.getAll().length === 0) {
			ctx.revert();
			return;
		}

		if (document.fonts && document.fonts.ready) {
			document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
		}
		setTimeout(function () { ScrollTrigger.refresh(); }, 400);
	}

	document.addEventListener('DOMContentLoaded', function () {
		setupVideoCarousel();
		setupAnimations();
	});
})();
