// ==================== DOM ELEMENTS ====================
const chatArea = document.getElementById('chatArea');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const quickSuggestions = document.getElementById('quickSuggestions');
const particlesContainer = document.getElementById('particles');

// Settings DOM
const settingsOverlay = document.getElementById('settingsOverlay');
const openSettingsBtn = document.getElementById('openSettingsBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const apiKeyInput = document.getElementById('apiKeyInput');
const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');

// ==================== PARTICLES ====================
function createParticles() {
  for (let i = 0; i < 35; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    const size = Math.random() * 4 + 2;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDuration = Math.random() * 10 + 8 + 's';
    particle.style.animationDelay = Math.random() * 10 + 's';
    particlesContainer.appendChild(particle);
  }
}
createParticles();

// ==================== API SETTINGS ====================
function getApiKey() {
  return localStorage.getItem('deepseek_api_key') || '';
}

function setApiKey(key) {
  localStorage.setItem('deepseek_api_key', key.trim());
}

// Settings modal logic
openSettingsBtn.addEventListener('click', () => {
  apiKeyInput.value = getApiKey();
  settingsOverlay.classList.add('active');
});

closeSettingsBtn.addEventListener('click', () => {
  settingsOverlay.classList.remove('active');
});

saveApiKeyBtn.addEventListener('click', () => {
  const key = apiKeyInput.value.trim();
  if (key) {
    setApiKey(key);
    alert('御用令牌已启用。现在朕将以真 AI 与你对话。');
  } else {
    localStorage.removeItem('deepseek_api_key');
    alert('令牌已清除。将使用预设奏对。');
  }
  settingsOverlay.classList.remove('active');
});

// Close modal by clicking overlay background
settingsOverlay.addEventListener('click', (e) => {
  if (e.target === settingsOverlay) settingsOverlay.classList.remove('active');
});

// ==================== FALLBACK RESPONSES ====================
const fallbackResponses = {
  greetings: [
    '免礼平身。朕今日精神尚佳，有何事要奏？',
    '嗯，你来了。朕在此批阅奏章，正好歇息片刻。说吧。',
    '朕听闻民间多有议论朕者。你是何人？所为何来？',
  ],
  merits: [
    '朕在位期间，十全武功威震四方：两平准噶尔、定回部、扫金川、靖台湾、降缅甸、安南、再平廓尔喀。此乃朕之\"十全武功\"，使大清疆域之广，超越汉唐！',
    '朕最引以为傲者，乃编纂《四库全书》。收书三千余种，七万九千余卷，历时十余年，动用四千余人抄写七部，分藏南北。此乃华夏文化之集大成者！',
  ],
  poetry: [
    '朕素爱吟咏。听朕即兴一首：\"龙飞凤舞御乾坤，万里江山入眼新。四海升平歌盛世，千秋功业在民心。\"如何？',
    '朕有诗云：\"江山如画里，人物更风流。欲识乾坤大，须登最上楼。\"',
  ],
  western: [
    '西洋之器物，精巧有余而大道不足。朕收其钟表、珐琅为玩物，然其蛮夷之邦，终究难窥华夏文明之堂奥。',
    '马戛尔尼使团曾来朝贡，欲与朕通商。然朕天朝物产丰盈，无所不有，无需与外夷互通有无。',
  ],
  southern: [
    '朕六下江南，非为游山玩水，实为体察民情、巡视河工。江南乃天下财赋之地，朕亲临其境，方知百姓疾苦。',
    '南巡途中，朕最爱驻跸扬州、苏州。那瘦西湖畔、拙政园中，皆留下朕之足迹。',
  ],
  governance: [
    '朕治理天下，以\"宽严相济\"为要。对忠臣良将，朕不吝赏赐；对贪官污吏，朕绝不姑息。',
    '用人乃治国第一要务。朕用人不拘一格，如纪晓岚、刘墉等皆出身寒门而官至大学士。',
  ],
  default: [
    '嗯…此事说来话长。朕觉得，凡事皆需审时度势、权衡利弊。你且细细思量。',
    '有趣。竟有人问朕此事。朕以为，世间万物皆循天道，顺之者昌，逆之者亡。',
  ]
};

function getFallbackCategory(msg) {
  const m = msg.toLowerCase();
  if (/再见|退下|告退/.test(m)) return 'greetings';
  if (/功绩|成就|武功|四库/.test(m)) return 'merits';
  if (/诗|词|吟|咏/.test(m)) return 'poetry';
  if (/西洋|西方|外国/.test(m)) return 'western';
  if (/南巡|江南|扬州/.test(m)) return 'southern';
  if (/治理|治国|用人/.test(m)) return 'governance';
  return 'default';
}

function getFallbackResponse(userMessage) {
  const cat = getFallbackCategory(userMessage);
  const pool = fallbackResponses[cat] || fallbackResponses.default;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ==================== DEEPSEEK API CALL ====================
async function callDeepSeek(userMessage) {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const systemPrompt = `你是大清乾隆皇帝，爱新觉罗·弘历，年号乾隆。你统治着盛世大清，自信、博学、威严但不失风趣。说话用半文半白的中文，自称“朕”，称呼对方为“卿”或“尔”。你喜爱诗词、收藏、南巡，对自己的十全武功和四库全书非常自豪。回答要符合乾隆的口吻，长度适中。`;

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.8,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      console.error('DeepSeek API error:', response.status);
      return null;
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Network error calling DeepSeek:', error);
    return null;
  }
}

// ==================== CHAT UI HELPERS ====================
function scrollToBottom() {
  chatArea.scrollTop = chatArea.scrollHeight;
}

function getTimeString() {
  const now = new Date();
  const h = now.getHours(), m = String(now.getMinutes()).padStart(2, '0');
  const shichen = ['子时','丑时','寅时','卯时','辰时','巳时','午时','未时','申时','酉时','戌时','亥时'][Math.floor((h+1)%24/2)];
  return `${shichen} · ${h}:${m}`;
}

function createMessageElement(role, text) {
  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.innerHTML = `
    <div class="avatar">${role === 'emperor' ? '🐉' : '👤'}</div>
    <div class="bubble">
      <div class="sender-name">${role === 'emperor' ? '乾隆皇帝 · Emperor Qianlong' : '卿 · 奏事者'}</div>
      <div>${text}</div>
      <div class="time-stamp">${getTimeString()}</div>
    </div>
  `;
  return div;
}

function addTypingIndicator() {
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message emperor';
  typingDiv.id = 'typingIndicator';
  typingDiv.innerHTML = `
    <div class="avatar">🐉</div>
    <div class="bubble" style="padding:12px 18px;">
      <div class="typing-indicator"><span></span><span></span><span></span></div>
    </div>
  `;
  chatArea.appendChild(typingDiv);
  scrollToBottom();
}

function removeTypingIndicator() {
  const ind = document.getElementById('typingIndicator');
  if (ind) ind.remove();
}

// ==================== SEND MESSAGE ====================
async function handleSend(messageText) {
  const trimmed = messageText.trim();
  if (!trimmed) return;

  // Disable input
  userInput.disabled = true;
  sendBtn.disabled = true;
  userInput.value = '';

  // Add user message
  chatArea.appendChild(createMessageElement('user', trimmed));
  scrollToBottom();

  // Show typing
  addTypingIndicator();

  let replyText = '';

  // Try DeepSeek first
  const aiResponse = await callDeepSeek(trimmed);
  if (aiResponse) {
    replyText = aiResponse;
  } else {
    // Fallback
    replyText = getFallbackResponse(trimmed);
  }

  // Simulate a short thinking delay if fallback (AI already has network delay)
  if (!aiResponse) await new Promise(r => setTimeout(r, 800 + Math.random() * 700));

  removeTypingIndicator();
  chatArea.appendChild(createMessageElement('emperor', replyText));
  scrollToBottom();

  // Re-enable
  userInput.disabled = false;
  sendBtn.disabled = false;
  userInput.focus();
}

// ==================== EVENT LISTENERS ====================
sendBtn.addEventListener('click', () => handleSend(userInput.value));
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleSend(userInput.value);
  }
});

quickSuggestions.addEventListener('click', (e) => {
  if (e.target.classList.contains('chip')) {
    const msg = e.target.getAttribute('data-msg');
    if (msg) handleSend(msg);
  }
});

// Focus input
userInput.focus();
