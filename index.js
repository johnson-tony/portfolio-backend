const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// --- MongoDB Connection ---
mongoose.connect(
  "mongodb+srv://tonyjanson121_db_user:iOSNG2PYFzRANqRh@cluster0.wyx2ymq.mongodb.net/?appName=Cluster0",
  { useNewUrlParser: true, useUnifiedTopology: true }
)
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// --- Schemas ---
const Resource = mongoose.model("Resource", {
  title: String,
  category: String,
  description: String
});

const Project = mongoose.model("Project", {
  title: String,
  problem: String,
  decision: String,
  tradeoff: String,
  outcome: String
});

const Profile = mongoose.model("Profile", {
  fullName: String,
  role: String,
  about: String,
  currentFocus: String,
  skills: String,
  linkedin: String,
  github: String,
  email: String
});

const Message = mongoose.model("Message", {
  email: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});

// --- Resources Routes ---
app.get("/resources", async (req, res) => {
  const resources = await Resource.find();
  res.json(resources);
});

app.post("/resources", async (req, res) => {
  const resource = new Resource(req.body);
  await resource.save();
  res.json({ message: "Resource added", resource });
});

app.put("/resources/:id", async (req, res) => {
  const updated = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ message: "Resource updated", resource: updated });
});

app.delete("/resources/:id", async (req, res) => {
  await Resource.findByIdAndDelete(req.params.id);
  res.json({ message: "Resource deleted" });
});

// --- Projects Routes ---
app.get("/projects", async (req, res) => {
  const projects = await Project.find();
  res.json(projects);
});

app.post("/projects", async (req, res) => {
  const project = new Project(req.body);
  await project.save();
  res.json({ message: "Project added", project });
});

app.put("/projects/:id", async (req, res) => {
  const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ message: "Project updated", project: updated });
});

app.delete("/projects/:id", async (req, res) => {
  await Project.findByIdAndDelete(req.params.id);
  res.json({ message: "Project deleted" });
});

// --- Profile Routes ---
app.get("/profile", async (req, res) => {
  const profile = await Profile.findOne();
  res.json(profile);
});

app.post("/profile", async (req, res) => {
  await Profile.deleteMany(); // ensure only 1 profile
  const profile = new Profile(req.body);
  await profile.save();
  res.json({ message: "Profile saved", profile });
});

app.put("/profile", async (req, res) => {
  const profile = await Profile.findOneAndUpdate({}, req.body, { new: true });
  res.json({ message: "Profile updated", profile });
});

// --- Messages Routes ---
app.get("/messages", async (req, res) => {
  const messages = await Message.find();
  res.json(messages);
});

app.post("/messages", async (req, res) => {
  const message = new Message(req.body);
  await message.save();
  res.json({ message: "Message received", data: message });
});

app.put("/messages/:id", async (req, res) => {
  const updated = await Message.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ message: "Message updated", data: updated });
});

app.delete("/messages/:id", async (req, res) => {
  await Message.findByIdAndDelete(req.params.id);
  res.json({ message: "Message deleted" });
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
