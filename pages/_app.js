import { ThemeProvider } from "next-themes";
import { Provider } from "react-redux";
import { store } from "../Redux/store";
import { useEffect } from "react";
import '../styles/globals.css';
import ChatBot from "../Components/ChatBot";
import { Analytics } from "@vercel/analytics/react";
import Script from 'next/script';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Disable image lazy loading for critical images
    if (typeof window !== 'undefined') {
      // Force immediate image loading for better UX
      const style = document.createElement('style');
      style.textContent = `
        img[loading="eager"] {
          content-visibility: auto;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8316794298481387"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <Provider store={store}>
        <ThemeProvider attribute="class">
          <Component {...pageProps} />
          <ChatBot />
          <Analytics />
        </ThemeProvider>
      </Provider>
    </>
  );
}

export default MyApp;
