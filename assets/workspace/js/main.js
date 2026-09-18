/* ============================================================
   MAIN — bootstraps the NEXA workspace once the DOM is ready.
   ============================================================ */
(function(){
  const MODELS = [
    { id:'gpt-oss-120b', name:'GPT-OSS 120B', note:'Best general quality' },
    { id:'gpt-oss-20b',  name:'GPT-OSS 20B',  note:'Faster, lighter' },
    { id:'qwen-3.6-27b', name:'Qwen 3.6 27B', note:'Strong multilingual' },
    { id:'compound',     name:'Compound',     note:'Faster tool use' },
    { id:'compound-mini',name:'Compound Mini',note:'Faster, lighter' },
  ];

  function initModelPicker(){
    const btn = document.getElementById('modelPickerBtn');
    const menu = document.getElementById('modelPickerMenu');
    const label = document.getElementById('modelPickerLabel');
    const modelSelect = document.getElementById('modelSelect');

    function currentId(){
      return localStorage.getItem('nexa.model') || 'gpt-oss-120b';
    }
    function currentModel(){
      return MODELS.find(m => m.id === currentId()) || MODELS[0];
    }
    function setModel(id){
      localStorage.setItem('nexa.model', id);
      label.textContent = (MODELS.find(m=>m.id===id) || MODELS[0]).name;
      if(modelSelect) modelSelect.value = id;
      renderMenu();
    }
    function renderMenu(){
      menu.innerHTML = MODELS.map(m => `
        <button class="model-option${m.id===currentId()?' active':''}" data-model="${m.id}">
          <span class="mo-name">${m.name}</span>
          <span class="mo-note">${m.note}</span>
        </button>`).join('');
      menu.querySelectorAll('[data-model]').forEach(b=>{
        b.addEventListener('click', ()=>{ setModel(b.dataset.model); menu.classList.remove('show'); });
      });
    }

    label.textContent = currentModel().name;
    renderMenu();

    btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      menu.classList.toggle('show');
    });
    document.addEventListener('click', ()=> menu.classList.remove('show'));

    if(modelSelect){
      modelSelect.addEventListener('change', ()=> setModel(modelSelect.value));
    }
  }

  function initNotifications(){
    const btn = document.getElementById('notifBtn');
    btn.addEventListener('click', ()=>{
      btn.classList.remove('active');
      btn.querySelector('.badge-dot')?.remove();
      alert('No new notifications.');
    });
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    NexaTheme.init();
    NexaTools.render();
    NexaChat.init();
    NexaSidebar.init((chat)=> NexaChat.setChat(chat));
    NexaSettings.init();
    initModelPicker();
    initNotifications();
  });
})();
