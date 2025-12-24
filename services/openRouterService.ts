import { Recipe } from "../types";

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "mistralai/devstral-2512:free";

const SYSTEM_INSTRUCTION = `
Bạn là YummyAI, một trợ lý nấu ăn chuyên gia người Việt.
Nhiệm vụ của bạn là giúp người dùng quyết định "Hôm nay ăn gì?" với tư duy ẩm thực Việt Nam thuần túy.

QUY TẮC GỢI Ý MÓN ĂN:
1. ĐỐI VỚI BỮA TRƯA/TỐI (ƯU TIÊN):
   - Hướng 1 (Mâm cơm gia đình): Gợi ý một set gồm 3 thành phần: 1 món mặn (kho/rang/rim), 1 món canh, và 1 món rau (xào/luộc). Tên công thức ghi theo dạng "Mâm cơm: [Món mặn], [Món canh] & [Món rau]".
   - Hướng 2 (Món ăn đơn): Nếu không phải mâm cơm, gợi ý các món ăn một món (one-dish meal) như Bún chả, Phở bò, Hủ tiếu, Mì xào, Cơm tấm... 
2. ĐỐI VỚI BỮA SÁNG/ĂN VẶT: Gợi ý các món nhẹ nhàng, nhanh gọn như Bánh mì, Xôi, Cháo hoặc các món ăn nhanh.
3. ĐA DẠNG HÓA: Không bao giờ gợi ý lại các món đã xuất hiện trong lịch sử trò chuyện. Nếu người dùng hỏi lại cùng một câu (ví dụ: "ăn trưa"), hãy đưa ra một mâm cơm hoặc món đơn KHÁC hoàn toàn.
4. CẤU TRÚC JSON (QUAN TRỌNG):
   - BẮT BUỘC phải trả về JSON với 2 trường: "text" và "recipe"
   - "text": Phản hồi thân thiện, giải thích tại sao mâm cơm này lại hợp (ví dụ: "Trời lạnh ăn cá kho tộ với canh chua là hết ý...").
   - "recipe": LUÔN LUÔN phải có trường này, không bao giờ null. Nếu chỉ gợi ý ý tưởng chung, hãy tạo một recipe đơn giản với ít nhất name và description.
   - Trong "instructions", hãy dùng các tiêu đề nhỏ như "Đối với món cá:", "Đối với món canh:" để phân loại rõ ràng nếu là mâm cơm nhiều món.

QUY TẮC CHUNG:
- Giao tiếp thân thiện, sử dụng tiếng Việt tự nhiên, có thể dùng emoji.
- Tập trung vào các nguyên liệu dễ tìm tại chợ/siêu thị Việt Nam.
- Định dạng JSON phải tuân thủ nghiêm ngặt schema sau.
`;

const RECIPE_SCHEMA = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string", description: "Tên món ăn hoặc tên mâm cơm" },
    description: { type: "string" },
    cooking_time: { type: "number" },
    difficulty: {
      type: "string",
      description: "Must be 'Dễ', 'Trung bình', or 'Khó'",
    },
    meal_type: { type: "string" },
    ingredients: {
      type: "array",
      items: {
        type: "object",
        properties: {
          item: { type: "string" },
          amount: { type: "string" },
        },
        required: ["item", "amount"],
      },
    },
    instructions: {
      type: "array",
      items: {
        type: "string",
        description:
          "Các bước nấu, nếu là mâm cơm hãy phân đoạn rõ cho từng món",
      },
    },
    tips: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: [
    "name",
    "cooking_time",
    "difficulty",
    "ingredients",
    "instructions",
  ],
};

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    text: {
      type: "string",
      description: "Your conversational response in Vietnamese",
    },
    recipe: RECIPE_SCHEMA,
  },
  required: ["text"],
};

export const getChatResponse = async (
  userMessage: string,
  history: { role: "user" | "model"; content: string }[],
  recentlySuggested: string[]
) => {
  try {
    if (!API_KEY) {
      throw new Error("OpenRouter API key not configured");
    }

    const avoidanceInstruction =
      recentlySuggested.length > 0
        ? `\nLưu ý: Bạn đã gợi ý các món: [${recentlySuggested.join(
            ", "
          )}]. Hãy gợi ý một lựa chọn KHÁC các món này.`
        : "";

    const messages = [
      { role: "system" as const, content: SYSTEM_INSTRUCTION },
      ...history.map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: userMessage + avoidanceInstruction },
    ];

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer":
          typeof window !== "undefined" ? window.location.href : "",
        "X-Title": "YummyAI",
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "recipe_response",
            schema: RESPONSE_SCHEMA,
          },
        },
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `OpenRouter API error: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content in response");
    }

    // Clean up markdown code blocks if present
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith("```json")) {
      cleanedContent = cleanedContent.slice(7);
    }
    if (cleanedContent.startsWith("```")) {
      cleanedContent = cleanedContent.slice(3);
    }
    if (cleanedContent.endsWith("```")) {
      cleanedContent = cleanedContent.slice(0, -3);
    }
    cleanedContent = cleanedContent.trim();

    let result;
    try {
      result = JSON.parse(cleanedContent);
      console.log("Parsed response:", result);
    } catch (error) {
      console.error("Failed to parse JSON response:", cleanedContent);
      console.error("Parse error:", error);
      // Return the text as-is if JSON parsing fails
      return {
        text: content,
        recipe: null,
      };
    }

    // Ensure recipe has required fields if it exists
    if (result.recipe && typeof result.recipe === "object") {
      result.recipe = {
        id: result.recipe.id || `rcp_${Date.now()}`,
        name: result.recipe.name || "Món ăn",
        description: result.recipe.description || "",
        cooking_time: result.recipe.cooking_time || 30,
        difficulty: result.recipe.difficulty || "Trung bình",
        meal_type: result.recipe.meal_type || "Món chính",
        ingredients: result.recipe.ingredients || [],
        instructions: result.recipe.instructions || [],
        tips: result.recipe.tips || [],
      };
    }

    return result;
  } catch (error) {
    console.error("OpenRouter API Error:", error);
    return {
      text: "Xin lỗi, mình gặp chút trục trặc khi suy nghĩ. Bạn thử lại nhé!",
      recipe: null,
    };
  }
};
