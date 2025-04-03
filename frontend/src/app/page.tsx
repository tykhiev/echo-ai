"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mic, Send, StopCircle, Play, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  audioUrl?: string;
}

export default function VoiceMessagingPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementsRef = useRef<{ [key: string]: HTMLAudioElement }>({});

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        setAudioBlob(audioBlob);

        // Release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access your microphone. Please check permissions.");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Send audio to AI
  const sendAudioToAI = async () => {
    if (!audioBlob) return;

    setIsProcessing(true);

    // Create a unique ID for this message
    const messageId = Date.now().toString();

    // Create audio URL for playback
    const audioUrl = URL.createObjectURL(audioBlob);

    // Add user message
    const userMessage: Message = {
      id: messageId,
      role: "user",
      content: "Voice message",
      audioUrl,
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      // Create form data to send the audio file
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.wav");

      // Send to API endpoint
      const response = await fetch("/api/voice-chat", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process audio");
      }

      const data = await response.json();

      // Create AI response message
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.text,
        audioUrl: data.audioUrl,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error processing audio:", error);

      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content:
          "Sorry, I had trouble processing your voice message. Please try again.",
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
      setAudioBlob(null);
    }
  };

  // Play audio
  const playAudio = (messageId: string, audioUrl: string) => {
    // Stop any currently playing audio
    if (currentlyPlaying && audioElementsRef.current[currentlyPlaying]) {
      audioElementsRef.current[currentlyPlaying].pause();
      audioElementsRef.current[currentlyPlaying].currentTime = 0;
    }

    // Create or get audio element
    if (!audioElementsRef.current[messageId]) {
      const audio = new Audio(audioUrl);
      audio.onended = () => setCurrentlyPlaying(null);
      audioElementsRef.current[messageId] = audio;
    }

    // Play the audio
    audioElementsRef.current[messageId].play();
    setCurrentlyPlaying(messageId);
  };

  // Clean up audio URLs when component unmounts
  useEffect(() => {
    return () => {
      messages.forEach((message) => {
        if (message.audioUrl) {
          URL.revokeObjectURL(message.audioUrl);
        }
      });
    };
  }, [messages]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-2xl mx-auto flex flex-col h-[90vh]">
        <CardHeader className="border-b">
          <CardTitle className="text-center">Voice AI Assistant</CardTitle>
        </CardHeader>

        <CardContent className="flex-grow p-0">
          <ScrollArea className="h-full p-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p>Record a voice message to start the conversation</p>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div className="flex items-start gap-2 max-w-[80%]">
                      {message.role === "assistant" && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>AI</AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={`rounded-lg p-3 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p>{message.content}</p>

                        {message.audioUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 h-8 px-2"
                            onClick={() =>
                              playAudio(message.id, message.audioUrl!)
                            }
                          >
                            {currentlyPlaying === message.id ? (
                              "Playing..."
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-1" /> Play Audio
                              </>
                            )}
                          </Button>
                        )}
                      </div>

                      {message.role === "user" && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>You</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>

        <CardFooter className="border-t p-4">
          <div className="flex items-center justify-between w-full gap-2">
            {!isRecording ? (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full"
                  onClick={startRecording}
                  disabled={isProcessing}
                >
                  <Mic className="h-6 w-6" />
                </Button>

                <div className="flex-grow text-center text-sm text-gray-500">
                  {audioBlob
                    ? "Recording ready to send"
                    : "Tap to record your message"}
                </div>

                <Button
                  variant="default"
                  size="icon"
                  className="h-12 w-12 rounded-full"
                  onClick={sendAudioToAI}
                  disabled={!audioBlob || isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Send className="h-6 w-6" />
                  )}
                </Button>
              </>
            ) : (
              <>
                <div className="w-12" />

                <div className="flex-grow text-center">
                  <div className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-600 text-sm animate-pulse">
                    Recording...
                  </div>
                </div>

                <Button
                  variant="destructive"
                  size="icon"
                  className="h-12 w-12 rounded-full"
                  onClick={stopRecording}
                >
                  <StopCircle className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
