import { type NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Convert the audio file to a buffer
    const audioBuffer = await audioFile.arrayBuffer();

    // Initialize ChatOpenAI with audio output capabilities
    const model = new ChatOpenAI({
      modelName: "gpt-4o-audio-preview",
      modalities: ["text", "audio"],
      audio: {
        voice: "alloy",
        format: "mp3",
      },
    });

    // Create the audio input message
    const userInput = new HumanMessage({
      content: [
        {
          type: "input_audio",
          input_audio: {
            data: Buffer.from(audioBuffer).toString("base64"),
            format: "wav",
          },
        },
      ],
    });

    // Get response from the model
    const response = await model.invoke([
      new SystemMessage(
        "You are a helpful voice assistant. Keep responses concise and conversational."
      ),
      userInput,
    ]);

    // Extract audio data from response
    const audioContent = response.additional_kwargs.audio as Record<
      string,
      unknown
    >;
    const audioUrl = `data:audio/mp3;base64,${audioContent.data}`;

    // Return the transcribed text, AI response, and audio URL
    return NextResponse.json({
      transcribedText: audioContent.transcript,
      text: response.content,
      audioUrl,
    });
  } catch (error) {
    console.error("Error processing voice message:", error);
    return NextResponse.json(
      { error: "Failed to process voice message" },
      { status: 500 }
    );
  }
}
