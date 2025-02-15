"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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

const DataParserTab = () => {
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
        <h3 className="mb-2 text-xl">Output</h3>
        <textarea
          value={outputText}
          readOnly
          placeholder="The processed content will be displayed here"
          className="scrollbar-hide flex-1 p-3 text-base bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

const CodeConverterTab = () => {
  const [convInput, setConvInput] = useState<string>("");
  const [convOutput, setConvOutput] = useState<string>("");

  // In this tab we simply split the conversation messages and output each message
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
        <h3 className="mb-2 text-xl">Converted Output</h3>
        <textarea
          value={convOutput}
          readOnly
          placeholder="The processed conversation output will be displayed here"
          className="scrollbar-hide flex-1 p-3 text-base bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

function ConversationJsonTab() {
  const [convJsonInput, setConvJsonInput] = useState<string>("");
  const [convJsonOutput, setConvJsonOutput] = useState<string>("");

  const handleConvertConversationJson = () => {
    try {
      const conv = JSON.parse(convJsonInput) as Conversation;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        <h3 className="mb-2 text-xl">Converted Conversation JSON</h3>
        <textarea
          value={convJsonOutput}
          readOnly
          placeholder="The updated conversation JSON will be displayed here"
          className="scrollbar-hide flex-1 p-3 text-base bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
const Home = () => {
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
      <h1 className="text-center text-3xl font-bold mb-5">Data Parser Tool</h1>
      <Tabs defaultValue="dataParser">
        <TabsList className="flex justify-center space-x-4 mb-5">
          <TabsTrigger value="dataParser" className="px-4 py-2">
            Data Parser
          </TabsTrigger>
          <TabsTrigger value="codeConverter" className="px-4 py-2">
            Code Converter
          </TabsTrigger>
          <TabsTrigger value="convJson" className="px-4 py-2">
            Conversation JSON
          </TabsTrigger>
          <TabsTrigger value="reserved" className="px-4 py-2">
            Reserved
          </TabsTrigger>
        </TabsList>
        <TabsContent value="dataParser">
          <DataParserTab />
        </TabsContent>
        <TabsContent value="codeConverter">
          <CodeConverterTab />
        </TabsContent>
        <TabsContent value="convJson">
          <ConversationJsonTab />
        </TabsContent>
        <TabsContent value="reserved">
          <div className="text-center py-20">
            <p className="text-xl">Reserved interface for future use.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Home;
