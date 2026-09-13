import { useRef, useState } from "react";
import {
  Plus,
  Search,
  Sun,
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
    subtitle: "Summarize the key information in this document.",
    icon: FileText,
    type: "blue",
  },
  {
    title: "Query the knowledge base",
    subtitle: "What information is available in the uploaded documents?",
    icon:Search,
    type: "purple",
  },
  {
    title:"Generate a report",
    subtitle: "Create a report based on the uploaded document.",
    icon: FileText,
    type: "green",
  },
];


/* =========================================================
   FEATURE CARDS
========================================================= */

const features = [
  {
    title: "Private",
    description:"Runs entirely on your organization's infrastructure",
    icon: Shield,
  },
  {
    title:"Document AI",
    description: "Understand and retrieve information from documents",
    icon:FileText,
  },
  {
    title: "Secure",
    description: "Designed for confidential, offline workloads",
    icon:Sparkles,
  },
  {
    title: "Auditable",
    description: "Track requests, retrieval, and generated outputs",
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
      text: 
        typeof data.result==="object"
          ?data.result.answer
          :data.result,
      wordFile:
        typeof data.result==="object"
          ?data.result.word_file
          :null,
      pdfFile:
        typeof data.result==="object"
          ?data.result.pdf_file
          :null,
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

            <span>AI Workbench</span>
          </div>
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
             <div className="system-text">
              Running on-premises
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
          <div className="header-actions">

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

              {/* TITLE */}
              <h1>
                AI Workbench
              </h1>


              {/* SUBTITLE */}
              <h2>
                Your Private AI Workbench
              </h2>


              {/* DESCRIPTION */}
              <p className="empty-description">
                Securely analyze documents, query organizational knowledge,
                and generate reports — entirely on-premise.
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
                  Quick actions
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

                    {message.wordFile && (
                      <a
                        href={`http://127.0.0.1:8000/download/${message.wordFile.split("\\").pop()}`}
                        download
                        className="download-button"
                      >
                        Download Word
                      </a>  
                    )}
                    {message.pdfFile &&(
                    <a
                      href={`http://127.0.0.1:8000/download/${message.pdfFile.split("\\").pop()}`}
                      download
                      className="download-button"
                    >
                      Download PDF
                    </a>

                    )}


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