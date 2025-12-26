import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import { db, initDb } from "./src/db/database";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database
initDb();

// AI Setup
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- API Routes ---

// Get all graph nodes and edges
app.get("/api/graph", (req, res) => {
  try {
    const nodes = db.prepare("SELECT * FROM nodes").all();
    const edges = db.prepare("SELECT * FROM edges").all();
    res.json({ nodes, edges });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch graph data" });
  }
});

// Get details for a specific node
app.get("/api/nodes/:id", (req, res) => {
  try {
    const node = db.prepare("SELECT * FROM nodes WHERE id = ?").get(req.params.id);
    if (!node) return res.status(404).json({ error: "Node not found" });
    
    // Fetch associated ABAP code if any
    const routine = db.prepare("SELECT * FROM abap_routines WHERE node_id = ?").get(req.params.id);
    
    res.json({ ...node, routine });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch node details" });
  }
});

// Trigger AI Conversion
app.post("/api/convert", async (req, res) => {
  const { nodeId, abapCode } = req.body;
  
  if (!abapCode) {
    return res.status(400).json({ error: "No ABAP code provided" });
  }

  try {
    const model = "gemini-2.5-flash"; 
    const prompt = `
      You are an Expert Principal Data Engineer specializing in refactoring SAP ABAP to Google BigQuery SQL.
      Your task is to convert the following SAP BW Transformation Routine into a BigQuery SQL Logic block.
      
      STRICT RULES:
      1. Eliminate Loops: Convert LOOP AT statements into SQL JOIN or UNNEST.
      2. Handling Lookups: Convert READ TABLE ... WITH KEY into LEFT JOIN.
      3. Logic Preservation: Convert IF/ELSE into CASE WHEN.
      4. Output ONLY the SQL code block. No markdown, no explanation.
      
      INPUT ABAP CODE:
      ${abapCode}
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    const sql = response.text;

    // Update database
    db.prepare("UPDATE abap_routines SET converted_sql = ?, status = 'CONVERTED' WHERE node_id = ?")
      .run(sql, nodeId);

    res.json({ sql });
  } catch (error) {
    console.error("AI Conversion failed:", error);
    res.status(500).json({ error: "AI Conversion failed" });
  }
});

// Deploy (Generate .sqlx)
app.post("/api/deploy", (req, res) => {
  const { nodeId } = req.body;
  // Mock deployment process
  try {
    db.prepare("UPDATE nodes SET deployment_status = 'DEPLOYED' WHERE id = ?").run(nodeId);
    res.json({ success: true, message: "Deployed to Dataform successfully" });
  } catch (error) {
    res.status(500).json({ error: "Deployment failed" });
  }
});

// --- Vite Middleware ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
