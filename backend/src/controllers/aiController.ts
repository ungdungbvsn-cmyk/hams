import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import prisma from '../prisma';
import HttpsProxyAgent from 'https-proxy-agent';
import fetch from 'cross-fetch';

const proxyUrl = process.env.PROXY_URL;
let fetchWithProxy: any = undefined;

if (proxyUrl) {
  const agent = new (HttpsProxyAgent as any)(proxyUrl);
  fetchWithProxy = (url: string, options: any) => fetch(url, { ...options, agent });
  console.log('Gemini AI is using proxy:', proxyUrl);
}

// AI Instances
let genAIInstance: GoogleGenerativeAI | null = null;
const getGenAI = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  if (!genAIInstance) genAIInstance = new GoogleGenerativeAI(key);
  return genAIInstance;
};

const getOpenAI = () => {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  return new OpenAI({ apiKey: key });
};

const getDeepSeek = () => {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) return null;
  return new OpenAI({
    apiKey: key,
    baseURL: 'https://api.deepseek.com/v1'
  });
};

/**
 * Unified helper to get AI completion with fallback
 */
async function getAICompletion(prompt: string, systemContext: string = '', history: any[] = []): Promise<string> {
  // 1. Try Gemini
  const genAI = getGenAI();
  if (genAI) {
    // Models to try in order
    const modelsToTry = ["gemini-3-flash", "gemini-2.5-flash", "gemini-1.5-flash"];
    
    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting Gemini AI (${modelName})...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        // If history is provided, use chat mode
        if (history.length > 0) {
          const chat = model.startChat({
            history: history.map((h: any) => ({
              role: h.role === 'user' ? 'user' : 'model',
              parts: [{ text: h.content || h.parts[0].text }]
            })),
          });
          const result = await chat.sendMessage(`${systemContext}\n\n${prompt}`);
          return result.response.text();
        } else {
          const result = await model.generateContent(`${systemContext}\n\n${prompt}`);
          return result.response.text();
        }
      } catch (error: any) {
        console.error(`Gemini (${modelName}) failed:`, error.message);
        // Fall through to next Gemini model or next provider
      }
    }
  }

  // 2. Try OpenAI
  const openai = getOpenAI();
  if (openai) {
    try {
      console.log('Falling back to OpenAI...');
      const messages: any[] = [];
      if (systemContext) messages.push({ role: 'system', content: systemContext });
      
      history.forEach((h: any) => {
        messages.push({ 
          role: h.role === 'user' ? 'user' : 'assistant', 
          content: h.content || h.parts[0].text 
        });
      });
      
      messages.push({ role: 'user', content: prompt });

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 500,
      });
      return response.choices[0].message.content || '';
    } catch (error: any) {
      console.error('OpenAI failed:', error.message);
    }
  }

  // 3. Try DeepSeek (OpenAI compatible)
  const deepseek = getDeepSeek();
  if (deepseek) {
    try {
      console.log('Falling back to DeepSeek...');
      const messages: any[] = [];
      if (systemContext) messages.push({ role: 'system', content: systemContext });
      
      history.forEach((h: any) => {
        messages.push({ 
          role: h.role === 'user' ? 'user' : 'assistant', 
          content: h.content || h.parts[0].text 
        });
      });
      
      messages.push({ role: 'user', content: prompt });

      const response = await (deepseek as any).chat.completions.create({
        model: "deepseek-chat",
        messages,
        max_tokens: 500,
      });
      return response.choices[0].message.content || '';
    } catch (error: any) {
      console.error('DeepSeek failed:', error.message);
    }
  }

  throw new Error('All AI providers failed or are not configured.');
}

export const getAssetInsights = async (req: Request, res: Response): Promise<any> => {
  try {
    const { assetId } = req.body;
    const asset = await prisma.asset.findUnique({
      where: { id: Number(assetId) },
      include: {
        equipmentType: true,
        department: true,
        statusConfig: true,
        histories: { orderBy: { date: 'desc' }, take: 5 },
        maintenances: { orderBy: { startDate: 'desc' } },
        tickets: { orderBy: { createdAt: 'desc' } },
      }
    });

    if (!asset) return res.status(404).json({ error: 'Asset not found' });

    const assetContext = `
      Asset Name: ${(asset as any).name}
      Status: ${(asset as any).statusConfig?.tentt || 'Unknown'}
      Type: ${(asset as any).equipmentType?.name || 'Unknown'}
      Purchase Date: ${(asset as any).purchaseDate || 'Unknown'}
      Recent Histories: ${(asset as any).histories?.map((h: any) => h.actionType + ' on ' + h.date).join(', ') || 'None'}
      Past Maintenances: ${(asset as any).maintenances?.length || 0}
      Support Tickets: ${(asset as any).tickets?.length || 0} (latest: ${(asset as any).tickets?.[0]?.title || 'None'})
    `;

    const systemContext = `Bạn là một trợ lý ảo quản lý tài sản chuyên nghiệp trong hệ thống y tế/bệnh viện.
    Hãy phân tích ngắn gọn (tối đa 3-4 câu tiếng Việt) về tình trạng thiết bị hiện tại, chỉ ra dấu hiệu bất thường nếu có nhiều lần sửa chữa hoặc báo hỏng, và đưa ra khuyến nghị bảo trì nếu cần.`;

    const insight = await getAICompletion(assetContext, systemContext);
    res.json({ insight });
  } catch (error: any) {
    console.error('AI Insights Error:', error);
    res.status(500).json({ error: 'Lỗi khi lấy phân tích từ AI', details: error.message });
  }
};

export const chatWithAI = async (req: Request, res: Response): Promise<any> => {
  try {
    const { message, history } = req.body;
    
    const [assetCount, employeeCount, pendingMaintenance] = await Promise.all([
      prisma.asset.count(),
      prisma.employee.count(),
      prisma.maintenanceRecord.count({ where: { status: 'PENDING' } })
    ]);

    const systemContext = `
      Bạn là trợ lý ảo HAMS (Hospital Asset Management System).
      Tổng số tài sản: ${assetCount}.
      Tổng số nhân viên: ${employeeCount}.
      Số phiếu bảo trì đang chờ: ${pendingMaintenance}.
      Hãy trả lời ngắn gọn, lịch sự bằng tiếng Việt.
    `;

    const reply = await getAICompletion(message, systemContext, history || []);
    res.json({ reply });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: 'Lỗi khi chat với AI', details: error.message });
  }
};
