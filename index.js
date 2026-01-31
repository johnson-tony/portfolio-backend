// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();

/* ======================================================
   ENSURE UPLOAD FOLDER EXISTS
====================================================== */
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/* ======================================================
   MIDDLEWARE
====================================================== */
app.use(cors({
  origin: "*", // later replace with your Vercel domain
}));

app.use(express.json());

// Serve uploaded files publicly
app.use("/uploads", express.static(uploadDir));

/* ======================================================
   MULTER CONFIG
====================================================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

/* ======================================================
   MONGODB
====================================================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

/* ======================================================
   SCHEMAS
====================================================== */
const Resource = mongoose.model("Resource", {
  title: String,
  category: String,
  description: String,
  fileUrl: String,
});

const Project = mongoose.model("Project", {
  title: String,
  problem: String,
  decision: String,
  tradeoff: String,
  outcome: String,
});

const ProfileSchema = new mongoose.Schema({
  fullName: { type: String, default: "" },
  role: { type: String, default: "" },
  about: { type: String, default: "" },
  currentFocus: { type: String, default: "" },
  skills: { type: String, default: "" },
  linkedin: { type: String, default: "" },
  github: { type: String, default: "" },
  email: { type: String, default: "" },
});

const Profile = mongoose.model("Profile", ProfileSchema);

/* ======================================================
   RESOURCES ROUTES
====================================================== */

// Get all resources
app.get("/resources", async (req, res) => {
  try {
    const resources = await Resource.find();
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch resources" });
  }
});

// Add resource with PDF
app.post("/resources", upload.single("file"), async (req, res) => {
  try {
    const { title, category, description } = req.body;
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const resource = new Resource({
      title,
      category,
      description,
      fileUrl,
    });

    await resource.save();
    res.json(resource);
  } catch (err) {
    res.status(500).json({ message: "Failed to add resource" });
  }
});

// Update resource
app.put("/resources/:id", upload.single("file"), async (req, res) => {
  try {
    const updateData = req.body;

    if (req.file) {
      updateData.fileUrl = `/uploads/${req.file.filename}`;
    }

    const updated = await Resource.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update resource" });
  }
});

// Delete resource
app.delete("/resources/:id", async (req, res) => {
  try {
    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: "Resource deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete resource" });
  }
});

/* ======================================================
   PROJECTS ROUTES
====================================================== */
app.get("/projects", async (req, res) => {
  const projects = await Project.find();
  res.json(projects);
});

app.post("/projects", async (req, res) => {
  const project = new Project(req.body);
  await project.save();
  res.json(project);
});

app.put("/projects/:id", async (req, res) => {
  const updated = await Project.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
});

app.delete("/projects/:id", async (req, res) => {
  await Project.findByIdAndDelete(req.params.id);
  res.json({ message: "Project deleted" });
});

/* ======================================================
   PROFILE ROUTES
====================================================== */
app.get("/profile", async (req, res) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = new Profile({});
      await profile.save();
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

app.put("/profile", async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      {},
      req.body,
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile" });
  }
});

/* ======================================================
   SERVER
====================================================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Backend running on port ${PORT}`)
);
