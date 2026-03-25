import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: 'https://api.deepseek.com/v1',
});

async function test() {
  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Say hello and identify yourself as DeepSeek for HAMS." },
      ],
    });
    console.log("Success:", completion.choices[0].message.content);
  } catch (error: any) {
    console.error("DeepSeek Test Failed:", error.message);
  }
}

test();
