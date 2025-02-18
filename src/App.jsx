import { useState } from "react";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
} from "@mui/material";
import { Alert } from "@mui/material";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [errorMessage, setErrorMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleSend = async () => {
    if (!inputText.trim()) {
      setErrorMessage("Please enter text to send.");
      setOpenSnackbar(true);
      return;
    }
    setErrorMessage(""); // Clear previous errors

    const newMessage = {
      text: inputText,
      language: "",
      summary: "",
      translation: "",
    };
    setMessages([...messages, newMessage]);
    setInputText("");

    // Language Detection using Chrome AI API
    try {
      const detector = await window.ai.languageDetector.create();
      const results = await detector.detect(newMessage.text);
      newMessage.language = results[0].detectedLanguage;
      setMessages([...messages, newMessage]);
    } catch (error) {
      console.error("Language detection failed:", error);
      setErrorMessage("Error detecting language.");
      setOpenSnackbar(true);
    }
  };

  const handleSummarize = async (index) => {
    const message = messages[index];
    try {
      const summarizer = await window.ai.summarizer.create();
      const result = await summarizer.summarize(message.text);
      message.summary = result.summary;
      setMessages([...messages]);
    } catch (error) {
      console.error("Summarization failed:", error);
      setErrorMessage("Error summarizing text.");
      setOpenSnackbar(true);
    }
  };

  // Improved Translation Function
  const handleTranslate = async (index) => {
    const message = messages[index];
    try {
      const translator = await window.ai.translator.create();
      const result = await translator.translate({
        text: message.text,
        targetLanguage: selectedLanguage,
      });
      message.translation = result.translation;
      setMessages([...messages]);
    } catch (error) {
      console.error("Translation failed:", error);
      setErrorMessage("Error translating text.");
      setOpenSnackbar(true);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>AI Text Processor</h1>
      </header>
      <main className="chat-container">
        <div className="messages">
          {messages.map((msg, index) => (
            <div key={index} className="message">
              <p>{msg.text}</p>
              {msg.language && (
                <p>
                  <strong>Detected Language:</strong> {msg.language}
                </p>
              )}
              {msg.language === "en" &&
                msg.text.length > 150 &&
                !msg.summary && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleSummarize(index)}
                  >
                    Summarize
                  </Button>
                )}
              {msg.summary && (
                <p>
                  <strong>Summary:</strong> {msg.summary}
                </p>
              )}
              <div className="translation-controls">
                <FormControl variant="outlined" fullWidth>
                  <InputLabel>Target Language</InputLabel>
                  <Select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    label="Target Language"
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="pt">Portuguese</MenuItem>
                    <MenuItem value="es">Spanish</MenuItem>
                    <MenuItem value="ru">Russian</MenuItem>
                    <MenuItem value="tr">Turkish</MenuItem>
                    <MenuItem value="fr">French</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleTranslate(index)}
                  style={{ marginTop: "10px" }}
                >
                  Translate
                </Button>
              </div>
              {msg.translation && (
                <p>
                  <strong>Translation:</strong> {msg.translation}
                </p>
              )}
            </div>
          ))}
        </div>
      </main>
      <TextField
        label="Type your message..."
        multiline
        rows={4}
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        fullWidth
        variant="outlined"
        style={{ marginBottom: "20px" }}
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleSend}
        style={{ width: "100%", padding: "10px", fontSize: "18px" }}
      >
        Send
      </Button>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default App;
