import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '../prisma';

const proxyUrl = process.env.PROXY_URL;
let fetchWithProxy: any = undefined;

if (proxyUrl) {
  try {
    const { HttpsProxyAgent } = require('https-proxy-agent');
    const crossFetch = require('cross-fetch');
    const agent = new HttpsProxyAgent(proxyUrl);
    fetchWithProxy = (url: string, options: any) => crossFetch(url, { ...options, agent });
    console.log('Gemini AI is using proxy:', proxyUrl);
  } catch (e) {
    console.warn('Proxy setup failed, running without proxy:', e);
  }
}

// Reuse the instance to avoid redundant initialization
let genAIInstance: GoogleGenerativeAI | null = null;
const getGenAI = () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY is not set in environment variables');
    if (!genAIInstance) genAIInstance = new GoogleGenerativeAI(key);
    return genAIInstance;
};

// Helper map role — "assistant" → "model" cho Gemini
const mapHistory = (history: any[]): any[] => {
  return (history || [])
    .filter(msg => msg.role === 'user' || msg.role === 'assistant')
    .map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content || msg.parts?.[0]?.text || '' }],
    }));
};

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

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const assetContext = `
      Asset Name: ${(asset as any).name}
      Status: ${(asset as any).statusConfig?.tentt || 'Unknown'}
      Type: ${(asset as any).equipmentType?.name || 'Unknown'}
      Purchase Date: ${(asset as any).purchaseDate || 'Unknown'}
      Recent Histories: ${(asset as any).histories?.map((h: any) => h.actionType + ' on ' + h.date).join(', ') || 'None'}
      Past Maintenances: ${(asset as any).maintenances?.length || 0}
      Support Tickets: ${(asset as any).tickets?.length || 0} (latest: ${(asset as any).tickets?.[0]?.title || 'None'})
    `;

    const modelOptions = fetchWithProxy ? { requestOptions: { fetch: fetchWithProxy }, apiVersion: 'v1beta' } : { apiVersion: 'v1beta' };
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: `Bạn là chuyên gia phân tích tài sản bệnh viện chuyên nghiệp. Phân tích kỹ thuật ngắn gọn (tối đa 3-4 câu tiếng Việt), chỉ ra dấu hiệu bất thường và đưa ra khuyến nghị bảo trì cụ thể.`
    }, modelOptions as any);

    const prompt = `Phân tích tình trạng thiết bị sau và đưa ra khuyến nghị bảo trì:
    ${assetContext}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    res.json({ insight: responseText });
  } catch (error: any) {
    console.error('AI Error:', error);
    const isQuotaError = error.message?.includes('429') || error.status === 429;
    res.status(isQuotaError ? 429 : 500).json({ 
        error: isQuotaError ? 'Hệ thống AI đang bận (hết hạn mức), vui lòng thử lại sau.' : 'Lỗi khi lấy phân tích từ AI', 
        details: error.message,
        hasKey: !!process.env.GEMINI_API_KEY
    });
  }
};

export const chatWithAI = async (req: Request, res: Response): Promise<any> => {
  try {
    const { message, history } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const [assetCount, employeeCount, pendingMaintenance] = await Promise.all([
      prisma.asset.count(),
      prisma.employee.count(),
      prisma.maintenanceRecord.count({ where: { status: 'PENDING' } })
    ]);

    const systemInstruction = `Bạn là trợ lý ảo HAMS (Hospital Asset Management System). 
Dữ liệu hiện tại của hệ thống:
- Tổng số tài sản: ${assetCount}
- Tổng số nhân viên: ${employeeCount}
- Số phiếu bảo trì đang chờ: ${pendingMaintenance}
Phân hệ hỗ trợ: Quản lý tài sản, Luân chuyển, Sửa chữa, Kiểm định, Chấm công.
Hãy trả lời ngắn gọn, lịch sự bằng tiếng Việt. Chỉ tư vấn trong phạm vi quản lý tài sản bệnh viện.`;

    const modelOptions = fetchWithProxy ? { requestOptions: { fetch: fetchWithProxy }, apiVersion: 'v1beta' } : { apiVersion: 'v1beta' };
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction
    }, modelOptions as any);

    const chat = model.startChat({
      history: mapHistory(history),
      generationConfig: { maxOutputTokens: 500 },
    });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    res.json({ reply: responseText });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    const isQuotaError = error.message?.includes('429') || error.status === 429;
    res.status(isQuotaError ? 429 : 500).json({ 
        error: isQuotaError ? 'Hệ thống AI đang bận (hết hạn mức), vui lòng thử lại sau.' : 'Lỗi khi chat với AI', 
        details: error.message,
        hasKey: !!process.env.GEMINI_API_KEY
    });
  }
};
