import { Search, Plus, MoreVertical, User, FileText, Pencil, Trash2, Share2, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function RecentDocuments({recentDocs}) {
    const [activeMenu, setActiveMenu] = useState(null);
    const handleMenuClick = (docId, e) => {
            e.stopPropagation();
            setActiveMenu(activeMenu === docId ? null : docId);
          };
        
          const handleClickOutside = () => {
            setActiveMenu(null);
          };
        
          useEffect(() => {
            document.addEventListener('click', handleClickOutside);
            return () => {
              document.removeEventListener('click', handleClickOutside);
            };
          }, []);
          
    return (
        <>
            {/* Recent Documents */}
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Documents</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {recentDocs.map((doc) => (
                    <div
                        key={doc.id}
                        className="group relative bg-white border border-gray-200 rounded-lg p-4 h-40 
                                hover:border-gray-300 transition-colors cursor-pointer shadow-sm"
                    >
                        <div className="absolute top-2 right-2">
                        <button 
                            onClick={(e) => handleMenuClick(doc.id, e)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <MoreVertical className="h-5 w-5 text-gray-600" />
                        </button>
                        {activeMenu === doc.id && (
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                            <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                                <Pencil className="h-4 w-4 mr-2" />
                                Rename
                            </button>
                            <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                            </button>
                            <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </button>
                            </div>
                        )}
                        </div>
                        <div className="mt-auto">
                        <h3 className="font-medium text-gray-900 truncate">{doc.name}</h3>
                        <p className="text-sm text-gray-500">Opened {doc.lastOpened}</p>
                        </div>
                    </div>
                    ))}
                </div>
            </div>
        </>
    );
}