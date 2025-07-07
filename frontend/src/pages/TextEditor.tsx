import React, { useCallback, useState, useRef, useEffect } from "react";
import { EditorState } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import { Button } from "../components/UI/Login.jsx/components/ui/button";
import "react-quill/dist/quill.snow.css"; // Import styles
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { FileText, Star, Share2, X } from "lucide-react";
import { useParams } from "react-router-dom";
import { convertToRaw, convertFromRaw } from "draft-js";
import { io } from "socket.io-client";

function App() {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );
  const [documentTitle, setDocumentTitle] = useState("");
  const [isSaved, setIsSaved] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [accessType, setAccessType] = useState("editor");
  const [errorMessage, setErrorMessage] = useState("");
  const [shareErrorMessage, setShareErrorMessage] = useState("");

  const socketRef = useRef(null);
  const lastContentRef = useRef(null);
  const { id } = useParams();

  const toggleModal = () => setIsOpen(!isOpen);

  const handleSubmit = async () => {
    setShareErrorMessage("");
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + `/grant-access/${id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, accessType }),
        credentials: "include",
      });
      if (!response.ok) {
        let errorMsg = "Failed to grant access.";
        try {
          const errJson = await response.json();
          if (errJson && errJson.message) errorMsg = errJson.message;
        } catch (e) {}
        setShareErrorMessage(errorMsg);
        return;
      }
      toggleModal();
    } catch (error) {
      setShareErrorMessage("An error occurred while granting access.");
      console.error("Error granting access:", error);
    }
  };

  // Debounce helper
  const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  const emitChanges = useCallback(
    debounce((rawContent) => {
      socketRef.current?.emit("userMakingChanges", { rawContent });
      lastContentRef.current = JSON.stringify(rawContent);
    }, 200),
    []
  );

  const handleEditorChange = (state) => {
    setEditorState(state);
    setIsSaved(false);
    const rawContent = convertToRaw(state.getCurrentContent());
    const stringified = JSON.stringify(rawContent);

    if (stringified !== lastContentRef.current) {
      emitChanges(rawContent);
    }
  };

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_API_URL + "/text-editor");

    socketRef.current.emit("joinRoom", { roomId: id });

    // Fetch document from DB
    const fetchDocument = async () => {
      try {
        const response = await fetch(
          import.meta.env.VITE_API_URL + `/text-editor/${id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        // Check for error status
        if (!response.ok) {
          // Try to parse error message from backend
          let errorMsg = "Access denied or an error occurred.";
          try {
            const errJson = await response.json();
            if (errJson && errJson.message) errorMsg = errJson.message;
          } catch (e) {}
          setErrorMessage(errorMsg);
          return;
        }
        const existingDoc = await response.json();
        // If backend returns a message field (e.g., access denied), show it
        if (existingDoc && existingDoc.message) {
          setErrorMessage(existingDoc.message);
          return;
        }
        if (existingDoc.content?.blocks) {
          const content = {
            ...existingDoc.content,
            entityMap: existingDoc.content.entityMap || {},
          };
          setEditorState(
            EditorState.createWithContent(convertFromRaw(content))
          );
          lastContentRef.current = JSON.stringify(content);
        }
        setDocumentTitle(existingDoc.title || "Untitled Document");
        setErrorMessage(""); // Clear error if successful
        console.log("Document fetched successfully:", existingDoc);
      } catch (error) {
        setErrorMessage("An error occurred while fetching the document.");
        console.error("Error fetching doc:", error);
      }
    };

    fetchDocument();

    // Handle real-time updates from others
    socketRef.current.on("updateWithNewChanges", (incoming) => {
      try {
        console.log("hI");
        if (incoming?.blocks) {
          incoming.entityMap = incoming.entityMap || {};
          const stringified = JSON.stringify(incoming);

          if (stringified !== lastContentRef.current) {
            const content = convertFromRaw(incoming);
            setEditorState(EditorState.createWithContent(content));
            lastContentRef.current = stringified;
          }
          // 🧠 await pauses only the async function it's in — not just the block ({}), but the entire function scope that wraps it.
        }
      } catch (err) {
        console.error("Error applying socket update:", err);
      }
    });

    return () => socketRef.current?.disconnect();
  }, [id]);

  // Connects to the correct namespace ✅
  // Joins a dynamic room ✅
  // Emits user changes ✅
  // Listens for real-time updates ✅

  const textEditorData = async () => {
    const rawContent = convertToRaw(editorState.getCurrentContent());
    const res = await fetch(
      import.meta.env.VITE_API_URL + `/text-editor/${id}/share`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentTitle, rawContent }),
        credentials: "include",
      }
    );

    console.log(await res.json());
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Toolbar */}
      <nav className="border-b border-gray-200 bg-white px-4 py-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <FileText className="h-10 w-10 text-blue-600" />
            <input
              type="text"
              value={documentTitle}
              onChange={(e) => {
                setDocumentTitle(e.target.value);
                setIsSaved(false);
              }}
              className="border-none bg-transparent text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2"
            />
          </div>

          <div className="flex items-center space-x-4">
            {!isSaved && (
              <button
                onClick={async () => {
                  await textEditorData();
                  setIsSaved(true);
                }}
                className="bg-blue-100 px-4 py-2 rounded-full text-blue-700 hover:bg-blue-200"
              >
                Save
              </button>
            )}
            <button
              onClick={toggleModal}
              className="bg-blue-100 px-6 py-2 rounded-full text-blue-700 hover:bg-blue-200 flex items-center space-x-1"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Share Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Share Access</h2>
              <button onClick={toggleModal}>
                <X className="h-5 w-5 text-gray-600 hover:text-gray-800" />
              </button>
            </div>

            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-4"
            />

            <label className="block text-sm mb-2">Access Type:</label>
            <select
              value={accessType}
              onChange={(e) => setAccessType(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-4"
            >
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>

            {shareErrorMessage && (
              <div className="mb-4 p-2 bg-red-100 text-red-800 rounded text-center text-sm">
                {shareErrorMessage}
              </div>
            )}

            <Button onClick={handleSubmit} className="w-full">
              Grant Access
            </Button>
          </div>
        </div>
      )}

      {/* Show error message if access denied or other error */}
      {errorMessage ? (
        <div className="max-w-2xl mx-auto mt-12 p-6 bg-red-100 text-red-800 rounded shadow text-center text-lg">
          {errorMessage}
        </div>
      ) : (
        // Editor
        <Editor
          editorState={editorState}
          onEditorStateChange={handleEditorChange}
          toolbarClassName="flex sticky top-0 z-50 justify-center mx-auto border-b-2 border-gray-300 shadow-md"
          editorClassName="mt-6 bg-white p-5 shadow-lg min-h-[1300px] max-w-5xl mx-auto mb-12 border-2 rounded-sm border-gray-300"
          editorStyle={{ minHeight: "1300px" }}
        />
      )}
    </div>
  );
}

export default App;
