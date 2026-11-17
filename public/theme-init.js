// Applies the saved theme before the first paint (an external file, so the CSP needs no inline script).
(function () {
  var t = null;
  try { t = localStorage.getItem('rxv-pg:theme'); } catch (e) { /* storage blocked */ }
  var dark = t === 'dark' || ((t === null || t === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
})();
