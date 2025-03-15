import { useEffect, useState } from 'react';
import { NewDocument, RecentDocuments } from '../components/UI/index';
import { io } from "socket.io-client";


export default function DocDashboard(){
  const [recentDocs, setRecentDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // const newSocket = io("http://localhost:8080/document", { transports: ["websocket"] });

    // newSocket.on("connect", ()=>{
    //   console.log(`✅ Connected to /document namespace: ${newSocket.id}`);
    //   newSocket.emit("message", "Hello from frontend!");
    // });

    const func = async () => {
      try {   
          const res = await fetch("http://localhost:8080/document", {
              method: "GET",
              credentials: "include"
            });
      
            const main = await res.json();
            setRecentDocs(main.docs);
      } catch (error) {
        console.error("Error verifying authentication:", error);
      } finally {
        setLoading(false);
      }
    };

    func();
  }, []);

    return (
      <div className="max-w-[1400px] pt-20 mx-auto px-4 md:px-6 py-8">
        <NewDocument />
        { loading?
        <div className="flex justify-center items-center">
          <div className="loader"></div> {/* Add a CSS class for your loader */}
        </div>: 
        <RecentDocuments recentDocs={recentDocs}/>
        }
      </div>
    )
};