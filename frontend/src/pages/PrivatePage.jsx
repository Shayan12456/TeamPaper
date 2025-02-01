import React, { useEffect } from 'react'

function PrivatePage() {

  useEffect(()=>
    async () => {
    const response = await fetch("http://localhost:8080/protected-backend", {
      method: "GET",
      credentials: "include", // ✅ Include credentials
    });
    const data = await response.json();
  
    console.log(data)
  }, []);

  return (
    <div>PrivatePage</div>
  )
}

export default PrivatePage;