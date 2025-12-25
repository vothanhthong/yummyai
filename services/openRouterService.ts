import { Recipe } from "../types";

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "nvidia/nemotron-nano-12b-v2-vl:free";

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
  recentlySuggested: string[],
  image_data?: string
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

    const userContent: any[] = [
      { type: "text", text: userMessage + avoidanceInstruction }
    ];

    if (image_data) {
      // image_data should be a base64 string (without the data:image/xxx;base64, prefix if possible, 
      // but OpenRouter often accepts the full data URL or an object with data)
      userContent.push({
        type: "image_url",
        image_url: {
          url: image_data.startsWith('data:') ? image_data : `data:image/jpeg;base64,${image_data}`
        }
      });
    }

    const messages = [
      { role: "system" as const, content: SYSTEM_INSTRUCTION },
      ...history.map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: userContent },
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

// Generate meal plan for a week
export const generateMealPlan = async (
  preferences?: string
): Promise<{ meals: { date: string; mealType: string; recipe: Recipe }[]; text: string } | null> => {
  try {
    if (!API_KEY) {
      throw new Error("OpenRouter API key not configured");
    }

    const today = new Date();
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d.toISOString().split("T")[0]);
    }

    const MEAL_PLAN_PROMPT = `
Bạn là YummyAI, chuyên gia lên thực đơn tuần cho gia đình Việt Nam.
Hãy tạo thực đơn cho 7 ngày tới với 3 bữa mỗi ngày (sáng, trưa, tối).

${preferences ? `Yêu cầu của người dùng: ${preferences}` : ""}

QUY TẮC QUAN TRỌNG:

1. BỮA SÁNG (breakfast): Món đơn, nhanh gọn
   - Ví dụ: Phở, Bún bò, Xôi, Bánh mì, Cháo, Hủ tiếu...
   - Đây là món ăn đơn lẻ

2. BỮA TRƯA & TỐI (lunch/dinner): MÂM CƠM GIA ĐÌNH gồm 3 THÀNH PHẦN:
   - CANH: Canh chua, Canh rau, Canh xương, Súp...
   - MÓN MẶN: Kho, Rim, Chiên, Nướng, Hấp... (thịt/cá/hải sản)
   - RAU: Rau luộc, Rau xào, Salad...
   
   Tên món phải ghi theo format: "Mâm cơm: [Món mặn], [Canh] & [Rau]"
   Ví dụ: "Mâm cơm: Cá kho tộ, Canh chua cá lóc & Rau muống xào tỏi"
   
   Trong "ingredients" liệt kê nguyên liệu CHO CẢ 3 MÓN.
   Trong "instructions" chia thành các phần: "Món mặn:", "Canh:", "Rau:".

3. KHÔNG lặp lại món trong tuần
4. Đa dạng nguyên liệu: thịt heo, gà, bò, cá, tôm, đậu hũ...
5. Nguyên liệu dễ tìm tại Việt Nam

Trả về JSON theo format:
{
  "text": "Lời giới thiệu thực đơn tuần...",
  "meals": [
    {
      "date": "${days[0]}",
      "mealType": "breakfast",
      "recipe": {
        "name": "Tên món (ví dụ: Phở bò)",
        "description": "Mô tả ngắn",
        "cooking_time": 30,
        "difficulty": "Dễ",
        "meal_type": "Bữa sáng",
        "ingredients": [{"item": "Nguyên liệu", "amount": "Số lượng"}],
        "instructions": ["Bước 1...", "Bước 2..."],
        "tips": ["Mẹo 1..."]
      }
    },
    {
      "date": "${days[0]}",
      "mealType": "lunch",
      "recipe": {
        "name": "Mâm cơm: Thịt kho trứng, Canh bí đao & Rau cải luộc",
        "description": "Mâm cơm gia đình đầy đủ dinh dưỡng",
        "cooking_time": 60,
        "difficulty": "Trung bình",
        "meal_type": "Bữa trưa",
        "ingredients": [{"item": "Thịt ba chỉ", "amount": "300g"}, {"item": "Trứng", "amount": "4 quả"}],
        "instructions": ["MÓN MẶN - Thịt kho trứng:", "Bước 1...", "CANH:", "Bước 1...", "RAU:", "Bước 1..."],
        "tips": ["Mẹo 1..."]
      }
    }
  ]
}

Ngày trong tuần: ${days.join(", ")}
mealType phải là: breakfast, lunch, hoặc dinner
Tạo đúng 21 entry (7 ngày x 3 bữa).
`;


    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": typeof window !== "undefined" ? window.location.href : "",
        "X-Title": "YummyAI",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: MEAL_PLAN_PROMPT },
          { role: "user", content: preferences || "Hãy lên thực đơn tuần cho gia đình 2-4 người." },
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content");
    }

    // Clean up
    let cleaned = content.trim();
    if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
    if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
    if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();

    const result = JSON.parse(cleaned);

    // Ensure recipes have IDs
    if (result.meals) {
      result.meals = result.meals.map((m: any, i: number) => ({
        ...m,
        recipe: {
          ...m.recipe,
          id: m.recipe?.id || `ai_plan_${Date.now()}_${i}`,
          name: m.recipe?.name || "Món ăn",
          cooking_time: m.recipe?.cooking_time || 30,
          difficulty: m.recipe?.difficulty || "Trung bình",
          ingredients: m.recipe?.ingredients || [],
          instructions: m.recipe?.instructions || [],
          tips: m.recipe?.tips || [],
        },
      }));
    }

    return result;
  } catch (error) {
    console.error("Meal plan generation error:", error);
    return null;
  }
};
