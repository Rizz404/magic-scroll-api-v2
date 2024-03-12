import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import "dotenv/config";
import prisma from "./config/dbConfig";
import allowedOrigins from "./config/allowedOrigins";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import noteRoutes from "./routes/note";
import tagRoutes from "./routes/tag";
import studyRoutes from "./routes/study";

const PORT = process.env.PORT || 5000;
const app = express();
const router = express.Router();

app.use(bodyParser.json({ limit: "30mb" }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors({ origin: allowedOrigins, credentials: true, optionsSuccessStatus: 200 }));
app.use(cookieParser());
app.use(helmet());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use("/api", router);

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/notes", noteRoutes);
router.use("/tags", tagRoutes);
router.use("/studies", studyRoutes);

prisma
  .$connect()
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch((error) => console.log(error));
