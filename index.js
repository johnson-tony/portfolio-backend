// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// ---------------- Multer ----------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ---------------- MongoDB ----------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// ---------------- Schemas ----------------
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

// ---------------- Resources ----------------
app.get("/resources", async (req, res) => {
  const resources = await Resource.find();
  res.json(resources);
});

app.post("/resources", upload.single("file"), async (req, res) => {
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
});

app.put("/resources/:id", upload.single("file"), async (req, res) => {
  const updateData = req.body;
  if (req.file) updateData.fileUrl = `/uploads/${req.file.filename}`;

  const updated = await Resource.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true }
  );

  res.json(updated);
});

app.delete("/resources/:id", async (req, res) => {
  await Resource.findByIdAndDelete(req.params.id);
  res.json({ message: "Resource deleted" });
});

// ---------------- Projects ----------------
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

// ---------------- Profile (FIXED) ----------------

// GET profile (always returns object)
app.get("/profile", async (req, res) => {
  let profile = await Profile.findOne();

  if (!profile) {
    profile = new Profile({});
    await profile.save();
  }

  res.json(profile);
});

// UPDATE / CREATE profile
app.put("/profile", async (req, res) => {
  const profile = await Profile.findOneAndUpdate(
    {},
    req.body,
    { new: true, upsert: true }
  );

  res.json(profile);
});

// ---------------- Server ----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Backend running on port ${PORT}`)
);
