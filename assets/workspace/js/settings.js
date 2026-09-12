/* ============================================================
   SETTINGS — modal with distinct General / Appearance / Privacy
   / Integrations / Memory / About panes. Each pane has its own
   real behavior (this was the part that used to look identical
   across sections in the old build — now every tab does
   something different and persists to localStorage).
   ============================================================ */
const NexaSettings = (() => {
  const KEYS = {
    model: 'nexa.model',
    groqKey: 'nexa.groqKey',
    memories: 'nexa.memories',
  };

  function openModal(){
    document.getElementById('settingsOverlay').classList.add('show');
  }
  function closeModal(){
    document.getElementById('settingsOverlay').classList.remove('show');
  }

  function switchTab(tabId){
    document.querySelectorAll('.modal-nav-item').forEach(el=>{
      el.classList.toggle('active', el.dataset.tab === tabId);
    });
    document.querySelectorAll('.modal-pane').forEach(el=>{
      el.classList.toggle('active', el.id === 'pane-' + tabId);
    });
  }

  /* ---- General ---- */
  function initGeneral(){
    const select = document.getElementById('modelSelect');
    select.value = localStorage.getItem(KEYS.model) || 'gpt-oss-120b';
    select.addEventListener('change', ()=> localStorage.setItem(KEYS.model, select.value));

    document.getElementById('clearHistoryBtn').addEventListener('click', ()=>{
      if(!confirm('Clear all chat history? This cannot be undone.')) return;
      localStorage.removeItem('nexa.chats');
      location.reload();
    });
  }

  /* ---- Appearance ---- */
  function initAppearance(){
    // theme swatches + toggle both drive NexaTheme; already wired via [data-theme-swatch]/[data-theme-toggle]
    const sizeSlider = document.getElementById('fontSizeSlider');
    const saved = localStorage.getItem('nexa.fontScale') || '100';
    sizeSlider.value = saved;
    document.documentElement.style.setProperty('--font-scale', saved + '%');
    document.getElementById('threadInner').style.fontSize = '';
    applyFontScale(saved);
    sizeSlider.addEventListener('input', ()=>{
      applyFontScale(sizeSlider.value);
      localStorage.setItem('nexa.fontScale', sizeSlider.value);
    });
  }
  function applyFontScale(pct){
    document.getElementById('thread').style.fontSize = (pct/100) + 'em';
    document.getElementById('welcome').style.fontSize = (pct/100) + 'em';
  }

  /* ---- Privacy ---- */
  function initPrivacy(){
    document.getElementById('clearMemoriesBtn').addEventListener('click', ()=>{
      if(!confirm('Clear all saved memories?')) return;
      localStorage.removeItem(KEYS.memories);
      renderMemories();
      alert('All memories cleared.');
    });
    document.getElementById('clearAllDataBtn').addEventListener('click', ()=>{
      if(!confirm('This clears chats, memories, and your API key from this browser. Continue?')) return;
      localStorage.removeItem('nexa.chats');
      localStorage.removeItem(KEYS.memories);
      localStorage.removeItem(KEYS.groqKey);
      alert('All local data cleared.');
      location.reload();
    });
  }

  /* ---- Integrations ---- */
  function initIntegrations(){
    const input = document.getElementById('groqKeyInput');
    const status = document.getElementById('keyStatus');
    input.value = localStorage.getItem(KEYS.groqKey) || '';

    document.getElementById('saveKeyBtn').addEventListener('click', ()=>{
      if(!input.value.trim()){
        status.textContent = 'Enter a key first.';
        status.className = 'key-status err';
        return;
      }
      localStorage.setItem(KEYS.groqKey, input.value.trim());
      status.textContent = 'Saved to this browser.';
      status.className = 'key-status ok';
    });

    document.getElementById('testKeyBtn').addEventListener('click', ()=>{
      if(!input.value.trim()){
        status.textContent = 'Enter a key first.';
        status.className = 'key-status err';
        return;
      }
      status.textContent = 'Testing…';
      status.className = 'key-status';
      setTimeout(()=>{
        // No live backend in this frontend-only build — simulate a check.
        const looksValid = input.value.trim().length > 12;
        status.textContent = looksValid
          ? 'Connection looks good (format check only — wire up a real request server-side).'
          : 'That key looks too short — double check it.';
        status.className = 'key-status ' + (looksValid ? 'ok' : 'err');
      }, 700);
    });
  }

  /* ---- Memory ---- */
  function getMemories(){
    try{ return JSON.parse(localStorage.getItem(KEYS.memories)) || []; }
    catch(e){ return []; }
  }
  function saveMemories(list){
    localStorage.setItem(KEYS.memories, JSON.stringify(list));
  }
  function renderMemories(){
    const list = getMemories();
    const wrap = document.getElementById('memoryList');
    wrap.innerHTML = '';
    if(list.length === 0){
      wrap.innerHTML = `<div class="empty-note">No saved memories yet. Add one above.</div>`;
      return;
    }
    list.forEach((m, i)=>{
      const row = document.createElement('div');
      row.className = 'memory-item';
      row.innerHTML = `<span>${escapeHtml(m)}</span>
        <button aria-label="Delete memory">
          <svg class="icon" viewBox="0 0 24 24" style="width:15px;height:15px"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>`;
      row.querySelector('button').addEventListener('click', ()=>{
        const updated = getMemories();
        updated.splice(i, 1);
        saveMemories(updated);
        renderMemories();
      });
      wrap.appendChild(row);
    });
  }
  function escapeHtml(s){
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }
  function initMemory(){
    const input = document.getElementById('memoryInput');
    document.getElementById('memoryAddBtn').addEventListener('click', ()=>{
      const val = input.value.trim();
      if(!val) return;
      const list = getMemories();
      list.unshift(val);
      saveMemories(list);
      input.value = '';
      renderMemories();
    });
    input.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter') document.getElementById('memoryAddBtn').click();
    });
    renderMemories();
  }

  function init(){
    document.getElementById('settingsBtn').addEventListener('click', openModal);
    document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
    document.getElementById('settingsOverlay').addEventListener('click', (e)=>{
      if(e.target.id === 'settingsOverlay') closeModal();
    });
    document.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape') closeModal();
    });
    document.querySelectorAll('.modal-nav-item').forEach(el=>{
      el.addEventListener('click', ()=> switchTab(el.dataset.tab));
    });

    initGeneral();
    initAppearance();
    initPrivacy();
    initIntegrations();
    initMemory();
  }

  return { init, openModal, closeModal };
})();
