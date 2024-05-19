import React, { useRef, useEffect, LegacyRef } from "react";

interface TitleRef {
  textContent: string;
  innerHTML: any
}

const words = ["Apple", "Banana", "Orange", "Grapes", "Pineapple"];

export default function App() {
  const titleRef = useRef<TitleRef>(null);

  useEffect(() => {
    const updateTitle = async () => {
      const intervalId = setInterval(() => {
        if (titleRef.current) {
          const randomIndex = Math.floor(Math.random() * words.length);
          titleRef.current.innerHTML = `<a href="https://discord.com">${words[randomIndex]}</a>`;
        }
      }, 2000);
  
      // Returning a function to clear the interval when needed
      return () => {
        clearInterval(intervalId);
        console.log('Interval cleared');
      };
    };
  
    // Call the async function
    updateTitle();
  }, []); // Empty dependency array to run only once
  
  return (
    <div className="container">
      <h2
        className="title"
        ref={(titleRef as any) as LegacyRef<HTMLDivElement>}
      >
        Original title
      </h2>
    </div>
  );
}
