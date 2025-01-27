import React, { useEffect } from 'react';

function Test() {

  useEffect(()=>{
    const fetchData = async () => {
        try {
            const response = await fetch('http://localhost:8080');
            if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log(data); // Log the data received from the backend
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    fetchData();
  }, []);

  return (
    <>
       <h1 className='text-[red]'>Welcome to TeamPaper!</h1>
    </>
  );
}

export default Test;