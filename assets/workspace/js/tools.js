/* ============================================================
   TOOLS — quick-start prompt cards shown on the welcome screen.
   ============================================================ */
const NexaTools = (() => {
  const TOOLS = [
    { title:'Study Buddy', desc:'Explain a topic step by step', prompt:'Explain this topic to me like I\'m new to it: ', icon:'graduation' },
    { title:'Code Helper', desc:'Debug or write a function', prompt:'Help me fix this code:\n\n', icon:'code' },
    { title:'Research Assistant', desc:'Dig into a question deeply', prompt:'Research this for me and summarize the key points: ', icon:'compass' },
    { title:'Document Analyzer', desc:'Break down a file or text', prompt:'Analyze this document and pull out the key points: ', icon:'file' },
    { title:'Plan & Organize', desc:'Plan my day or a project', prompt:'Help me plan my day. Here\'s what I need to get done: ', icon:'clipboard' },
    { title:'Image Generator', desc:'Describe an image to create', prompt:'Generate an image of: ', icon:'image' },
  ];

  const ICONS = {
    graduation:'<path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/>',
    code:'<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
    compass:'<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/>',
    file:'<path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>',
    clipboard:'<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
    image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  };

  function render(){
    const grid = document.getElementById('toolsGrid');
    grid.innerHTML = TOOLS.map(t => `
      <button class="tool-card" data-tool-prompt="${t.prompt.replace(/"/g,'&quot;')}">
        <span class="tool-icon"><svg class="icon" viewBox="0 0 24 24">${ICONS[t.icon]}</svg></span>
        <span class="tool-title">${t.title}</span>
        <span class="tool-desc">${t.desc}</span>
      </button>`).join('');
  }

  return { render };
})();
