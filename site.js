/**
 * Comportements légers communs (bandeau cookie, grain d'ambiance).
 * Chargé sur toutes les pages ; ne fait rien si les éléments sont absents.
 */
(function () {
	'use strict';

	var STORAGE_KEY = 'difb-cookie-choice';

	function initCookieBanner() {
		var banner = document.getElementById('dib-cookie');
		if (!banner) return;

		var choice = null;
		try {
			choice = localStorage.getItem(STORAGE_KEY);
		} catch (e) {}

		if (choice) {
			banner.hidden = true;
			return;
		}
		banner.hidden = false;

		var accept = document.getElementById('dib-cookie-accept');
		var decline = document.getElementById('dib-cookie-decline');

		function choose(value) {
			try {
				localStorage.setItem(STORAGE_KEY, value);
			} catch (e) {}
			banner.hidden = true;
		}

		if (accept) accept.addEventListener('click', function () { choose('accepted'); });
		if (decline) decline.addEventListener('click', function () { choose('declined'); });
	}

	function initGrain() {
		var grain = document.getElementById('dib-grain');
		if (!grain) return;
		var enabled = window.dibSite ? window.dibSite.grain !== false : true;
		grain.hidden = !enabled;
	}

	document.addEventListener('DOMContentLoaded', function () {
		initCookieBanner();
		initGrain();
	});
})();
