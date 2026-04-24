# 💸 Expense Tracker (Full Stack Web Application)

## 📌 Project Overview

This is a simple full-stack Expense Tracker web application built using HTML, CSS, JavaScript (frontend) and Flask (backend).
The application allows users to add and view expenses dynamically.

---

## 🧠 Tech Stack

* Frontend: HTML, CSS, JavaScript
* Backend: Python (Flask)
* Database: In-memory storage (Python list)

---

## 🚀 Project Flow

### 1. Frontend Development

* Created a single-page interface with sections:

  * Home (Dashboard)
  * Add Expense
  * Add Budget
  * Expense History
* Used HTML for structure and CSS for styling
* Implemented navigation using JavaScript (show/hide sections)

---

### 2. Frontend Logic (JavaScript)

* Used a temporary array to simulate expense data
* Implemented:

  * Add Expense functionality
  * Display expenses dynamically using DOM manipulation
  * Delete expense functionality
* Later replaced dummy data with backend API calls

---

### 3. Backend Development (Flask)

* Created a Flask server with REST APIs
* Used an in-memory list to store expenses

#### APIs:

* GET /api/expenses → Fetch all expenses
* POST /api/expenses → Add a new expense

---

### 4. Data Validation

* Ensured:

  * Amount must be greater than 0
  * Required fields are not empty

---

### 5. Frontend–Backend Integration

* Used `fetch()` in JavaScript to connect with Flask APIs
* Data flow:

  * User submits form → API call → Backend stores data
  * Frontend fetches updated data → UI updates

---

## 🔄 Application Flow

User → Frontend Form → JS Fetch API → Flask Backend → Data Stored
↓
Response Sent
↓
Frontend Updates UI

---

## 🎯 Features

* Add new expense
* View all expenses
* Dynamic UI updates
* Data validation
* Full-stack integration

---

## ⚠️ Note

* Data is stored in-memory, so it resets on page reload/server restart
* No authentication is implemented

---

## 👨‍💻 Future Improvements

* Add SQL database integration
* Implement update/delete APIs
* Add filtering and search
* Deploy frontend and backend

---

## 📌 Conclusion

This project demonstrates a basic full-stack application with API integration, dynamic UI updates, and clean code structure.
