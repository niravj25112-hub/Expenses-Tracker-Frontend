let budget = 0;
let expenses = [];
const API = "http://127.0.0.1:5000/api";
const SUPABASE_URL = "https://zztdlspnbqjrunctjnky.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6dGRsc3BuYnFqcnVuY3Rqbmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NzUwNzUsImV4cCI6MjA5MzA1MTA3NX0.vns6j40f47-x9nWtboNaC4F_d3Litv0BDIqRtjRh-Ds";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
// Finds an element by id so repeated DOM code stays short and readable.
function $(id) {
    return document.getElementById(id);
}
// Reads the saved login token from browser storage.
function getToken() {
    return localStorage.getItem("token");
}
// Builds request headers for protected Flask API routes.
function authHeaders() {
    return { "Content-Type": "application/json", "Authorization": `Bearer ${getToken()}` };
}
// Reads the display name saved after login.
function getUserName() {
    return localStorage.getItem("userName") || "";
}
// Reads the Google profile photo saved after login.
function getUserAvatar() {
    return localStorage.getItem("userAvatar") || "";
}
// Converts a number into a rupee currency label.
function formatMoney(value) {
    return `₹${Number(value).toFixed(2)}`;
}
// Sends JSON requests to Flask and returns both response and data.
async function apiRequest(path, options = {}) {
    const res = await fetch(`${API}${path}`, options);
    const data = await res.json();
    return { res, data };
}
// Saves token, name, and avatar in local storage after login.
function saveUser(token, name, avatar = "") {
    localStorage.setItem("token", token);
    localStorage.setItem("userName", name);
    avatar ? localStorage.setItem("userAvatar", avatar) : localStorage.removeItem("userAvatar");
}
// Shows the login card or signup card inside the auth page.
function showAuthMode(mode) {
    const isSignup = mode === "signup";
    $("loginCard").classList.toggle("is-hidden", isSignup);
    $("signupCard").classList.toggle("is-hidden", !isSignup);
    setAuthError("", "login");
    setAuthError("", "signup");
}
// Shows an auth error message below the correct auth card.
function setAuthError(message, mode = "login") {
    $(mode === "signup" ? "signupError" : "authError").textContent = message;
}
// Shows the requested page and keeps app pages protected.
function showPage(pageId) {
    if (pageId !== "authPage" && !getToken()) pageId = "authPage";
    ["authPage", "dashboard", "addExpense", "history", "setbudget"].forEach(function (page) {
        $(page).style.display = page === pageId ? "block" : "none";
    });
    document.querySelectorAll(".nav-link").forEach(function (tab) {
        tab.classList.toggle("active", tab.dataset.page === pageId);
    });
    const loggedIn = Boolean(getToken());
    $("logoutBtn").classList.toggle("is-hidden", !loggedIn);
    $("userName").classList.toggle("is-hidden", !loggedIn);
    $("userName").textContent = getUserName() ? `Hi, ${getUserName()}` : "";
    $("userAvatar").src = getUserAvatar();
    $("userAvatar").classList.toggle("is-hidden", !loggedIn || !getUserAvatar());
    if (pageId === "history") loadExpenses();
}
// Creates an email/password account through the Flask backend.
async function signup() {
    const name = $("signupName").value.trim();
    const email = $("signupEmail").value.trim();
    const password = $("signupPassword").value;
    const confirmPassword = $("signupConfirmPassword").value;
    setAuthError("", "signup");
    if (!name || !email || !password || !confirmPassword) {
        return setAuthError("Name, email, password and confirm password are required.", "signup");
    }
    if (password.length < 6) return setAuthError("Password must be at least 6 characters.", "signup");
    if (password !== confirmPassword) return setAuthError("Password and confirm password must match.", "signup");
    try {
        const { res, data } = await apiRequest("/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password, confirmPassword })
        });
        if (!res.ok) return setAuthError(data.error_description || data.msg || data.error || "Signup failed.", "signup");
        ["signupName", "signupEmail", "signupPassword", "signupConfirmPassword"].forEach(function (id) {
            $(id).value = "";
        });
        $("loginEmail").value = email;
        showAuthMode("login");
        showToast("Account created. Now click Login.", "#3aa45b");
    } catch (error) {
        setAuthError("Backend is not running or cannot be reached.", "signup");
    }
}
// Logs in with email/password through Flask and stores the token.
async function login() {
    const email = $("loginEmail").value.trim();
    const password = $("loginPassword").value;
    setAuthError("");
    if (!email || !password) return setAuthError("Email and password are required.");
    try {
        const { res, data } = await apiRequest("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        if (!res.ok || !data.access_token) {
            return setAuthError(data.error_description || data.msg || data.error || "Login failed.");
        }
        const meta = data.user && data.user.user_metadata ? data.user.user_metadata : {};
        saveUser(data.access_token, meta.display_name || email.split("@")[0]);
        await loadBudget();
        await loadExpenses();
        showToast("Login successful.", "#3aa45b");
        showPage("dashboard");
    } catch (error) {
        setAuthError("Backend is not running or cannot be reached.");
    }
}
// Starts Supabase Google login and redirects back to this page.
async function loginWithGoogle(mode = "login") {
    setAuthError("", mode);
    const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.href.split("#")[0].split("?")[0] }
    });
    if (error) setAuthError(error.message, mode);
}
// Saves the Supabase session token so Flask can use it for database APIs.
async function saveSession() {
    const { data, error } = await supabaseClient.auth.getSession();
    if (error || !data.session) return false;
    const user = data.session.user;
    const meta = user.user_metadata || {};
    saveUser(
        data.session.access_token,
        meta.full_name || meta.name || user.email.split("@")[0],
        meta.avatar_url || meta.picture || ""
    );
    return true;
}
// Logs out from Supabase and clears local app state.
async function logout() {
    await supabaseClient.auth.signOut();
    ["token", "userName", "userAvatar"].forEach(function (key) {
        localStorage.removeItem(key);
    });
    budget = 0;
    expenses = [];
    updateDashboard();
    renderTable([]);
    showToast("Logged out.", "#3aa45b");
    showPage("authPage");
}
// Recalculates dashboard cards from budget and expenses.
function updateDashboard() {
    const totalSpent = expenses.reduce(function (sum, expense) {
        return sum + Number(expense.amount);
    }, 0);
    const remaining = budget - totalSpent;
    const spentPct = budget > 0 ? (totalSpent / budget) * 100 : 0;
    const remainingPct = budget > 0 ? (remaining / budget) * 100 : 0;
    $("budgetValue").textContent = formatMoney(budget);
    $("spentValue").textContent = formatMoney(totalSpent);
    $("remainingValue").textContent = formatMoney(remaining);
    $("spentPercent").textContent = `${Math.round(spentPct)}% of budget used`;
    $("remainingPercent").textContent = `${Math.max(0, Math.round(remainingPct))}% still left`;
    $("currentBudgetDisplay").textContent = formatMoney(budget);
}
// Loads logged-in user's expenses through Flask.
async function loadExpenses() {
    if (!getToken()) return;
    try {
        const { res, data } = await apiRequest("/expenses", { headers: authHeaders() });
        if (!res.ok) throw new Error(data.error || "Could not load expenses.");
        expenses = data.map(function (item) {
            return {
                id: item.id,
                title: item.title,
                amount: Number(item.amount),
                type: item.type,
                category: item.category,
                date: item.expense_date
            };
        });
        renderTable(expenses);
        updateDashboard();
    } catch (error) {
        console.error(error.message);
        renderTable(expenses);
    }
}
// Renders expense rows into the history table.
function renderTable(data) {
    if (data.length === 0) {
        $("historyTable").innerHTML = `<tr><td class="empty-row" colspan="4">No expenses found.</td></tr>`;
        return;
    }
    $("historyTable").innerHTML = data.map(function (expense) {
        return `
            <tr>
                <td>${expense.date}</td>
                <td>${expense.title}</td>
                <td><span class="badge ${getBadgeClass(expense.category)}">${expense.category}</span></td>
                <td class="amount-text">-${formatMoney(expense.amount)}</td>
            </tr>
        `;
    }).join("");
}
// Filters the locally loaded expenses by title and category.
function filterExpenses() {
    const search = $("searchInput").value.toLowerCase().trim();
    const category = $("categoryFilter").value;
    const filtered = expenses.filter(function (expense) {
        return expense.title.toLowerCase().includes(search) && (!category || expense.category === category);
    });
    renderTable(filtered);
}
// Returns the CSS badge class for a category.
function getBadgeClass(category) {
    const badges = {
        "Food/Drink": "badge-food",
        "Academic": "badge-academic",
        "Transport": "badge-transport",
        "Entertainment": "badge-entertainment",
        "Shopping": "badge-shopping"
    };
    return badges[category] || "badge-other";
}
// Validates and saves a new expense through Flask.
async function handleSubmit(e) {
    e.preventDefault();
    const title = $("expTitle").value.trim();
    const amount = Number($("expAmount").value);
    const type = $("expType").value;
    const category = $("expCategory").value;
    $("formError").textContent = "";
    if (!getToken()) return $("formError").textContent = "Please login first.";
    if (!title) return $("formError").textContent = "Description is required.";
    if (!amount || amount <= 0) return $("formError").textContent = "Amount must be greater than 0.";
    if (!category) return $("formError").textContent = "Category is required.";
    try {
        const { res, data } = await apiRequest("/expenses", {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({
                title,
                amount,
                type,
                category,
                date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })
            })
        });
        if (!res.ok) {
            $("formError").textContent = data.error || data.message || data.msg || "Could not add expense.";
            return;
        }
        $("expenseForm").reset();
        showToast("Expense added successfully.", "#3aa45b");
        showPage("history");
    } catch (error) {
        $("formError").textContent = "Backend is not running or cannot be reached.";
    }
}
// Loads the latest saved budget for the logged-in user.
async function loadBudget() {
    if (!getToken()) return;
    try {
        const { res, data } = await apiRequest("/budget", { headers: authHeaders() });
        if (res.ok && data.length > 0) {
            budget = Number(data[0].amount);
            updateDashboard();
        }
    } catch (error) {
        console.error("Budget could not be loaded.");
    }
}
// Validates and saves a budget through Flask.
async function saveBudget() {
    const amount = Number($("newBudget").value);
    const month = $("budgetMonth").value;
    if (!getToken()) return showToast("Please login first.", "#d73b35");
    if (!amount || amount <= 0) return showToast("Please enter a valid budget.", "#d73b35");
    try {
        const { res, data } = await apiRequest("/budget", {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ amount, month })
        });
        if (!res.ok) return showToast(data.error || data.message || data.msg || "Budget not saved.", "#d73b35");
        budget = amount;
        updateDashboard();
        showToast("Budget saved successfully.", "#3aa45b");
        setTimeout(function () { showPage("dashboard"); }, 1200);
    } catch (error) {
        showToast("Backend is not running or cannot be reached.", "#d73b35");
    }
}
// Shows a short notification message.
function showToast(message, color) {
    const toast = $("toast");
    toast.textContent = message;
    toast.style.backgroundColor = color;
    toast.classList.add("show");
    setTimeout(function () { toast.classList.remove("show"); }, 2500);
}
// Connects buttons, forms, search, and filter controls to their functions.
function initializeEvents() {
    document.querySelectorAll("[data-page]").forEach(function (button) {
        button.addEventListener("click", function () { showPage(button.dataset.page); });
    });
    const clicks = {
        loginBtn: login,
        signupBtn: signup,
        googleLoginBtn: loginWithGoogle,
        googleSignupBtn: function () { loginWithGoogle("signup"); },
        logoutBtn: logout,
        saveBudgetBtn: saveBudget,
        showSignupBtn: function () { showAuthMode("signup"); },
        showLoginBtn: function () { showAuthMode("login"); },
        editBudgetBtn: function () { showPage("setbudget"); }
    };
    Object.keys(clicks).forEach(function (id) {
        $(id).addEventListener("click", clicks[id]);
    });
    $("expenseForm").addEventListener("submit", handleSubmit);
    $("searchInput").addEventListener("input", filterExpenses);
    $("categoryFilter").addEventListener("change", filterExpenses);
}
// Sets current date, restores session, and opens the correct first page.
async function initializeApp() {
    const today = new Date();
    $("currentDate").textContent = today.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
    $("budgetMonth").value = today.toLocaleDateString("en-US", { month: "long" });
    initializeEvents();
    if (await saveSession()) {
        await loadBudget();
        await loadExpenses();
        showPage("dashboard");
    } else {
        showPage("authPage");
    }
    updateDashboard();
}
initializeApp();