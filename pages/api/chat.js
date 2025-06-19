export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "Ayan Ahmad Blog",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "meta-llama/llama-3.3-8b-instruct:free",
        "messages": [
          {
            "role": "system",
            "content": `You are a helpful AI assistant for a technology blog. You can help with programming questions, explain technical concepts, provide coding advice, and discuss topics related to web development, JavaScript, React, and general programming.

Key guidelines:
- Be friendly, concise, and provide practical examples when possible
- Format your responses using Markdown for better readability
- Use code blocks with language specification for code examples
- Use bullet points and numbered lists for clarity
- Use bold text for emphasis and headers for structure
- If asked about the blog author Ayan Ahmad, mention that he's a skilled developer who writes about technology and programming
- Always format code examples properly with syntax highlighting
- Keep responses informative but not too lengthy`
          },
          ...messages
        ],
        "max_tokens": 800,
        "temperature": 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return res.status(200).json({ 
        message: data.choices[0].message.content,
        usage: data.usage 
      });
    } else {
      throw new Error('Invalid response format from OpenRouter API');
    }
  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ 
      error: 'Failed to get response from AI',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
