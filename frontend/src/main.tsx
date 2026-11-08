import {StrictMode} from "react";
import {createRoot} from "react-dom/client";

import {App} from "./app/App";
import "../styles/auth.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode> {/* Дополнительные проверки и предупреждения в режиме разработки */} 
    <App />
  </StrictMode>,
);