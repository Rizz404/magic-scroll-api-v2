import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import "dotenv/config";
import prisma from "./config/dbConfig";
import allowedOrigins from "./config/allowedOrigins";
import authRoutes from "./routes/auth-route";
import userRoutes from "./routes/user-route";
import noteRoutes from "./routes/note-route";
import notePermissionRoutes from "./routes/notePermission-route";
import noteAttachmentRoutes from "./routes/noteAttachment-route";
import tagRoutes from "./routes/tag-route";

const PORT = process.env.PORT || 5000;
const app = express();
const router = express.Router();

app.use(bodyParser.json({ limit: "30mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({ origin: allowedOrigins, credentials: true, optionsSuccessStatus: 200 })
);
app.use(cookieParser());
app.use(helmet());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use("/api", router);

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/notes", noteRoutes);
router.use("/note-permissions", notePermissionRoutes);
router.use("/note-attachments", noteAttachmentRoutes);
router.use("/tags", tagRoutes);

prisma
  .$connect()
  .then(() =>
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  )
  .catch((error) => console.log(error));
