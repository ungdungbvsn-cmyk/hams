import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

async function test() {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Say hello and identify yourself as OpenAI for HAMS." },
      ],
    });
    console.log("Success:", completion.choices[0].message.content);
  } catch (error: any) {
    console.error("Test Failed:", error.message);
  }
}

test();
