/* ============================================================
   SIDEBAR — recent chats, new chat, search, collapse toggle.
   Chat records are stored in localStorage so refreshing the
   page doesn't lose the demo conversation history.
   ============================================================ */
const NexaSidebar = (() => {
  const STORAGE_KEY = 'nexa.chats';
  let chats = [];
  let activeId = null;
  let onSelect = null;

  function load(){
    try{
      chats = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    }catch(e){ chats = []; }
    if(chats.length === 0){
      chats = [
        { id: cryptoId(), title:'Plan my week', messages:[] },
        { id: cryptoId(), title:'Explain closures in JS', messages:[] },
      ];
    }
  }

  function save(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  }

  function cryptoId(){
    return 'c_' + Math.random().toString(36).slice(2, 10);
  }

  function render(filter=''){
    const list = document.getElementById('chatList');
    list.innerHTML = '';
    const q = filter.trim().toLowerCase();
    const visible = chats.filter(c => c.title.toLowerCase().includes(q));

    if(visible.length === 0){
      list.innerHTML = `<div class="sidebar-empty">No chats match your search.</div>`;
      return;
    }

    visible.forEach(chat=>{
      const item = document.createElement('div');
      item.className = 'chat-item' + (chat.id === activeId ? ' active' : '');
      item.innerHTML = `
        <svg class="icon" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span>${escapeHtml(chat.title)}</span>
        <button class="chat-del" title="Delete chat" aria-label="Delete chat">
          <svg class="icon" viewBox="0 0 24 24" style="width:14px;height:14px"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
        </button>`;
      item.addEventListener('click', (e)=>{
        if(e.target.closest('.chat-del')) return;
        setActive(chat.id);
      });
      item.querySelector('.chat-del').addEventListener('click', ()=> remove(chat.id));
      list.appendChild(item);
    });
  }

  function escapeHtml(s){
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function setActive(id){
    activeId = id;
    render(document.getElementById('sidebarSearch').value);
    if(typeof onSelect === 'function') onSelect(getChat(id));
    if(window.innerWidth <= 900) document.querySelector('.app').classList.remove('sidebar-open');
  }

  function getChat(id){
    return chats.find(c => c.id === id);
  }

  function newChat(){
    const chat = { id: cryptoId(), title:'New chat', messages:[] };
    chats.unshift(chat);
    save();
    setActive(chat.id);
    return chat;
  }

  function remove(id){
    chats = chats.filter(c => c.id !== id);
    save();
    if(activeId === id){
      activeId = chats[0] ? chats[0].id : null;
      if(typeof onSelect === 'function') onSelect(getChat(activeId));
    }
    render(document.getElementById('sidebarSearch').value);
  }

  function renameActive(title){
    const chat = getChat(activeId);
    if(!chat) return;
    chat.title = title.slice(0, 48) || 'New chat';
    save();
    render(document.getElementById('sidebarSearch').value);
  }

  function updateActiveMessages(messages){
    const chat = getChat(activeId);
    if(!chat) return;
    chat.messages = messages;
    save();
  }

  function init(selectCallback){
    onSelect = selectCallback;
    load();
    render();
    activeId = chats[0] ? chats[0].id : null;

    document.getElementById('newChatBtn').addEventListener('click', newChat);
    document.getElementById('sidebarSearch').addEventListener('input', (e)=> render(e.target.value));
    document.getElementById('sidebarToggle').addEventListener('click', ()=>{
      document.querySelector('.app').classList.toggle('sidebar-collapsed');
    });
    document.getElementById('menuBtn').addEventListener('click', ()=>{
      document.querySelector('.app').classList.toggle('sidebar-open');
    });

    if(activeId && typeof onSelect === 'function') onSelect(getChat(activeId));
  }

  return { init, newChat, renameActive, updateActiveMessages, getActive: ()=>getChat(activeId) };
})();
