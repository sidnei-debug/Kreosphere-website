/* =====================================================
   KREOSPHERE ADMIN LOGIN
===================================================== */

const SUPABASE_URL = "https://zuufktlrgqusaqmqhfzr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ubMzulViD-5P8MCUM817IQ_haWeQK8m";

let supabaseClient = null;

// Initialize Supabase client safely
if (typeof window.supabase !== "undefined") {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
}

/* =====================================================
   LOGIN
===================================================== */
document.addEventListener("DOMContentLoaded", async function () {
    const loginForm = document.getElementById("loginForm");
    const loginError = document.getElementById("loginError");
    const loginButton = document.getElementById("loginButton");

    if (!supabaseClient) {
        if (loginError) loginError.textContent = "Supabase SDK failed to load.";
        return;
    }

    // Check for existing session and redirect if already logged in
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        window.location.href = "admin.html";
        return;
    }

    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            
            if (loginError) loginError.textContent = "";

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;

            // Disable button during authentication attempt
            loginButton.disabled = true;
            loginButton.textContent = "Signing in...";

            // Attempt sign-in with provided credentials
            const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

            if (error) {
                console.error("Admin login error:", error);
                if (loginError) loginError.textContent = "Invalid email or password.";
                loginButton.disabled = false;
                loginButton.textContent = "Sign In";
                return;
            }

            // Redirect on successful login
            window.location.href = "admin.html";
        });
    }
});