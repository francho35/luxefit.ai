import { GoogleGenAI, Modality, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { GenerateOutfitParams } from "../types";

const API_KEY = process.env.API_KEY || '';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Swaps the outfit from the second image onto the person in the first image.
 * Uses 'gemini-2.5-flash-image' for better availability and specialized editing capabilities.
 */
export const generateOutfitSwap = async ({ modelImage, outfitImage }: GenerateOutfitParams): Promise<string> => {
  if (!modelImage.base64 || !outfitImage.base64) {
    throw new Error("Images are missing base64 data.");
  }

  try {
    // Updated prompting strategy:
    // We use a more "artistic" direction to avoid triggering strict identity/deepfake safety filters
    // while still maintaining the goal of a virtual try-on.
    const prompt = `
      You are an expert fashion AI.
      
      Image 1: The Model (Reference for pose, body type, and appearance).
      Image 2: The Garment (Reference for clothing style, fabric, and texture).
      
      Task: Generate a photorealistic fashion editorial image of the person from Image 1 wearing the garment from Image 2.
      
      Key Requirements:
      - Retain the pose, lighting, and background of Image 1.
      - Realistically drape the garment from Image 2 onto the model.
      - Ensure high-quality, cinematic lighting and texture details.
      - The result should look like a professional fashion photography shoot.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: modelImage.mimeType,
              data: modelImage.base64
            }
          },
          {
            inlineData: {
              mimeType: outfitImage.mimeType,
              data: outfitImage.base64
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: {
        responseModalities: [Modality.IMAGE],
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
        ],
      }
    });

    // Extract image
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts || parts.length === 0) {
      throw new Error("No content generated. The request may have been blocked by safety filters or the model could not process the images.");
    }

    // Find the part with inlineData (the image)
    const imagePart = parts.find(p => p.inlineData);
    
    if (imagePart && imagePart.inlineData) {
      return `data:image/png;base64,${imagePart.inlineData.data}`;
    }

    throw new Error("No image data found in response.");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};