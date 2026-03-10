import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";


import Organization from "./Routes/Users/Organization.js"
import Autherization from "./Routes/Users/Auth.js"
import Employee from "./Routes/Users/Employee.js"
import Medicines from "./Routes/Medicine/PostingMeds.js"
import FetchMeds from "./Routes/Medicine/FetchingMeds.js"
import MintMeds from "./Routes/Medicine/MintingMedicine.js"
import Batches from "./Routes/Batches/FetchingBatch.js"
import CreateShipment from "./Routes/Transfer/CreatingShipment.js"
import FetchShipment from "./Routes/Transfer/GettingShipment.js"
import PassShip from "./Routes/Transfer/PassingShipment.js"
import RedeemShip from "./Routes/Transfer/RedeemShipment.js"
import UpdateShip from "./Routes/Transfer/UpdatingShipment.js"
import FreezeBatch from "./Routes/Batches/FreezingBatch.js"
dotenv.config();

const app = express();
const PORT = 6090;

app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
// Only parse JSON
app.use(express.json({ type: "application/json" }));
app.use(express.urlencoded({ extended: true }));

app.use("/", Organization);
app.use("/", Autherization);
app.use("/", Employee)
app.use("/", Medicines);
app.use("/", FetchMeds);
app.use("/", MintMeds);
app.use("/", Batches);
app.use("/", CreateShipment);
app.use("/", FetchShipment);
app.use("/", PassShip);
app.use("/", RedeemShip);
app.use("/", UpdateShip);
app.use("/", FreezeBatch);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});