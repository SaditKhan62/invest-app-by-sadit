import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set title
document.title = "TradePulse - Investment App";

createRoot(document.getElementById("root")!).render(<App />);
