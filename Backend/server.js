import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";


import Organization from "./Routes/Users/Organization.js"
import Autherization from "./Routes/Users/Auth.js"
import Employee from "./Routes/Users/Employee.js"
import Medicines from "./Routes/Medicine/PostingMeds.js"
import FetchMeds from "./Routes/Medicine/FetchingMeds.js"
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
app.use("/", Autherization); 
app.use("/", Employee)
app.use("/", Medicines);
app.use("/", FetchMeds);
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});