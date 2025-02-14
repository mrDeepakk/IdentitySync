import express from "express";
import path from "path";
import cors from "cors";
import contactRoutes from "./routes/contactRoutes"; 

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

app.use("/", contactRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
