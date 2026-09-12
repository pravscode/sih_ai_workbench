import { useRef, useState } from "react";
import {
  Plus,
  ExternalLink,
  Search,
  Sun,
  ChevronDown,
  ChevronRight,
  Paperclip,
  Send,
  Sparkles,
  Shield,
  Box,
  Zap,
  FileText,
  Lightbulb,
  Code2,
  X,
  Moon,
} from "lucide-react";

import "./App.css";


/* =========================================================
   SUGGESTIONS
========================================================= */

const suggestions = [
  {
    title: "Analyze a document",
    subtitle: "Summarize this document and identify the key insights.",
    icon: FileText,
    type: "blue",
  },
  {
    title: "Generate an idea",
    subtitle: "Create an innovative AI solution for a real-world problem.",
    icon: Lightbulb,
    type: "purple",
  },
  {
    title: "Write code",
    subtitle: "Create a Python solution for analyzing a dataset.",
    icon: Code2,
    type: "green",
  },
];


/* =========================================================
   FEATURE CARDS
========================================================= */

const features = [
  {
    title: "Intelligent",
    description: "Powered by open-source AI models",
    icon: Sparkles,
  },
  {
    title: "Secure",
    description: "Runs entirely on-premise (air-gapped)",
    icon: Shield,
  },
  {
    title: "Flexible",
    description: "Chat, analyze, generate, automate",
    icon: Box,
  },
  {
    title: "Ready",
    description: "Your AI workspace, set up and running",
    icon: Zap,
  },
];


/* =========================================================
   APP
========================================================= */

function App() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [thinking, setThinking] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);


  /* =======================================================
     SEND MESSAGE
  ======================================================= */

const sendMessage = async () => {
  if (!prompt.trim() && !selectedFile) return;
  if (thinking) return;

  const userText = prompt.trim();

  const userMessage = {
    id: Date.now(),
    role: "user",
    text: userText || "Please analyze this file.",
    file: selectedFile,
  };

  setMessages((previous) => [...previous, userMessage]);

  setPrompt("");
  setThinking(true);

  try {
    // Step 1: Upload the selected PDF
    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const uploadResponse = await fetch(
        "http://127.0.0.1:8000/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error("File upload failed");
      }

      const uploadData = await uploadResponse.json();

      console.log("File uploaded:", uploadData);
      setSelectedFile(null);
    }

    // Step 2: Send the question to the AI backend
    const response = await fetch(
      "http://127.0.0.1:8000/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message:
            userText || "Please analyze this file.",
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Backend request failed");
    }

    const data = await response.json();

    const aiMessage = {
      id: Date.now() + 1,
      role: "assistant",
      text: data.result,
    };

    setMessages((previous) => [...previous, aiMessage]);

  } catch (error) {
    console.error("Backend error:", error);

    const errorMessage = {
      id: Date.now() + 1,
      role: "assistant",
      text: "Sorry, I could not process your request.",
    };

    setMessages((previous) => [...previous, errorMessage]);

  } finally {
    setThinking(false);

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }, 50);
  }
};

  /* =======================================================
     KEYBOARD SEND
  ======================================================= */

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };


  /* =======================================================
     SUGGESTION CLICK
  ======================================================= */

  const useSuggestion = (text) => {
    setPrompt(text);
  };


  /* =======================================================
     FILE SELECT
  ======================================================= */

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      setSelectedFile(file);
    }
  };


  /* =======================================================
     REMOVE FILE
  ======================================================= */

  const removeFile = () => {
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };


  /* =======================================================
     NEW CHAT
  ======================================================= */

  const newChat = () => {
    setMessages([]);
    setPrompt("");
    setSelectedFile(null);
    setThinking(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };


  /* =======================================================
     THEME
  ======================================================= */

  const toggleTheme = () => {
    setDarkMode((value) => !value);
  };


  /* =========================================================
     RETURN
  ========================================================= */

  return (
    <div className={`workbench ${darkMode ? "dark-mode" : ""}`}>

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <aside className="sidebar">

        {/* BRAND */}
        <div className="sidebar-brand-row">
          <div className="sidebar-brand">

            <div className="logo-circle">
              <span className="logo-center">✦</span>

              <span className="logo-node node-1"></span>
              <span className="logo-node node-2"></span>
              <span className="logo-node node-3"></span>
              <span className="logo-node node-4"></span>
              <span className="logo-node node-5"></span>
              <span className="logo-node node-6"></span>
            </div>

            <span>AI Workbench</span>
          </div>

          <button className="sidebar-icon-button">
            <ExternalLink size={18} />
          </button>
        </div>


        {/* NEW CHAT */}
        <button
          className="new-chat-button"
          onClick={newChat}
        >
          <Plus size={21} />
          <span>New chat</span>
        </button>


        {/* EMPTY CONVERSATION AREA */}
        <div className="conversation-list"></div>


        {/* SYSTEM STATUS */}
        <div className="system-status">

          <div className="system-status-row">
            <span className="system-dot"></span>

            <strong>System Ready</strong>
          </div>

          <div className="system-subtitle">
            Running on-premise
          </div>

        </div>

      </aside>


      {/* ===================================================
          MAIN
      =================================================== */}

      <main className="main-area">


        {/* =================================================
            HEADER
        ================================================= */}

        <header className="chat-header">

          <button className="chat-title-button">
            <strong>New chat</strong>
            <ChevronDown size={17} />
          </button>


          <div className="header-actions">

            <button className="header-icon-button">
              <Search size={21} />
            </button>


            <button
              className="header-icon-button"
              onClick={toggleTheme}
              title="Toggle theme"
            >
              {darkMode ? (
                <Moon size={21} />
              ) : (
                <Sun size={21} />
              )}
            </button>


            <div className="user-avatar">
              M
            </div>

          </div>

        </header>


        {/* =================================================
            CHAT CONTENT
        ================================================= */}

        <div className="chat-content">

          {messages.length === 0 ? (

            /* =============================================
               EMPTY STATE
            ============================================= */

            <div className="empty-state">


              {/* LARGE LOGO */}
              <div className="large-logo">

                <span className="large-logo-center">
                  ✦
                </span>

                <span className="large-node large-node-1"></span>
                <span className="large-node large-node-2"></span>
                <span className="large-node large-node-3"></span>
                <span className="large-node large-node-4"></span>
                <span className="large-node large-node-5"></span>
                <span className="large-node large-node-6"></span>

              </div>


              {/* TITLE */}
              <h1>
                AI Workbench
              </h1>


              {/* SUBTITLE */}
              <h2>
                One workspace. Infinite possibilities.
              </h2>


              {/* DESCRIPTION */}
              <p className="empty-description">
                Turn ideas into intelligent solutions with one
                powerful AI workspace designed for experimentation,
                automation, and productivity.
              </p>


              {/* FEATURE CARDS */}
              <div className="feature-grid">

                {features.map((feature) => {

                  const Icon = feature.icon;

                  return (
                    <div
                      className="feature-card"
                      key={feature.title}
                    >
                      <Icon
                        size={24}
                        strokeWidth={1.9}
                      />

                      <h3>
                        {feature.title}
                      </h3>

                      <p>
                        {feature.description}
                      </p>

                    </div>
                  );

                })}

              </div>


              {/* SUGGESTIONS */}
              <div className="suggestions-container">

                <div className="suggestions-title">
                  Try asking me about...
                </div>


                <div className="suggestions-list">

                  {suggestions.map((suggestion) => {

                    const Icon = suggestion.icon;

                    return (
                      <button
                        className="suggestion-row"
                        key={suggestion.title}
                        onClick={() =>
                          useSuggestion(
                            suggestion.subtitle
                          )
                        }
                      >

                        <div
                          className={`suggestion-icon ${suggestion.type}`}
                        >
                          <Icon size={21} />
                        </div>


                        <div className="suggestion-text">

                          <strong>
                            {suggestion.title}
                          </strong>

                          <span>
                            {suggestion.subtitle}
                          </span>

                        </div>


                        <ChevronRight
                          className="suggestion-arrow"
                          size={21}
                        />

                      </button>
                    );

                  })}

                </div>

              </div>

            </div>

          ) : (

            /* =============================================
               MESSAGE THREAD
            ============================================= */

            <div className="message-thread">

              {messages.map((message) => (

                <div
                  className={`message-row ${message.role}`}
                  key={message.id}
                >

                  {message.role === "assistant" && (
                    <div className="message-avatar">
                      ✦
                    </div>
                  )}


                  <div className="message-content">

                    <div className="message-name">
                      {message.role === "user"
                        ? "You"
                        : "AI Workbench"}
                    </div>


                    <div className="message-bubble">
                      {message.text}
                    </div>


                    {message.file && (
                      <div className="uploaded-file-card">

                        <FileText size={20} />

                        <div>

                          <strong>
                            {message.file.name}
                          </strong>

                          <span>
                            {(message.file.size / 1024).toFixed(1)} KB
                          </span>

                        </div>

                      </div>
                    )}

                  </div>

                </div>

              ))}


              {/* THINKING */}
              {thinking && (

                <div className="message-row assistant">

                  <div className="message-avatar">
                    ✦
                  </div>

                  <div className="thinking-container">

                    <span>
                      Thinking
                    </span>

                    <div className="thinking-dots">
                      <i></i>
                      <i></i>
                      <i></i>
                    </div>

                  </div>

                </div>

              )}


              <div ref={messagesEndRef}></div>

            </div>

          )}

        </div>


        {/* =================================================
            MESSAGE INPUT
        ================================================= */}

        <div className="input-wrapper">


          {/* SELECTED FILE */}
          {selectedFile && (

            <div className="file-chip">

              <FileText size={17} />

              <span>
                {selectedFile.name}
              </span>

              <button
                onClick={removeFile}
                type="button"
              >
                <X size={15} />
              </button>

            </div>

          )}


          <div className="message-input-container">


            {/* FILE INPUT */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
              accept=".pdf"
            />


            {/* ATTACH */}
            <button
              className="attach-button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              title="Attach PDF"
              type="button"
            >
              <Paperclip size={22} />
            </button>


            {/* TEXT */}
            <textarea
              value={prompt}
              onChange={(event) =>
                setPrompt(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Message AI Workbench..."
              rows={1}
            />


            {/* SEND */}
            <button
              className="send-button"
              onClick={sendMessage}
              disabled={
                !prompt.trim() && !selectedFile
              }
              title="Send"
              type="button"
            >
              <Send size={21} />
            </button>

          </div>

        </div>

      </main>

    </div>
  );
}


export default App;