fimport { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
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

// Reuse the instance to avoid redundant initialization
let genAIInstance: GoogleGenerativeAI | null = null;
const getGenAI = () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY is not set in environment variables');
    if (!genAIInstance) genAIInstance = new GoogleGenerativeAI(key);
    return genAIInstance;
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

    const modelOptions = fetchWithProxy ? { requestOptions: { fetch: fetchWithProxy } } : undefined;
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, modelOptions as any);

    const prompt = `Bạn là một trợ lý ảo quản lý tài sản chuyên nghiệp trong hệ thống y tế/bệnh viện.
    Dưới đây là thông tin chi tiết về tài sản. Hãy phân tích ngắn gọn (tối đa 3-4 câu tiếng Việt) về tình trạng thiết bị hiện tại, chỉ ra dấu hiệu bất thường nếu có nhiều lần sửa chữa hoặc báo hỏng, và đưa ra khuyến nghị bảo trì nếu cần:
    
    ${assetContext}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    res.json({ insight: responseText });
  } catch (error: any) {
    console.error('AI Error:', error);
    res.status(500).json({ 
        error: 'Lỗi khi lấy phân tích từ AI', 
        details: error.message,
        hasKey: !!process.env.GEMINI_API_KEY
    });
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
      Phân hệ: Quản lý tài sản, Luân chuyển, Sửa chữa, Kiểm định, Chấm công.
      Hãy trả lời ngắn gọn, lịch sự bằng tiếng Việt.
    `;

    const modelOptions = fetchWithProxy ? { requestOptions: { fetch: fetchWithProxy } } : undefined;
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, modelOptions as any);
    const chat = model.startChat({
      history: (history || []).map((h: any) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.parts[0].text }]
      })),
      generationConfig: { maxOutputTokens: 500 },
    });

    const fullPrompt = `${systemContext}\n\nNgười dùng: ${message}`;
    const result = await chat.sendMessage(fullPrompt);
    const responseText = result.response.text();

    res.json({ reply: responseText });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ 
        error: 'Lỗi khi chat với AI', 
        details: error.message,
        hasKey: !!process.env.GEMINI_API_KEY
    });
  }
};
