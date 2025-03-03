import React, { useCallback, useState, useRef, useEffect } from 'react';
import { EditorState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import { Button } from "../components/UI/Login.jsx/components/ui/button";
import "react-quill/dist/quill.snow.css"; // Import styles
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import {
  FileText,
  Star,
  Share2,
  X
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { convertToRaw, convertFromRaw } from "draft-js";

 function App() {
  const [editorState, setEditorState] = useState(
    () => EditorState.createEmpty(),
  );
  const [documentTitle, setDocumentTitle] = useState('');
  const [isSaved, setIsSaved] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [accessType, setAccessType] = useState("editor");

  const toggleModal = () => setIsOpen(!isOpen);

  const handleSubmit = async () => {
    console.log("Email:", email);
    console.log("Access Type:", accessType);
    toggleModal(); // Close modal after submission
    await fetch("http://localhost:8080/grant-access/"+id+"/share", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, accessType }),
      credentials: "include",
    });
  };


  // Extracting the 'id' from the URL params
  const { id } = useParams();
  console.log(id);

  // two use effect both having their own state vars, so on the first one state change there is rerender before second one is triggered
  useEffect(()=>{
    const fetchDocument = async () => {
      try {
        const response = await fetch("http://localhost:8080/text-editor/"+id, {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();
        console.log("Fetched Data:", JSON.stringify(data.content, null, 2)); // Debugging

        if (data.content && data.content.blocks) {
          if (!data.content.entityMap) {
            data.content.entityMap = {}; // Ensure entityMap exists
          }
          console.log(EditorState.createWithContent(convertFromRaw(data.content)))
          setEditorState(EditorState.createWithContent(convertFromRaw(data.content)));
        } else {
          console.warn("Invalid or empty content, loading blank editor.");
          setEditorState(EditorState.createEmpty());
        }

        setDocumentTitle(data.title || "Untitled Document");
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };

    fetchDocument();
  }, []);//Render → useEffect Runs → State Updates → Re-Render

  let textEditorData = async () => {
    const rawContent = convertToRaw(editorState.getCurrentContent());
    const documentData = await fetch("http://localhost:8080/text-editor/"+id, {
      method: "PUT",  
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({documentTitle, rawContent}),
      credentials: "include",
    });

    const changedData = await documentData.json();    
    console.log(changedData);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <nav className="border-b border-gray-200 bg-white px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex small-screen-left-nav items-center space-x-4">
            <FileText className="h-10 w-10 text-blue-600" />            
            <div className="flex flex-col">
              <input
                type="text"
                value={documentTitle}
                onChange={(e) => {setDocumentTitle(e.target.value); setIsSaved(false);}}
                className="border-none bg-transparent text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 sm: text-sm"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {(isSaved) ? "" : <button onClick={async ()=>{ await textEditorData(); setIsSaved(true);}} className="flex items-center space-x-1 rounded-full bg-blue-100 px-4 py-2 text-blue-700 hover:bg-blue-200">
              <span>Save</span>
            </button>}
            <button onClick={toggleModal} className="flex items-center space-x-1 rounded-full bg-blue-100 px-6 py-2 text-blue-700 hover:bg-blue-200">
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </nav>

      {isOpen && (
        <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center">
          <div className="bg-white border-3 rounded-lg shadow-lg p-6 w-96">
            {/* Close Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Share Access</h2>
              <button onClick={toggleModal}>
                <X className="h-5 w-5 text-gray-600 hover:text-gray-800" />
              </button>
            </div>

            {/* Email Input */}
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2 mt-4 focus:outline-none focus:ring focus:border-blue-400"
            />

            {/* Access Type Selection */}
            <label className="block mt-4 text-sm font-medium">Select Access Type:</label>
            <select
              value={accessType}
              onChange={(e) => setAccessType(e.target.value)}
              className="w-full border rounded px-3 py-2 mt-2 focus:outline-none focus:ring focus:border-blue-400"
            >
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>

            {/* Submit Button */}
            <Button onClick={handleSubmit} className="w-full mt-5 cursor-pointer hover:bg-black hover:text-[white]" type="submit">
              Grant Access
            </Button>
          </div>
        </div>
      )}

      <Editor
        editorState={editorState}
        onEditorStateChange={(state)=>{setEditorState(state);setIsSaved(false);}}
        toolbarClassName="flex sticky top-0 z-50 !justify-center mx-auto !border-0 !border-b-2 !border-[#ccc] shadow-md"
        editorClassName="mt-6 bg-white p-5 shadow-lg min-h-[1300px] max-w-5xl mx-auto mb-12 border-2 rounded-sm border-gray-300"
        editorStyle={{ minHeight: "1300px" }}
      />
    </div>
  );
}

export default App;

