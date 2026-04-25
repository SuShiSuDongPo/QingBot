export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '仅支持 POST 请求' });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: '需要提供 message' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error('服务器未配置 DEEPSEEK_API_KEY 环境变量');
    return res.status(500).json({ error: '陛下暂未配置御用令牌' });
  }

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
          { role: 'user', content: message }
        ],
        temperature: 0.8,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      console.error('DeepSeek API 错误:', response.status);
      return res.status(502).json({ error: '朕的御用 AI 暂时无法应答' });
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;
    return res.status(200).json({ reply });
  } catch (error) {
    console.error('网络异常:', error);
    return res.status(502).json({ error: '朕的廷议线路受阻，稍后再奏' });
  }
}
