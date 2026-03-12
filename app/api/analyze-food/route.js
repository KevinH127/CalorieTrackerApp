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
      Your primary goal is to provide the most accurate, real-world estimate of the total calories and protein for the described or pictured food.
      
      CRITICAL INSTRUCTION: You have access to Google Search. You must use it to look up the exact nutritional facts for the food if you do not know them with 100% certainty. Do NOT guess generic values if a search can provide accurate data for the specific brand or restaurant meal.
      
      If you are completely unsure what the image contains and cannot search for it, set calories to 0, protein to 0, and name to "Unknown Food".
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

    // Enable Google Search Grounding
    const tools = [
      {
        googleSearch: {}, // Required to be googleSearch in latest SDK versions for native search
      },
    ];

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
        tools,
      });
    } else {
      // Handle text-only request
      const fullPrompt = `${prompt}\n\nHere is the user's food description: "${text}"`;
      result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        generationConfig,
        tools,
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
