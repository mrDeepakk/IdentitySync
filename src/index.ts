import express from "express";
import path from "path";
import cors from "cors";
import contactRoutes from "./routes/contactRoutes"; // ✅ Fix: Use import instead of require

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

app.use("/api", contactRoutes);

const frontendPath = path.resolve(__dirname, "../../frontend/dist");
app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
