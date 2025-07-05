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
      ? `You are a helpful assistant. Here is the user\'s context: ${JSON.stringify(
          userData
        )}`
      : "You are a helpful assistant.";

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
