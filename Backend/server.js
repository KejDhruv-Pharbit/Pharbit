import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";


import Organization from "./Routes/Users/Organization.js"
dotenv.config();

const app = express();
const PORT = 6090;

app.use(cookieParser());
app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use("/", Organization); 
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});