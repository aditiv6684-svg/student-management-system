
import { useEffect, useState } from "react";
import "./index.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const emptyForm = {
  studentId: "",
  name: "",
  email: "",
  department: "",
  semester: "1",
  contact: "",
};

function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadStudents() {
    try {
      const response = await fetch(`${API_URL}/api/students`);
      if (!response.ok) throw new Error("Could not load students.");
      setStudents(await response.json());
    } catch {
      setMessage("Cannot connect to the backend. Check that it is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const url = editingId
      ? `${API_URL}/api/students/${editingId}`
      : `${API_URL}/api/students`;

    try {
      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, semester: Number(form.semester) }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Request failed.");

      setMessage(editingId ? "Student updated successfully!" : "Student added successfully!");
      setForm(emptyForm);
      setEditingId(null);
      await loadStudents();
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    }
  }

  function handleEdit(student) {
    setForm({
      studentId: student.studentId,
      name: student.name,
      email: student.email,
      department: student.department,
      semester: String(student.semester),
      contact: student.contact,
    });
    setEditingId(student._id);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this student?")) return;

    try {
      const response = await fetch(`${API_URL}/api/students/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Delete failed.");

      setMessage("Student deleted successfully!");
      await loadStudents();
    } catch (error) {
      setMessage(error.message || "Could not delete student.");
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
  }

  const filteredStudents = students.filter((student) =>
    [
      student.studentId,
      student.name,
      student.email,
      student.department,
    ].some((value) => value.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <main className="container">
      <header className="page-header">
        <p className="eyebrow">STUDENT PORTAL</p>
        <h1>Student Information Management</h1>
        <p className="subtitle">
          Manage student records in one place.
        </p>
      </header>

      <section className="card">
        <h2>{editingId ? "Edit Student" : "Add a Student"}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Student ID
              <input
                name="studentId"
                value={form.studentId}
                onChange={handleChange}
                placeholder="e.g. STU001"
                required
              />
            </label>

            <label>
              Full Name
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
              />
            </label>

            <label>
              Email
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="student@example.com"
                required
              />
            </label>

            <label>
              Department
              <input
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="e.g. Computer Engineering"
                required
              />
            </label>

            <label>
              Semester
              <select name="semester" value={form.semester} onChange={handleChange}>
                {Array.from({ length: 12 }, (_, index) => (
                  <option key={index + 1} value={index + 1}>
                    Semester {index + 1}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Contact Number
              <input
                name="contact"
                type="tel"
                value={form.contact}
                onChange={handleChange}
                placeholder="Enter contact number"
                required
              />
            </label>
          </div>

          <div className="form-actions">
            <button type="submit">
              {editingId ? "Save Changes" : "Add Student"}
            </button>
            {editingId && (
              <button type="button" className="secondary" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>

        {message && <p className="message" role="status">{message}</p>}
      </section>

      <section className="card">
        <div className="list-heading">
          <div>
            <h2>Student Records</h2>
            <p className="subtitle">{students.length} student(s) in the database</p>
          </div>

          <input
            className="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search students..."
            aria-label="Search students"
          />
        </div>

        {loading ? (
          <p>Loading students...</p>
        ) : filteredStudents.length === 0 ? (
          <p className="empty">No student records found.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Semester</th>
                  <th>Contact</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student._id}>
                    <td>{student.studentId}</td>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>{student.department}</td>
                    <td>{student.semester}</td>
                    <td>{student.contact}</td>
                    <td className="actions">
                      <button className="small secondary" onClick={() => handleEdit(student)}>
                        Edit
                      </button>
                      <button className="small danger" onClick={() => handleDelete(student._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer>Student Information Management System</footer>
    </main>
  );
}

export default App;
