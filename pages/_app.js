import { ThemeProvider } from "next-themes";
import { Provider } from "react-redux";
import { store } from "../Redux/store";
import { useEffect } from "react";
import '../styles/globals.css';
import ChatBot from "../Components/ChatBot";

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
    <Provider store={store}>
      <ThemeProvider attribute="class">
        <Component {...pageProps} />
        <ChatBot />
      </ThemeProvider>
    </Provider>
  );
}

export default MyApp;
