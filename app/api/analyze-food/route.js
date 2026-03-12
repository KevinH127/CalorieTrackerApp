import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { text, image, mimeType } = body;

    if (!text && !image) {
      return NextResponse.json(
        { error: "Please provide either text or an image of your food." },
        { status: 400 }
      );
    }

    // Use gemini-1.5-flash as specified, which is fast and supports multimodal
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `
      You are an expert nutritionist API. Analyze the provided food information (either text description or image).
      Estimate the total calories and protein for the described or pictured food.
      
      CRITICAL INSTRUCTION: You must respond STRICTLY with valid JSON. Do not include markdown formatting (like \`\`\`json), explanations, or any other text.
      
      Required Output Format:
      {
        "foodName": "A concise, descriptive name of the food",
        "calories": <estimated total calories as a number>,
        "protein": <estimated total protein in grams as a number>
      }
      
      If you are unsure or the image does not contain food, provide a best guess or set calories to 0, protein to 0, and name to "Unknown Food".
    `;

    const generationConfig = {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          foodName: {
            type: SchemaType.STRING,
            description: "A concise, descriptive name of the food",
          },
          calories: {
            type: SchemaType.NUMBER,
            description: "Estimated total calories as a number",
          },
          protein: {
            type: SchemaType.NUMBER,
            description: "Estimated total protein in grams as a number",
          },
        },
        required: ["foodName", "calories", "protein"],
      },
    };

    let result;

    if (image) {
      // Handle multimodal request (image + prompt)
      const imageParts = [
        {
          inlineData: {
            data: image, // base64 string
            mimeType: mimeType || "image/jpeg",
          },
        },
      ];
      result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }, ...imageParts] }],
        generationConfig,
      });
    } else {
      // Handle text-only request
      const fullPrompt = `${prompt}\n\nHere is the user's food description: "${text}"`;
      result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        generationConfig,
      });
    }

    const responseText = result.response.text();
    
    // Clean up response in case Gemini included markdown formatting despite instructions
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith("\`\`\`json")) {
      cleanedText = cleanedText.replace(/^\`\`\`json/, "").replace(/\`\`\`$/, "").trim();
    } else if (cleanedText.startsWith("\`\`\`")) {
      cleanedText = cleanedText.replace(/^\`\`\`/, "").replace(/\`\`\`$/, "").trim();
    }

    let parsedJson;
    try {
      parsedJson = JSON.parse(cleanedText);
    } catch (e) {
      console.error("Failed to parse Gemini output as JSON:", cleanedText);
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(parsedJson);

  } catch (error) {
    console.error("Error analyzing food:", error);
    return NextResponse.json(
      { error: "An error occurred while analyzing the food. Please try again." },
      { status: 500 }
    );
  }
}
