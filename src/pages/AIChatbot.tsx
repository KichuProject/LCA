import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Trash2, Bot } from "lucide-react";

const qaPairs = {
  "what is lca": "Life Cycle Assessment (LCA) is a methodology for assessing environmental impacts associated with all the stages of the life cycle of a commercial product, process, or service.",
  "why is lca important": "LCA helps to avoid shifting environmental burdens from one life cycle stage to another, from one geographic area to another, or from one environmental medium (e.g., air, water, soil) to another.",
  "what are the stages of lca": "The main stages of an LCA are: goal and scope definition, inventory analysis, impact assessment, and interpretation.",
  "how can ai help with lca": "AI can automate data collection, improve the accuracy of impact assessments, and help in identifying hotspots and improvement opportunities in a product's life cycle.",
};

const sampleQuestions = [
  "What is LCA?",
  "Why is LCA important?",
  "What are the stages of LCA?",
  "How can AI help with LCA?",
];

const AIChatbot = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! I am an AI assistant. How can I help you with Life Cycle Assessment today?", sender: "bot" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSendMessage = (question = "") => {
    const messageText = question || inputValue;
    if (messageText.trim()) {
      setMessages((prevMessages) => [...prevMessages, { text: messageText, sender: "user" }]);
      setIsThinking(true);

      setTimeout(() => {
        const botResponse = qaPairs[messageText.toLowerCase().trim()] || "Sorry, I don't have an answer for that yet. I am still learning!";
        setMessages((prevMessages) => [...prevMessages, { text: botResponse, sender: "bot" }]);
        setIsThinking(false);
      }, 1500);

      setInputValue("");
    }
  };

  const handleClearChat = () => {
    setMessages([
      { text: "Hello! I am an AI assistant. How can I help you with Life Cycle Assessment today?", sender: "bot" },
    ]);
  };

  return (
    <div className="p-6 flex justify-center animate-fade-in">
      <Card className="w-full max-w-3xl shadow-eco">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" />
            AI Chatbot for LCA
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleClearChat} className="gap-2">
            <Trash2 className="w-4 h-4" />
            Clear Chat
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 h-[500px] overflow-y-auto p-4 border rounded-lg bg-muted/20">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-end gap-2 ${
                  message.sender === "bot" ? "justify-start" : "justify-end"
                }`}
              >
                {message.sender === "bot" && <Bot className="w-6 h-6 text-primary" />}
                <div
                  className={`px-4 py-2 rounded-lg max-w-[80%] ${
                    message.sender === "bot"
                      ? "bg-muted text-muted-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex items-end gap-2 justify-start">
                <Bot className="w-6 h-6 text-primary" />
                <div className="px-4 py-2 rounded-lg bg-muted text-muted-foreground">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">Or try asking one of these questions:</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {sampleQuestions.map((q) => (
                <Button key={q} variant="outline" size="sm" onClick={() => handleSendMessage(q)}>
                  {q}
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Input
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button onClick={() => handleSendMessage()} disabled={isThinking}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIChatbot;