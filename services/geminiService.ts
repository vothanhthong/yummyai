
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const RECIPE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    name: { type: Type.STRING, description: "Tên món ăn hoặc tên mâm cơm (VD: Mâm cơm: Cá kho, Canh chua & Rau muống)" },
    description: { type: Type.STRING },
    cooking_time: { type: Type.INTEGER },
    difficulty: { type: Type.STRING, description: "Must be 'Dễ', 'Trung bình', or 'Khó'" },
    meal_type: { type: Type.STRING },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          item: { type: Type.STRING },
          amount: { type: Type.STRING }
        },
        required: ["item", "amount"]
      }
    },
    instructions: {
      type: Type.ARRAY,
      items: { type: Type.STRING, description: "Các bước nấu, nếu là mâm cơm hãy phân đoạn rõ cho từng món" }
    },
    tips: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    }
  },
  required: ["name", "cooking_time", "difficulty", "ingredients", "instructions"]
};

const SYSTEM_INSTRUCTION = `
Bạn là YummyAI, một trợ lý nấu ăn chuyên gia người Việt.
Nhiệm vụ của bạn là giúp người dùng quyết định "Hôm nay ăn gì?" với tư duy ẩm thực Việt Nam thuần túy.

QUY TẮC GỢI Ý MÓN ĂN:
1. ĐỐI VỚI BỮA TRƯA/TỐI (ƯU TIÊN):
   - Hướng 1 (Mâm cơm gia đình): Gợi ý một set gồm 3 thành phần: 1 món mặn (kho/rang/rim), 1 món canh, và 1 món rau (xào/luộc). Tên công thức ghi theo dạng "Mâm cơm: [Món mặn], [Món canh] & [Món rau]".
   - Hướng 2 (Món ăn đơn): Nếu không phải mâm cơm, gợi ý các món ăn một món (one-dish meal) như Bún chả, Phở bo, Hủ tiếu, Mì xào, Cơm tấm... 
2. ĐỐI VỚI BỮA SÁNG/ĂN VẶT: Gợi ý các món nhẹ nhàng, nhanh gọn như Bánh mì, Xôi, Cháo hoặc các món ăn nhanh.
3. ĐA DẠNG HÓA: Không bao giờ gợi ý lại các món đã xuất hiện trong lịch sử trò chuyện. Nếu người dùng hỏi lại cùng một câu (ví dụ: "ăn trưa"), hãy đưa ra một mâm cơm hoặc món đơn KHÁC hoàn toàn.
4. CẤU TRÚC JSON:
   - "text": Phản hồi thân thiện, giải thích tại sao mâm cơm này lại hợp (ví dụ: "Trời lạnh ăn cá kho tộ với canh chua là hết ý...").
   - "recipe": Chi tiết nguyên liệu và cách làm. Trong phần "instructions", hãy dùng các tiêu đề nhỏ như "Đối với món cá:", "Đối với món canh:" để phân loại rõ ràng nếu là mâm cơm nhiều món.

QUY TẮC CHUNG:
- Giao tiếp thân thiện, sử dụng tiếng Việt tự nhiên, có thể dùng emoji.
- Tập trung vào các nguyên liệu dễ tìm tại chợ/siêu thị Việt Nam.
- Định dạng JSON phải tuân thủ nghiêm ngặt schema.
`;

export const getChatResponse = async (userMessage: string, history: { role: 'user' | 'model', parts: { text: string }[] }[], recentlySuggested: string[]) => {
  try {
    const avoidanceInstruction = recentlySuggested.length > 0 
      ? `\nLưu ý: Bạn đã gợi ý các món: [${recentlySuggested.join(", ")}]. Hãy gợi ý một lựa chọn KHÁC các món này.` 
      : "";

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history,
        { role: 'user', parts: [{ text: userMessage + avoidanceInstruction }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING, description: "Your conversational response in Vietnamese" },
            recipe: RECIPE_SCHEMA
          },
          required: ["text"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { 
      text: "Xin lỗi, mình gặp chút trục trặc khi suy nghĩ. Bạn thử lại nhé!",
      recipe: null 
    };
  }
};
