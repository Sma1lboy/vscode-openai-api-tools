"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Copy, Check } from "lucide-react";

/** Reusable component that displays read-only text with a "Copy" button
 *  positioned in the top-right corner, inside the textarea container. */
function CopyableOutputArea({
  label,
  value,
  placeholder,
}: {
  label?: string;
  value: string;
  placeholder?: string;
}) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  }, [value]);

  return (
    <div className="relative flex-1">
      {label && <h3 className="mb-2 text-xl">{label}</h3>}
      <div className="relative h-full">
        <textarea
          value={value}
          readOnly
          placeholder={placeholder}
          className="scrollbar-hide w-full h-full p-3 text-base bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {value && (
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

interface ContentDelta {
  content: string;
  refusal?: unknown;
  role?: string;
}

interface Choice {
  content_filter_results?: unknown;
  delta?: ContentDelta;
  finish_reason?: string | null;
  index?: number;
  logprobs?: unknown;
}

interface DataChunk {
  choices: Choice[];
  created: number;
  id: string;
  model: string;
  object: string;
  prompt_filter_results?: unknown;
  system_fingerprint?: string;
}

interface ConversationMessage {
  role: string;
  content: string;
}

interface Conversation {
  messages: ConversationMessage[];
  model: string;
  temperature: number;
  top_p: number;
  prediction: {
    type: string;
    content: string;
  };
  n: number;
  stream: boolean;
  snippy?: {
    enabled: boolean;
  };
}

function MessageViewerTab() {
  const [convInput, setConvInput] = useState<string>("");
  const [convOutput, setConvOutput] = useState<string>("");

  const handleConvertConversation = () => {
    try {
      const conv = JSON.parse(convInput) as Conversation;
      const messagesOutput = conv.messages
        .map(
          (msg, index) => `Message ${index + 1} (${msg.role}):\n${msg.content}`
        )
        .join("\n\n");
      setConvOutput(messagesOutput);
    } catch (error) {
      console.error("Failed to parse conversation JSON:", error);
      setConvOutput("Error parsing JSON.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-stretch md:justify-between h-[calc(100vh-200px)]">
      <div className="flex flex-col flex-1 md:mr-2 mb-4 md:mb-0">
        <h3 className="mb-2 text-xl">Conversation Input</h3>
        <textarea
          value={convInput}
          onChange={(e) => setConvInput(e.target.value)}
          placeholder="Paste your conversation JSON here"
          className="scrollbar-hide flex-1 p-3 text-base bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex items-center justify-center mb-4 md:mb-0">
        <Button onClick={handleConvertConversation}>Convert</Button>
      </div>
      <div className="flex flex-col flex-1 md:ml-2">
        <CopyableOutputArea
          label="Converted Output"
          value={convOutput}
          placeholder="The processed conversation output will be displayed here"
        />
      </div>
    </div>
  );
}

function ModelConverterTab() {
  const [convJsonInput, setConvJsonInput] = useState<string>("");
  const [convJsonOutput, setConvJsonOutput] = useState<string>("");

  const handleConvertConversationJson = () => {
    try {
      const conv = JSON.parse(convJsonInput) as Conversation;
      const { snippy, ...restConv } = conv;
      restConv.model = "gpt-4o-mini";
      const output = JSON.stringify(restConv, null, 2);
      setConvJsonOutput(output);
    } catch (error) {
      console.error("Failed to parse conversation JSON:", error);
      setConvJsonOutput("Error parsing JSON.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-stretch md:justify-between h-[calc(100vh-200px)]">
      <div className="flex flex-col flex-1 md:mr-2 mb-4 md:mb-0">
        <h3 className="mb-2 text-xl">Conversation JSON Input</h3>
        <textarea
          value={convJsonInput}
          onChange={(e) => setConvJsonInput(e.target.value)}
          placeholder="Paste your conversation JSON here"
          className="scrollbar-hide flex-1 p-3 text-base bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex items-center justify-center mb-4 md:mb-0">
        <Button onClick={handleConvertConversationJson}>Convert</Button>
      </div>
      <div className="flex flex-col flex-1 md:ml-2">
        <CopyableOutputArea
          label="Converted Conversation JSON"
          value={convJsonOutput}
          placeholder="The updated conversation JSON will be displayed here"
        />
      </div>
    </div>
  );
}

function StreamParserTab() {
  const [inputText, setInputText] = useState<string>("");
  const [outputText, setOutputText] = useState<string>("");

  const handleConvertData = () => {
    const segments = inputText
      .split(/data:\s*/)
      .filter((seg) => seg.trim() !== "");
    let result = "";
    segments.forEach((segment) => {
      const trimmed = segment.trim();
      if (trimmed === "[DONE]") return;
      try {
        const dataChunk = JSON.parse(trimmed) as DataChunk;
        if (
          dataChunk.choices &&
          Array.isArray(dataChunk.choices) &&
          dataChunk.choices.length === 1 &&
          dataChunk.choices[0].finish_reason === "stop"
        ) {
          return;
        }
        dataChunk.choices.forEach((choice) => {
          if (choice.delta && typeof choice.delta.content === "string") {
            result += choice.delta.content;
          }
        });
      } catch (error) {
        console.error("Failed to parse JSON segment:", segment, error);
      }
    });
    setOutputText(result);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-stretch md:justify-between h-[calc(100vh-200px)]">
      <div className="flex flex-col flex-1 md:mr-2 mb-4 md:mb-0">
        <h3 className="mb-2 text-xl">Input</h3>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste your data here, each segment starting with 'data:'"
          className="scrollbar-hide flex-1 p-3 text-base bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex items-center justify-center mb-4 md:mb-0">
        <Button onClick={handleConvertData}>Convert</Button>
      </div>
      <div className="flex flex-col flex-1 md:ml-2">
        <CopyableOutputArea
          label="Output"
          value={outputText}
          placeholder="The processed content will be displayed here"
        />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen p-5 font-sans text-black dark:text-white bg-gray-50 dark:bg-gray-800">
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <Tabs defaultValue="messageViewer">
        <TabsList className="justify-center space-x-4 mb-5">
          <TabsTrigger value="messageViewer" className="px-4 py-2">
            Message Viewer
          </TabsTrigger>
          <TabsTrigger value="modelConverter" className="px-4 py-2">
            Model Converter
          </TabsTrigger>
          <TabsTrigger value="streamParser" className="px-4 py-2">
            Stream Parser
          </TabsTrigger>
          <TabsTrigger value="reserved" className="px-4 py-2">
            Reserved
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messageViewer">
          <MessageViewerTab />
        </TabsContent>
        <TabsContent value="modelConverter">
          <ModelConverterTab />
        </TabsContent>
        <TabsContent value="streamParser">
          <StreamParserTab />
        </TabsContent>
        <TabsContent value="reserved">
          <div className="text-center py-20">
            <p className="text-xl">Reserved interface for future use.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
