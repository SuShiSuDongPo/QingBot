# 🐉 乾隆皇帝 AI 御前对话

> 大模型驱动的清朝乾隆皇帝聊天机器人，部署于 Vercel，使用 DeepSeek API。

## 🚀 部署步骤

1. Fork 本仓库到你的 GitHub。
2. 在 [Vercel](https://vercel.com) 中导入该仓库。
3. **设置环境变量**：在 Vercel 项目 `Settings -> Environment Variables` 中添加：
   - Key: `DEEPSEEK_API_KEY`
   - Value: 你的 DeepSeek API 密钥（以 `sk-` 开头）
4. 触发部署。访问网站即可直接与乾隆皇帝对话。

## 🔐 安全性

- 所有 AI 调用通过 Vercel Serverless Function (`/api/chat`) 代理。
- API 密钥仅存储在 Vercel 的环境变量中，**不会暴露给浏览器**。
- 无需前端输入任何密钥。

## 🏯 本地测试

使用 `vercel dev` 或直接打开 `index.html`（本地无 API 密钥时仅使用预设回复）。

---

大清盛世，万国来朝！
