import express from "express";
import cors from "cors";
import "./loadEnvironment.js";
import "express-async-errors";
import savePdf from "./routes/save-pdf.js";

const PORT = process.env.PORT || 5050;
const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
  })
);
app.use(express.json());

// Load the /save-pdf routes
app.use("/save-pdfs", savePdf);

app.get("/", (req, res) => {
  res.send("Hello Welcome to the Certificate Generator API!");
});

// Global error handling
app.use((err, _req, res, next) => {
  res.status(500).send("Uh oh! An unexpected error occured.");
});

// start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});

export default app;
