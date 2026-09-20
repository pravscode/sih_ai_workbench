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
    title: "Write & Test Code",
    subtitle: "Generate code and test it locally in a secure sandbox.",
    icon: Code2,
    type: "purple",
  },
  {
    title: "Generate a report",
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
    description: "Runs entirely on your organization's infrastructure",
    icon: Shield,
  },
  {
    title: "Document AI",
    description: "Understand and retrieve information from documents",
    icon: FileText,
  },
  {
    title: "Secure",
    description: "Designed for confidential, offline workloads",
    icon: Sparkles,
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
  const [activeDocument, setActiveDocument] = useState(null);
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
    let currentActiveDocument = activeDocument;

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

        currentActiveDocument =
          uploadData.active_document ||
          uploadData.filename ||
          selectedFile.name;

        setActiveDocument(currentActiveDocument);

        setSelectedFile(null);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
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
            active_document: currentActiveDocument,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Backend request failed");
      }

      const data = await response.json();

      console.log("BACKEND RESPONSE:", data);

      const result = data.result;

      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",

        text:
          typeof result === "object"
            ? result.answer || "Inspection review completed."
            : result,

        wordFile:
          typeof result === "object"
            ? result.word_file || null
            : null,

        pdfFile:
          typeof result === "object"
            ? result.pdf_file || null
            : null,

        approvalNote:
          typeof result === "object"
            ? result.approval_note || null
            : null,

        evidence:
          typeof result === "object"
            ? result.evidence || null
            : null,

        reasoning:
          typeof result === "object"
            ? result.reasoning || null
            : null,

        // Coding pipeline
        code:
          typeof result === "object"
            ? result.code || null
            : null,

        tests:
          typeof result === "object"
            ? result.tests || null
            : null,

        testResult:
          typeof result === "object"
            ? result.test_result || null
            : null,

        status:
          typeof result === "object"
            ? result.status || null
            : null,

        sovereignty:
          typeof result === "object"
            ? result.sovereignty || null
            : null,
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
    <div
      className={`workbench ${
        darkMode ? "dark-mode" : ""
      }`}
    >
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
          <div className="sovereignty-indicator">
            <span className="sovereignty-dot"></span>
            <span>LOCAL • SECURE</span>
          </div>
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

              {/* ACTIVE DOCUMENT */}
              {activeDocument && (
                <div className="active-document-card">

                  <div className="active-document-icon">
                    <FileText size={20} />
                  </div>

                  <div className="active-document-info">
                    <span>Active document</span>
                    <strong>{activeDocument}</strong>
                  </div>

                  <div className="active-document-status">
                    <span className="active-status-dot"></span>
                    Indexed
                  </div>

                </div>
              )}

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

                    {!message.reasoning && (
                      <div className="message-bubble">
                        {message.text}
                      </div>
                    )}

                    {message.reasoning && (
                      <div className="inspection-result">

                        <div className="inspection-header">
                          <span className="inspection-icon">
                            🔍
                          </span>

                          <div>
                            <h3>Inspection Review</h3>
                            <span>
                              Evidence-grounded analysis
                            </span>
                          </div>
                        </div>

                        <div className="inspection-section">
                          <div className="section-title">
                            Finding
                          </div>

                          <p>
                            {message.reasoning.finding_summary ||
                              "No finding summary available."}
                          </p>
                        </div>

                        <div className="inspection-section">
                          <div className="section-title">
                            SOP Assessment
                          </div>

                          <p>
                            {message.reasoning.sop_match ===
                            "NO_direct_MATCH"
                              ? "No direct match"
                              : message.reasoning.sop_match ||
                                "No SOP assessment available."}
                          </p>
                        </div>

                        <div className="inspection-section">
                          <div className="section-title">
                            Reasoning
                          </div>

                          <p>
                            {message.reasoning.reasoning ||
                              "No reasoning available."}
                          </p>
                        </div>

                        <div className="inspection-section">
                          <div className="section-title">
                            Evidence Support
                          </div>

                          <span
                            className={
                              message.reasoning.support_status ===
                              "SUPPORTED"
                                ? "support-badge supported"
                                : "support-badge unsupported"
                            }
                          >
                            {message.reasoning.support_status ===
                            "SUPPORTED"
                              ? "✓ Supported"
                              : "⚠ Not Supported"}
                          </span>
                        </div>

                        {message.reasoning.recommended_action && (
                          <div className="inspection-section">

                            <div className="section-title">
                              Recommended Action
                            </div>

                            <p>
                              {message.reasoning.recommended_action}
                            </p>

                          </div>
                        )}

                        {message.sovereignty && (
                          <div className="sovereignty-card">

                            <div className="sovereignty-header">
                              <span className="sovereignty-icon">
                                🔒
                              </span>

                              <div>
                                <h3>Sovereignty Status</h3>
                                <span>
                                  Local processing security check
                                </span>
                              </div>
                            </div>

                            <div className="sovereignty-details">

                              <div>
                                <span>Processing Mode</span>

                                <strong>
                                  {message.sovereignty.processing_mode}
                                </strong>
                              </div>

                              <div>
                                <span>External Connections</span>

                                <strong>
                                  {message.sovereignty.external_calls_detected
                                    ? "DETECTED"
                                    : "NONE"}
                                </strong>
                              </div>

                              <div>
                                <span>Status</span>

                                <strong>
                                  {message.sovereignty.status}
                                </strong>
                              </div>

                            </div>

                          </div>
                        )}

                        {message.reasoning.evidence_citations?.length > 0 && (
                          <div className="inspection-section">

                            <div className="section-title">
                              Evidence
                            </div>

                            <div className="evidence-list">

                              {message.reasoning.evidence_citations.map(
                                (citation, index) => {

                                  if (
                                    typeof citation ===
                                    "object"
                                  ) {
                                    return (
                                      <div
                                        className="evidence-item"
                                        key={index}
                                      >
                                        📄 {citation.source}
                                        {citation.page
                                          ? ` — Page ${citation.page}`
                                          : ""}
                                      </div>
                                    );
                                  }

                                  if (Array.isArray(citation)) {
                                    return (
                                      <div
                                        className="evidence-item"
                                        key={index}
                                      >
                                        📄 {citation[0]}
                                        {citation[1]
                                          ? ` — Page ${citation[1]}`
                                          : ""}
                                      </div>
                                    );
                                  }

                                  return (
                                    <div
                                      className="evidence-item"
                                      key={index}
                                    >
                                      📄 {String(citation)}
                                    </div>
                                  );
                                }
                              )}

                            </div>
                          </div>
                        )}

                      </div>
                    )}

                    {message.code && (
                      <div className="coding-result">

                        <div className="coding-header">
                          <span className="coding-icon">
                            💻
                          </span>

                          <div>
                            <h3>Coding Result</h3>
                            <span>
                              Generated and tested locally
                            </span>
                          </div>
                        </div>

                        <div className="coding-section">
                          <div className="section-title">
                            Generated Code
                          </div>

                          <pre className="code-block">
                            {message.code}
                          </pre>
                        </div>

                        {message.tests && (
                          <div className="coding-section">

                            <div className="section-title">
                              Generated Tests
                            </div>

                            <pre className="code-block">
                              {message.tests}
                            </pre>

                          </div>
                        )}

                        {message.testResult && (
                          <div className="coding-section">

                            <div className="section-title">
                              Sandbox Result
                            </div>

                            <span
                              className={
                                message.testResult.status ===
                                "PASS"
                                  ? "support-badge supported"
                                  : "support-badge unsupported"
                              }
                            >
                              {message.testResult.status ===
                              "PASS"
                                ? "✓ PASS"
                                : "✗ FAIL"}
                            </span>

                            {message.testResult.stderr && (
                              <pre className="code-error">
                                {message.testResult.stderr}
                              </pre>
                            )}

                          </div>
                        )}

                      </div>
                    )}

                    {message.approvalNote && (
                      <a
                        href={`http://127.0.0.1:8000/download/${message.approvalNote
                          .split("\\")
                          .pop()}`}
                        download
                        className="download-button"
                      >
                        Download Approval Note
                      </a>
                    )}

                    {message.wordFile && (
                      <a
                        href={`http://127.0.0.1:8000/download/${message.wordFile
                          .split("\\")
                          .pop()}`}
                        download
                        className="download-button"
                      >
                        Download Word
                      </a>
                    )}

                    {message.pdfFile && (
                      <a
                        href={`http://127.0.0.1:8000/download/${message.pdfFile
                          .split("\\")
                          .pop()}`}
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