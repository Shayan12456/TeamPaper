import React, { useState, useEffect } from 'react';
import { Plus, FileText } from 'lucide-react';
import Cookies from "js-cookie";

export default function NewDocument() {

    const checkAuth = async () => {
        try {
          const response = await fetch("http://localhost:8080/auth/check", {
            method: "GET",
            credentials: "include", // Include HTTP-only cookies
          });
  
          const data = await response.json();       
          return data;

        } catch (error) {
          console.error("Error verifying authentication:", error);
        }
      }
      

    async function createDocument(){
        
        checkAuth();

       const documentData = await fetch("http://localhost:8080/newdoc", {
            method: "POST",
            headers: {
                "Content-Type": "application/json", // Set the content type to JSON
              },
            body: JSON.stringify({
                title: "Untitled Document",
                content: "",
                owner: 'def@gmail.com',
            }),
            credentials: "include",
        });

        let parsedDocumentData = await documentData.json()
        console.log(parsedDocumentData.newDoc._id)

        window.location.href = "http://localhost:5173/text-editor/" + parsedDocumentData.newDoc._id;

    }
    
    const templates = [
        { id: 1, name: 'Blank', icon: <Plus className="h-8 w-8" /> },
        // { id: 2, name: 'Document', icon: <FileText className="h-8 w-8" /> },
        // { id: 3, name: 'Meeting Notes', icon: <FileText className="h-8 w-8" /> },
        // { id: 4, name: 'Project Plan', icon: <FileText className="h-8 w-8" /> }
      ];
    
    return (
        <>
            <div className="mb-12 relative">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Start a new document</h2>
                <div className="flex space-x-4">
                    {templates.map((template) => (
                    <button
                        key={template.id}
                        className="w-32 h-40 bg-white border border-gray-200 rounded-lg flex flex-col items-center justify-center 
                                hover:border-gray-300 transition-colors group shadow-sm cursor-pointer"
                        onClick={createDocument}
                    >
                        <div className="w-16 h-16 flex items-center justify-center border-2 border-gray-200 rounded-lg mb-2 
                                    group-hover:border-gray-300">
                        {React.cloneElement(template.icon, {
                            className: "text-gray-400 group-hover:text-gray-600"
                        })}
                        </div>
                        <span className="text-sm text-gray-600 group-hover:text-gray-800">{template.name}</span>
                    </button>
                    ))}
                </div>
            </div>
        </>
    );
}