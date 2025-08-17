/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import type { Request, Response } from "express";
import * as logger from "firebase-functions/logger";
import { defineSecret } from "firebase-functions/params";
import { onRequest } from "firebase-functions/v2/https";

import OpenAI from "openai";

const OPENROUTER_API_KEY = defineSecret("OPENROUTER_API_KEY");

export const heightCoach = onRequest(
  { cors: true, secrets: [OPENROUTER_API_KEY] },
  async (req: Request, res: Response) => {
    const { messages, userData } = req.body;

    const openai = new OpenAI({
      apiKey: OPENROUTER_API_KEY.value(),
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://gotall.app",
        "X-Title": "GoTall Height Coach",
      },
    });

    // Build the full messages array: system prompt → prior history → latest user query
    const systemContent = userData
      ? `You are a height coach named Andy, specializing in growth, nutrition, and exercise advice for people looking to maximize their height potential. 
      You are an assistant in the Gotall app. You are chatting with the user is a message based chat interface. You prefer short, concise responses without excessive formatting. 
      You are not allowed to use markdown or other formatting. You can only rarely use emojis. Do not overly format your responses. Do not add random height-related tidbits after a direct question,
      just reply with your answer (ie. in a response about what should I eat to grow taller, do not add a statement like "This would be a good start to your height maximization journey" or something irrelevant). 
      Just respond with the answer, nothing else.
      
      You have access to the following information about the user:

Current Stats:
- Height: ${userData.currentHeight}
- Predicted Adult Height: ${userData.predictedAdultHeight}
- Height Percentile: ${userData.percentile}
- Age: ${userData.age}
- Gender: ${userData.gender}
- Ethnicity: ${userData.ethnicity}
- Weight: ${userData.weight}

Preferences:
- Preferred Height Unit: ${userData.preferredHeightUnit}
- Preferred Weight Unit: ${userData.preferredWeightUnit}
- Display Height: ${userData.displayHeight}
- Display Weight: ${userData.displayWeight}

Progress:
- Daily Goals: ${userData.weeklyGoalsProgress}
- Calorie Intake: ${userData.dailyCalories}

Weekly Goals:
${userData.weeklyGoals.map((g: any) => `- ${g.title}: ${g.completed ? '✓' : '○'} ${g.value ? `(${g.value}${g.unit})` : ''}`).join('\\n')}

Use this information to provide personalized advice and answer questions in the context of their specific growth journey. When relevant, reference their current stats or goals to make your responses more personalized and actionable.`

      : "You are an AI height coach, specializing in growth, nutrition, and exercise advice for people looking to maximize their height potential. Since I don't have your specific information, I'll provide general guidance. Feel free to share your stats so I can give more personalized advice.";

    const fullMessages = [
      { role: "system" as const, content: systemContent },
      ...(Array.isArray(messages) ? messages : []),
    ];

    try {
      const aiResponse = await openai.chat.completions.create({
        model: "gpt-4.1-nano",
        messages: fullMessages,
      });

      res.json({ reply: aiResponse.choices[0].message.content });
    } catch (error) {
      logger.error("OpenAI request failed", error as any);
      res.status(500).send("Internal server error");
    }
  }
);

export const foodAnalyzer = onRequest(
  { cors: true, secrets: [OPENROUTER_API_KEY] },
  async (req: Request, res: Response) => {
    const { images, prompt } = req.body; // Expecting { images: string[], prompt: string }

    if (!images || !Array.isArray(images) || images.length === 0 || !prompt) {
      res.status(400).send("Missing images or prompt.");
      return;
    }

    const openai = new OpenAI({
      apiKey: OPENROUTER_API_KEY.value(),
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://gotall.app",
        "X-Title": "GoTall Food Analyzer",
      },
    });

    const imageUrls = images.map((base64) => `data:image/jpeg;base64,${base64}`);

    const messages: any = [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          ...imageUrls.map((url) => ({
            type: "image_url",
            image_url: { url },
          })),
        ],
      },
    ];

    try {
      const aiResponse = await openai.chat.completions.create({
        model: "openai/gpt-4o", // Using a model that supports vision
        messages: messages,
      });

      res.json({ reply: aiResponse.choices[0].message.content });
    } catch (error) {
      logger.error("OpenAI request failed for food analyzer", error as any);
      res.status(500).send("Internal server error");
    }
  }
);
