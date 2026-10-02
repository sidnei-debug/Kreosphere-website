/* =====================================================
   KREOSPHERE ADMIN DASHBOARD
===================================================== */

/* =====================================================
   1. SUPABASE CONFIGURATION
===================================================== */
const SUPABASE_URL = "https://zuufktlrgqusaqmqhfzr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ubMzulViD-5P8MCUM817IQ_haWeQK8m";

let supabaseClient = null;

// Initialize Supabase client safely
if (typeof window.supabase !== "undefined") {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
}

/* =====================================================
   2. CHECK AUTHENTICATION
===================================================== */
document.addEventListener("DOMContentLoaded", async function () {
    if (!supabaseClient) return;

    // Verify current user session
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (!session) {
        window.location.href = "admin-login.html";
        return;
    }

    console.log("Admin logged in:", session.user.email);

    // Load dashboard data once authenticated
    await loadDashboard();

    const logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
        logoutButton.addEventListener("click", async function () {
            logoutButton.disabled = true;
            logoutButton.textContent = "Logging out...";

            // End user session in Supabase
            const { error } = await supabaseClient.auth.signOut();

            if (error) {
                console.error("Logout error:", error);
                logoutButton.disabled = false;
                logoutButton.textContent = "Logout";
                return;
            }

            window.location.href = "admin-login.html";
        });
    }
});

/* =====================================================
   3. LOAD DASHBOARD
===================================================== */
async function loadDashboard() {
    await loadStatistics();
    await loadRecentInquiries();
}

/* =====================================================
   4. LOAD STATISTICS
===================================================== */
async function loadStatistics() {
    if (!supabaseClient) return;

    // Fetch minimal inquiry data to calculate statistics
    const { data, error } = await supabaseClient.from("inquiries").select("id, status");

    if (error) {
        console.error("Error loading statistics:", error);
        return;
    }

    const inquiries = data || [];

    // Compute metric totals based on inquiry status
    const total = inquiries.length;
    const newInquiries = inquiries.filter(i => i.status === "New").length;
    const activeProjects = inquiries.filter(i => i.status === "Contacted" || i.status === "In Progress").length;
    const completed = inquiries.filter(i => i.status === "Completed").length;

    const statNumbers = document.querySelectorAll(".stat-number");
    if (statNumbers.length >= 4) {
        statNumbers[0].textContent = total;
        statNumbers[1].textContent = newInquiries;
        statNumbers[2].textContent = activeProjects;
        statNumbers[3].textContent = completed;
    }

    // Update navigation notification bubble
    const navCount = document.querySelector(".nav-count");
    if (navCount) {
        navCount.textContent = newInquiries;
    }
}

/* =====================================================
   5. LOAD RECENT INQUIRIES
===================================================== */
async function loadRecentInquiries() {
    if (!supabaseClient) return;

    // Fetch the 10 most recent inquiries sorted by creation date
    const { data, error } = await supabaseClient
        .from("inquiries")
        .select(`id, name, company, email, service, status, created_at`)
        .order("created_at", { ascending: false })
        .limit(10);

    if (error) {
        console.error("Error loading inquiries:", error);
        return;
    }

    const table = document.querySelector(".inquiries-table");
    if (!table) {
        console.error("Could not find inquiries table.");
        return;
    }

    table.innerHTML = "";

    const header = document.createElement("div");
    header.className = "table-header";
    header.innerHTML = `
        <span>CLIENT</span>
        <span>SERVICE</span>
        <span>DATE</span>
        <span>STATUS</span>
    `;
    table.appendChild(header);

    // Display empty state if no data exists
    if (!data || data.length === 0) {
        const empty = document.createElement("div");
        empty.className = "inquiry-row";
        empty.innerHTML = `<div style="grid-column: 1 / -1;">No project inquiries yet.</div>`;
        table.appendChild(empty);
        return;
    }

    // Populate table rows dynamically from fetched data
    data.forEach(function (inquiry) {
        const row = document.createElement("div");
        row.className = "inquiry-row";
        const initials = getInitials(inquiry.name);
        const formattedDate = formatDate(inquiry.created_at);
        const statusClass = getStatusClass(inquiry.status);

        row.innerHTML = `
            <div class="client-info">
                <div class="client-avatar">${initials}</div>
                <div>
                    <strong>${escapeHTML(inquiry.name)}</strong>
                    <small>${escapeHTML(inquiry.email || "")}</small>
                </div>
            </div>
            <span>${escapeHTML(inquiry.service || "Not specified")}</span>
            <span>${formattedDate}</span>
            <span class="status ${statusClass}">${escapeHTML(inquiry.status || "New")}</span>
        `;
        table.appendChild(row);
    });
}

/* =====================================================
   6. GET INITIALS
===================================================== */
function getInitials(name) {
    if (!name) return "?";
    
    // Split name into words and extract initials from first and last words
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/* =====================================================
   7. FORMAT DATE
===================================================== */
function formatDate(dateString) {
    if (!dateString) return "Unknown";
    
    // Format date specifically for en-NG locale
    const date = new Date(dateString);
    return date.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

/* =====================================================
   8. STATUS CLASS
===================================================== */
function getStatusClass(status) {
    switch (status) {
        case "New": return "status-new";
        case "Contacted": return "status-contacted";
        case "In Progress": return "status-progress";
        case "Completed": return "status-completed";
        default: return "status-new";
    }
}

/* =====================================================
   9. SECURITY
===================================================== */
function escapeHTML(value) {
    if (value === null || value === undefined) return "";
    
    // Escape standard HTML characters to prevent XSS injection
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}