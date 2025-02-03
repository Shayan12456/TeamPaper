import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link2,
  Image,
  List,
  ListOrdered,
  ChevronDown,
  Undo,
  Redo,
  Printer,
  FileText,
  Star,
  Share2,
  MoreVertical,
  Camera
} from 'lucide-react';
import { useParams } from 'react-router-dom';

 function App() {
  const [documentTitle, setDocumentTitle] = useState('');
  const [content, setContent] = useState("");
  const [fontSize, setFontSize] = useState('11');
  const [fontFamily, setFontFamily] = useState('Arial');
  const editorRef = useRef<HTMLDivElement>(null);

  const handleInput = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML); // ✅ Extract formatted content as a string
    }
  };
  
  
  // Extracting the 'id' from the URL params
  const { id } = useParams();
  console.log(id);

  useEffect(()=>{
    let textEditorData = async () => {
      const documentData = await fetch("http://localhost:8080/text-editor/"+id, {
        method: "GET",      
        // credentials: "include",
    });

    const data = await documentData.json();
    console.log(data);
    setDocumentTitle(data.title);
  };

  textEditorData();

  }, []);//Render → useEffect Runs → State Updates → Re-Render

  useEffect(()=>{
    let textEditorData = async () => {
      const documentData = await fetch("http://localhost:8080/text-editor/"+id, {
        method: "PUT",  
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({documentTitle}),
        credentials: "include",
    });

    const data = await documentData.json();
    console.log(data);
    setDocumentTitle(data.title);
    console.log(editorRef.current);

  };

  textEditorData();

  }
  , [documentTitle]);

  useEffect(()=>{
    let textEditorData = async () => {
      const documentData = await fetch("http://localhost:8080/text-editor/"+id, {
        method: "PUT",  
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({content}),
        credentials: "include",
    });

    const data = await documentData.json();
    console.log(data);
    // setContent(content)
    // setDocumentTitle(data.title);
    // console.log(editorRef.current);

  };

  textEditorData();

  }
  , [content]);


  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    execCommand('fontSize', (parseInt(size) / 4).toString());
  };

  const handleFontFamilyChange = (font: string) => {
    setFontFamily(font);
    execCommand('fontName', font);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      execCommand('insertHTML', '&nbsp;&nbsp;&nbsp;&nbsp;');
    }
  };

  const handleUndo = () => {
    execCommand('undo');
  };

  const handleRedo = () => {
    execCommand('redo');
  };

  const handleBold = () => {
    execCommand('bold');
  };

  const handleItalic = () => {
    execCommand('italic');
  };

  const handleUnderline = () => {
    execCommand('underline');
  };

  const handleAlignment = (align: string) => {
    execCommand('justify' + align);
  };

  const handleList = (type: 'ordered' | 'unordered') => {
    execCommand(type === 'ordered' ? 'insertOrderedList' : 'insertUnorderedList');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <nav className="border-b border-gray-200 bg-white px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <FileText className="h-10 w-10 text-blue-600" />
            <div className="flex flex-col">
              <input
                type="text"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                className="border-none bg-transparent text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2"
              />
              <div className="flex space-x-4 text-sm text-gray-600">
                <button className="hover:bg-gray-100 px-2 py-1 rounded">File</button>
                <button className="hover:bg-gray-100 px-2 py-1 rounded">Edit</button>
                <button className="hover:bg-gray-100 px-2 py-1 rounded">View</button>
                <button className="hover:bg-gray-100 px-2 py-1 rounded">Insert</button>
                <button className="hover:bg-gray-100 px-2 py-1 rounded">Format</button>
                <button className="hover:bg-gray-100 px-2 py-1 rounded">Tools</button>
                <button className="hover:bg-gray-100 px-2 py-1 rounded">Extensions</button>
                <button className="hover:bg-gray-100 px-2 py-1 rounded">Help</button>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Camera className="h-5 w-5 text-gray-600" />
            <button className="flex items-center space-x-1 rounded-full bg-blue-100 px-6 py-2 text-blue-700 hover:bg-blue-200">
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </button>
            <Star className="h-5 w-5 text-gray-600" />
            <MoreVertical className="h-5 w-5 text-gray-600" />
          </div>
        </div>
      </nav>

      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-white px-4 py-1">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <button onClick={handleUndo} className="p-1 hover:bg-gray-100 rounded">
              <Undo className="h-4 w-4" />
            </button>
            <button onClick={handleRedo} className="p-1 hover:bg-gray-100 rounded">
              <Redo className="h-4 w-4" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded">
              <Printer className="h-4 w-4" />
            </button>
          </div>
          <div className="h-4 w-px bg-gray-300" />
          <select
            value={fontSize}
            onChange={(e) => handleFontSizeChange(e.target.value)}
            className="w-16 rounded border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {[8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72, 96].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <select
            value={fontFamily}
            onChange={(e) => handleFontFamilyChange(e.target.value)}
            className="w-32 rounded border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana'].map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
          <div className="h-4 w-px bg-gray-300" />
          <div className="flex items-center space-x-1">
            <button onClick={handleBold} className="p-1 hover:bg-gray-100 rounded">
              <Bold className="h-4 w-4" />
            </button>
            <button onClick={handleItalic} className="p-1 hover:bg-gray-100 rounded">
              <Italic className="h-4 w-4" />
            </button>
            <button onClick={handleUnderline} className="p-1 hover:bg-gray-100 rounded">
              <Underline className="h-4 w-4" />
            </button>
          </div>
          <div className="h-4 w-px bg-gray-300" />
          <div className="flex items-center space-x-1">
            <button onClick={() => handleAlignment('Left')} className="p-1 hover:bg-gray-100 rounded">
              <AlignLeft className="h-4 w-4" />
            </button>
            <button onClick={() => handleAlignment('Center')} className="p-1 hover:bg-gray-100 rounded">
              <AlignCenter className="h-4 w-4" />
            </button>
            <button onClick={() => handleAlignment('Right')} className="p-1 hover:bg-gray-100 rounded">
              <AlignRight className="h-4 w-4" />
            </button>
            <button onClick={() => handleAlignment('Full')} className="p-1 hover:bg-gray-100 rounded">
              <AlignJustify className="h-4 w-4" />
            </button>
          </div>
          <div className="h-4 w-px bg-gray-300" />
          <div className="flex items-center space-x-1">
            <button className="p-1 hover:bg-gray-100 rounded">
              <Link2 className="h-4 w-4" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded">
              <Image className="h-4 w-4" />
            </button>
            <button onClick={() => handleList('unordered')} className="p-1 hover:bg-gray-100 rounded">
              <List className="h-4 w-4" />
            </button>
            <button onClick={() => handleList('ordered')} className="p-1 hover:bg-gray-100 rounded">
              <ListOrdered className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Ruler */}
      <div className="border-b border-gray-200 bg-white px-4 py-1">
        <div className="h-6 relative">
          <div className="absolute inset-0 flex">
            {[...Array(19)].map((_, i) => (
              <div key={i} className="flex-1 border-l border-gray-300 relative">
                {i > 0 && <span className="absolute -top-3 -left-1 text-[10px] text-gray-500">{i}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Document Area */}
      <div className="mx-auto max-w-4xl p-16">
        <div className="min-h-[1056px] w-full rounded-lg border border-gray-200 bg-white p-12 shadow-sm">
          <div
            // ref={editorRef}
            // contentEditable
            // onKeyDown={handleKeyDown}
            // className="min-h-[1000px] w-full outline-none"
            // style={{ fontFamily, fontSize: `${fontSize}px` }}
            ref={editorRef}
      contentEditable
      onInput={handleInput} // Triggered on user input
      className="min-h-[1000px] w-full outline-none"
      style={{ fontFamily: "Arial", fontSize: "11px" }}
      dangerouslySetInnerHTML={{ __html: content }} // Inject formatted HTML
          />
        </div>
      </div>
    </div>
  );
}

export default App;