
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Student = require("./models/Student");

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173"
}));

app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Student Management System Backend is running!");
});

// GET: View all students
app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch students." });
  }
});

// GET: View one student
app.get("/api/students/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid student ID." });
    }

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch student." });
  }
});

// POST: Add a student
app.post("/api/students", async (req, res) => {
  try {
    const { studentId, name, email, department, semester, contact } = req.body;

    if (!studentId || !name || !email || !department ||
        semester === undefined || semester === "" || !contact) {
      return res.status(400).json({ message: "Please fill in all fields." });
    }

    const student = await Student.create({
      studentId,
      name,
      email,
      department,
      semester,
      contact
    });

    res.status(201).json(student);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "This student ID already exists." });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Failed to add student." });
  }
});

// PUT: Update a student
app.put("/api/students/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid student ID." });
    }

    const { studentId, name, email, department, semester, contact } = req.body;

    if (!studentId || !name || !email || !department ||
        semester === undefined || semester === "" || !contact) {
      return res.status(400).json({ message: "Please fill in all fields." });
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { studentId, name, email, department, semester, contact },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    res.json(student);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "This student ID already exists." });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Failed to update student." });
  }
});

// DELETE: Delete a student
app.delete("/api/students/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid student ID." });
    }

    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    res.json({ message: "Student deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete student." });
  }
});

// Start server after connecting to MongoDB
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Atlas connected successfully!");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();
