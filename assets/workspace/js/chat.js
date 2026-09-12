/* ============================================================
   CHAT — message thread, composer, and a small canned-response
   engine. There is no backend wired up in this frontend build;
   NexaChat.reply() is the single place to swap in a real API
   call (e.g. fetch to your model endpoint) later.
   ============================================================ */
const NexaChat = (() => {
  let messages = [];
  let webSearchOn = false;
  let attachedFile = null;

  const els = {};

  function cacheEls(){
    els.welcome = document.getElementById('welcome');
    els.thread = document.getElementById('thread');
    els.threadInner = document.getElementById('threadInner');
    els.textarea = document.getElementById('composerInput');
    els.sendBtn = document.getElementById('sendBtn');
    els.webSearchToggle = document.getElementById('webSearchToggle');
    els.attachBtn = document.getElementById('attachBtn');
    els.fileInput = document.getElementById('fileInput');
    els.attachmentBar = document.getElementById('attachmentBar');
    els.attachmentName = document.getElementById('attachmentName');
    els.attachmentRemove = document.getElementById('attachmentRemove');
  }

  function setChat(chat){
    messages = (chat && chat.messages) ? chat.messages.slice() : [];
    renderThread();
  }

  function renderThread(){
    const hasMessages = messages.length > 0;
    els.welcome.classList.toggle('hidden', hasMessages);
    els.thread.classList.toggle('hidden', !hasMessages);
    els.threadInner.innerHTML = '';
    messages.forEach(m => els.threadInner.appendChild(buildBubble(m.role, m.text)));
    els.thread.scrollTop = els.thread.scrollHeight;
  }

  function buildBubble(role, text){
    const wrap = document.createElement('div');
    wrap.className = 'msg ' + role;
    const initials = role === 'user' ? 'YO' : 'NX';
    wrap.innerHTML = `
      <div class="msg-avatar">${initials}</div>
      <div class="msg-body">
        <div class="msg-name">${role === 'user' ? 'You' : 'NEXA'}</div>
        <div class="msg-text">${formatText(text)}</div>
      </div>`;
    return wrap;
  }

  function formatText(text){
    const escaped = document.createElement('div');
    escaped.textContent = text;
    return escaped.innerHTML
      .replace(/\n\n/g, '</p><p>')
      .replace(/^/, '<p>').replace(/$/, '</p>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  }

  function updateSendState(){
    const ready = els.textarea.value.trim().length > 0;
    els.sendBtn.classList.toggle('ready', ready);
  }

  function autoGrow(){
    els.textarea.style.height = 'auto';
    els.textarea.style.height = Math.min(els.textarea.scrollHeight, 160) + 'px';
  }

  function send(){
    const text = els.textarea.value.trim();
    if(!text) return;

    if(messages.length === 0){
      NexaSidebar.renameActive(text.slice(0, 40));
    }

    messages.push({ role:'user', text });
    if(attachedFile){
      messages.push({ role:'user', text:`📎 Attached: ${attachedFile}` });
      clearAttachment();
    }
    renderThread();
    NexaSidebar.updateActiveMessages(messages);

    els.textarea.value = '';
    autoGrow();
    updateSendState();

    showTyping();
    const delay = 500 + Math.random() * 500;
    setTimeout(()=>{
      hideTyping();
      const responseText = reply(text);
      messages.push({ role:'assistant', text: responseText });
      renderThread();
      NexaSidebar.updateActiveMessages(messages);
    }, delay);
  }

  function showTyping(){
    const wrap = document.createElement('div');
    wrap.className = 'msg assistant';
    wrap.id = 'typingBubble';
    wrap.innerHTML = `
      <div class="msg-avatar">NX</div>
      <div class="msg-body">
        <div class="msg-name">NEXA</div>
        <div class="msg-typing"><span></span><span></span><span></span></div>
      </div>`;
    els.welcome.classList.add('hidden');
    els.thread.classList.remove('hidden');
    els.threadInner.appendChild(wrap);
    els.thread.scrollTop = els.thread.scrollHeight;
  }

  function hideTyping(){
    const t = document.getElementById('typingBubble');
    if(t) t.remove();
  }

  /* Simple canned reply engine — swap this for a real API call. */
  function reply(userText){
    const lower = userText.toLowerCase();
    const searchNote = webSearchOn ? '\n\n(Web search was on for this reply — in a live build this is where results would be cited.)' : '';

    if(/^(hi|hey|hello)\b/.test(lower)){
      return `Hey! I'm NEXA, your workspace companion. Ask me to plan something, explain a concept, or pick one of the quick tools above to get started.${searchNote}`;
    }
    if(lower.includes('plan')){
      return `Here's a simple way to plan it:\n\n1. List everything that has to happen.\n2. Sort by deadline, not by how big the task feels.\n3. Block time for the top 3 today, and let the rest wait.\n\nWant me to turn this into a checklist?${searchNote}`;
    }
    if(lower.includes('code') || lower.includes('function') || lower.includes('bug')){
      return `Happy to help with that. Paste the code or error you're seeing and tell me what you expected to happen instead — that's usually the fastest way to spot the mismatch.${searchNote}`;
    }
    return `Got it — noted: "${userText.slice(0,80)}${userText.length>80?'…':''}"\n\nThis is a frontend-only demo build, so responses here are canned rather than model-generated. Wire \`NexaChat.reply()\` up to your real model endpoint (see the Integrations tab for the API key field) to make this live.${searchNote}`;
  }

  function clearAttachment(){
    attachedFile = null;
    els.attachmentBar.classList.remove('show');
    els.fileInput.value = '';
  }

  function useToolPrompt(promptText){
    els.textarea.value = promptText;
    autoGrow();
    updateSendState();
    els.textarea.focus();
  }

  function init(){
    cacheEls();

    els.textarea.addEventListener('input', ()=>{ autoGrow(); updateSendState(); });
    els.textarea.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' && !e.shiftKey){
        e.preventDefault();
        send();
      }
    });
    els.sendBtn.addEventListener('click', send);

    els.webSearchToggle.addEventListener('click', ()=>{
      webSearchOn = !webSearchOn;
      els.webSearchToggle.classList.toggle('on', webSearchOn);
      els.webSearchToggle.querySelector('span').textContent = webSearchOn ? 'Web search: on' : 'Web search';
    });

    els.attachBtn.addEventListener('click', ()=> els.fileInput.click());
    els.fileInput.addEventListener('change', ()=>{
      const file = els.fileInput.files[0];
      if(!file) return;
      if(!/\.(txt|md)$/i.test(file.name)){
        alert('Supports .txt and .md for now.');
        els.fileInput.value = '';
        return;
      }
      attachedFile = file.name;
      els.attachmentName.textContent = file.name;
      els.attachmentBar.classList.add('show');
    });
    els.attachmentRemove.addEventListener('click', clearAttachment);

    document.querySelectorAll('[data-tool-prompt]').forEach(card=>{
      card.addEventListener('click', ()=> useToolPrompt(card.dataset.toolPrompt));
    });
  }

  return { init, setChat, useToolPrompt };
})();
