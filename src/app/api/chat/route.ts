import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAllLessons, getLessonContent } from '@/lib/lessons';

export async function POST(req: Request) {
  try {
    const { messages, currentSlug } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return new Response('Thiếu API Key cho Gemini', { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Build context
    const lessons = getAllLessons();
    let contextText = 'Bạn là AI Trợ lý học tập nhiệt tình tên là "NetHub AI" cho khoá học .NET này. Mục tiêu của bạn là giúp học viên hiểu các khái niệm, sửa lỗi code và gợi ý cách học tốt hơn.\n\n';

    if (currentSlug) {
      try {
        const currentLesson = getLessonContent(currentSlug);
        if (currentLesson) {
          contextText += '--- BỐI CẢNH HIỆN TẠI ---\n';
          contextText += `Người dùng đang đọc bài: ${currentLesson.meta.title} (Phần: ${currentLesson.meta.sectionName})\n`;
          // Lấy tối đa khoảng 5000 ký tự để không quá dài, nhưng Gemini 1.5 thoải mái
          contextText += `Nội dung bài học (trích lục):\n${currentLesson.content}\n\n-----------------\n\n`;
        }
      } catch (e) {
        console.warn('Could not read current lesson', e);
      }
    }

    contextText += 'LỘ TRÌNH HỌC (Tổng quan cấu trúc khóa học để bạn có thể tham chiếu nếu cần):\n';
    const roadmap = lessons.map(l => `- ${l.sectionName}: ${l.title}`).join('\n');
    contextText += roadmap + '\n\n';

    contextText += 'HƯỚNG DẪN TRẢ LỜI:\n- Trả lời bằng tiếng Việt, thân thiện, rõ ràng.\n- Dùng Markdown để định dạng chữ và code block.\n- Nếu người hỏi lỗi lập trình, hãy giải thích nguyên nhân kèm ví dụ cách sửa.\n- Trả lời ngắn gọn, trực tiếp vào vấn đề trừ khi người dùng yêu cầu giải thích chi tiết.';

    // Initialize chat
    let history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    // Gemini API yêu cầu history phải bắt đầu bằng 'user'. Nếu phần tử đầu là 'model' (lời chào mặc định) -> bỏ qua
    if (history.length > 0 && history[0].role === 'model') {
      history = history.slice(1);
    }

    // Start chat instance
    const chat = model.startChat({
      history,
      systemInstruction: {
        role: 'system',
        parts: [{ text: contextText }]
      } as any // ép kiểu để tránh lỗi với vài bản SDK
    });

    const userMessage = messages[messages.length - 1]?.content;
    if (!userMessage) {
      return new Response('Tin nhắn trống', { status: 400 });
    }

    // Streaming
    const result = await chat.sendMessageStream(userMessage);

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              const encoder = new TextEncoder();
              controller.enqueue(encoder.encode(chunkText));
            }
          }
          controller.close();
        } catch (err) {
          console.error('Stream error:', err);
          controller.error(err);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response('Lỗi xử lý yêu cầu AI', { status: 500 });
  }
}
