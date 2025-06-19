import { ThemeProvider } from "next-themes";
import { Provider } from "react-redux";
import { store } from "../Redux/store";
import '../styles/globals.css';
import ChatBot from "../Components/ChatBot";

function MyApp({ Component, pageProps }) {
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
