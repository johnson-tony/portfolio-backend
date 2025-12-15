const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Atlas connection (use your credentials)
mongoose.connect(
  "mongodb+srv://tonyjanson121_db_user:U0YCm60pRdPbkFpE@cluster0.abcd.mongodb.net/portfolioDB",
  { useNewUrlParser: true, useUnifiedTopology: true }
)
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// --- Schemas ---
const Project = mongoose.model("Project", {
  title: String,
  problem: String,
  decision: String,
  tradeoff: String,
  outcome: String,
});

const Resource = mongoose.model("Resource", {
  title: String,
  category: String,
  description: String,
  url: String
});

// --- Sample Endpoints ---
app.get("/projects", async (req, res) => {
  const projects = await Project.find();
  res.json(projects);
});

app.get("/resources", async (req, res) => {
  const resources = await Resource.find();
  res.json(resources);
});

// Optional: add new project/resource
app.post("/projects", async (req, res) => {
  const project = new Project(req.body);
  await project.save();
  res.json({ message: "Project added successfully", project });
});

app.post("/resources", async (req, res) => {
  const resource = new Resource(req.body);
  await resource.save();
  res.json({ message: "Resource added successfully", resource });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
