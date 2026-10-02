/* =====================================================
   KREOSPHERE WEBSITE JAVASCRIPT
===================================================== */

/* =====================================================
   1. SUPABASE CONFIGURATION
===================================================== */
const SUPABASE_URL = "https://zuufktlrgqusaqmqhfzr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ubMzulViD-5P8MCUM817IQ_haWeQK8m";
let supabaseClient = null;

// Initialize Supabase client if the SDK is loaded
if (typeof window.supabase !== "undefined") {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
            storage: {
                getItem: () => null,
                setItem: () => {},
                removeItem: () => {}
            }
        }
    });
}

/* =====================================================
   2. PROJECT INQUIRY FORM
===================================================== */
const projectForm = document.getElementById("projectForm");

if (projectForm) {
    projectForm.addEventListener("submit", async function (event) {
        // Prevent default form submission and save original button text
        event.preventDefault();
        const submitButton = projectForm.querySelector(".submit-button");
        const originalButtonText = submitButton.innerHTML;

        if (!supabaseClient) {
            showFormError("The connection to our server could not be established. Please try again later.");
            return;
        }

        // Disable submit button to prevent duplicate submissions
        submitButton.disabled = true;
        submitButton.innerHTML = "Sending...";

        // Collect form data into an object
        const formData = new FormData(projectForm);
        const inquiry = {
            name: formData.get("name"),
            company: formData.get("company"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            service: formData.get("service"),
            budget: formData.get("budget"),
            timeline: formData.get("timeline"),
            message: formData.get("message"),
            source: formData.get("source"),
            status: "New"
        };

        // Insert inquiry into Supabase without requesting a return payload
        const { error } = await supabaseClient.from("inquiries").insert([inquiry]);

        if (error) {
            console.error("Supabase inquiry error:", error);
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
            showFormError("We couldn't send your inquiry. Please check your connection and try again.");
            return;
        }

        console.log("Inquiry successfully submitted.");
        
        // Redirect the visitor to the dedicated success page
        window.location.href = "success.html";
    });
}

/* =====================================================
   3. FORM ERROR MESSAGE
===================================================== */
function showFormError(message) {
    if (!projectForm) return;

    let errorMessage = document.getElementById("formErrorMessage");

    // Create error message element if it doesn't exist
    if (!errorMessage) {
        errorMessage = document.createElement("div");
        errorMessage.id = "formErrorMessage";
        errorMessage.className = "form-error-message";
        projectForm.appendChild(errorMessage);
    }

    errorMessage.textContent = message;
    errorMessage.style.display = "block";
    errorMessage.scrollIntoView({ behavior: "smooth", block: "center" });
}

/* =====================================================
   4. HIDE ERROR WHEN USER EDITS FORM
===================================================== */
if (projectForm) {
    projectForm.addEventListener("input", function () {
        const errorMessage = document.getElementById("formErrorMessage");
        if (errorMessage) {
            errorMessage.style.display = "none";
        }
    });
}

/* =====================================================
   5. SMOOTH SCROLLING
===================================================== */
document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
        const targetId = this.getAttribute("href");

        // Ignore if no specific target or target doesn't exist on page
        if (targetId === "#" || !document.querySelector(targetId)) {
            return;
        }

        event.preventDefault();
        document.querySelector(targetId).scrollIntoView({ behavior: "smooth" });
    });
});