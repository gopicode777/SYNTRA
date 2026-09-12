/* ============================================================
   THEME — light / dark toggle for the NEXA workspace.
   Colors themselves live in css/tokens.css (mirrored from the
   SYNTRA landing page). This file only swaps the .dark class.
   ============================================================ */
const NexaTheme = (() => {
  const STORAGE_KEY = 'nexa.theme';

  function get(){
    return localStorage.getItem(STORAGE_KEY) || 'light';
  }

  function apply(mode){
    document.body.classList.toggle('dark', mode === 'dark');
    localStorage.setItem(STORAGE_KEY, mode);
    document.querySelectorAll('[data-theme-toggle]').forEach(btn=>{
      btn.classList.toggle('active', mode === 'dark');
    });
    document.querySelectorAll('[data-theme-swatch]').forEach(sw=>{
      sw.classList.toggle('active', sw.dataset.themeSwatch === mode);
    });
  }

  function toggle(){
    apply(get() === 'dark' ? 'light' : 'dark');
  }

  function init(){
    apply(get());
    document.querySelectorAll('[data-theme-toggle]').forEach(btn=>{
      btn.addEventListener('click', toggle);
    });
    document.querySelectorAll('[data-theme-swatch]').forEach(sw=>{
      sw.addEventListener('click', ()=> apply(sw.dataset.themeSwatch));
    });
  }

  return { init, apply, get, toggle };
})();
