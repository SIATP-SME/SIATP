/* =========================================================
   SME INTEGRATED ACADEMIC & TRANSPARENCY PLATFORM
   MAIN JAVASCRIPT
   SUPABASE AUTHENTICATION VERSION

   ACCESS LEVELS
   ---------------------------------------------------------
   public      = no login required
   pending     = authenticated applicant, awaiting assessment
   member      = approved SME member
   officer     = SME officer
   admin       = administrator

   IMPORTANT
   ---------------------------------------------------------
   Frontend checks are for user experience only.
   Supabase RLS must enforce the actual database security.
========================================================= */


/* =========================================================
   SUPABASE CONFIGURATION
========================================================= */

const SUPABASE_URL =
  "https://ktlgmgbhacxcvbyomgeo.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_fysL0f4fh1t5kUwksnIKFw_SrWXCZ9f";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );


/* =========================================================
   PUBLIC CONTENT
========================================================= */

const PUBLIC_REVIEWERS = [
  {
    title: "1st Year General Mathematics",
    description:
      "A reviewer covering foundational concepts in General Mathematics for first-year students."
  },
  {
    title: "2nd Year College Algebra",
    description:
      "A reviewer covering important College Algebra concepts and problem-solving techniques."
  },
  {
    title: "3rd Year Geometry",
    description:
      "A reviewer covering essential Geometry concepts, theorems, and applications."
  },
  {
    title: "4th Year Advanced Mathematics",
    description:
      "A reviewer covering selected advanced mathematics topics for fourth-year students."
  }
];


const VIDEO_LESSONS = [
  {
    title: "Introduction to Algebra",
    description:
      "Learn the basic concepts, expressions, variables, and operations used in algebra."
  },
  {
    title: "Understanding Functions",
    description:
      "Explore functions, their representations, and how to evaluate them."
  },
  {
    title: "Quadratic Equations",
    description:
      "Understand quadratic equations and different methods of solving them."
  },
  {
    title: "Problem-Solving Strategies",
    description:
      "Learn practical strategies for approaching and solving mathematical problems."
  }
];


/* =========================================================
   APPLICATION STATE
========================================================= */

let currentMember = null;
let currentSession = null;

let toastTimeout = null;
let authInitialized = false;
let profileLoading = false;
let loadedProfileUserId = null;


/* =========================================================
   DOM REFERENCES
========================================================= */

let overlay = null;
let toast = null;
let navAuthArea = null;

let loginForm = null;
let signupForm = null;

let memberName = null;
let redCardYear = null;
let redCardTableBody = null;


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
  cacheDOM();

  initializeRevealAnimations();

  renderPublicReviewers();
  renderVideoLessons();

  setupEventListeners();

  await restoreMemberSession();

  updateNavigation();
  updateMemberDashboard();
});


/* =========================================================
   CACHE DOM
========================================================= */

function cacheDOM() {
  overlay = document.getElementById("overlay");
  toast = document.getElementById("toast");
  navAuthArea = document.getElementById("navAuthArea");

  loginForm = document.getElementById("loginForm");
  signupForm = document.getElementById("signupForm");

  memberName = document.getElementById("memberName");
  redCardYear = document.getElementById("redCardYear");
  redCardTableBody = document.getElementById("redCardTableBody");
}


/* =========================================================
   EVENT LISTENERS
========================================================= */

function setupEventListeners() {

  /* -------------------------------------------------------
     GENERAL ACTION BUTTONS
  ------------------------------------------------------- */

  document.addEventListener("click", async (event) => {

    const actionElement =
      event.target.closest("[data-action]");

    if (actionElement) {
      event.preventDefault();

      const action =
        actionElement.getAttribute("data-action");

      if (action) {
        await handleAction(action);
        return;
      }
    }


    /* -----------------------------------------------------
       MEMBER FEATURE BUTTONS
    ----------------------------------------------------- */

    const featureElement =
      event.target.closest("[data-member-feature]");

    if (featureElement) {
      event.preventDefault();

      const feature =
        featureElement.getAttribute("data-member-feature");

      if (feature) {
        await openMemberFeature(feature);
        return;
      }
    }


    /* -----------------------------------------------------
       REVIEWER FILE OPEN
    ----------------------------------------------------- */

    const reviewerFileButton =
      event.target.closest("[data-reviewer-file]");

    if (reviewerFileButton) {
      event.preventDefault();

      const filePath =
        reviewerFileButton.getAttribute(
          "data-reviewer-file"
        );

      if (filePath) {
        await openReviewerFile(filePath);
      }

      return;
    }


    /* -----------------------------------------------------
       REVIEWER VERIFICATION ACTIONS
    ----------------------------------------------------- */

    const verificationButton =
      event.target.closest(
        "[data-reviewer-verification-action]"
      );

    if (verificationButton) {
      event.preventDefault();

      const action =
        verificationButton.getAttribute(
          "data-reviewer-verification-action"
        );

      const submissionId =
        verificationButton.getAttribute(
          "data-submission-id"
        );

      if (action && submissionId) {
        await handleReviewerVerificationAction(
          action,
          submissionId
        );
      }

      return;
    }
  });


  /* -------------------------------------------------------
     LOGIN FORM
  ------------------------------------------------------- */

  if (loginForm) {
    loginForm.addEventListener(
      "submit",
      handleLogin
    );
  }


  /* -------------------------------------------------------
     SIGNUP FORM
  ------------------------------------------------------- */

  if (signupForm) {
    signupForm.addEventListener(
      "submit",
      handleMemberSignup
    );
  }


  /* -------------------------------------------------------
     RED CARD FILTER
  ------------------------------------------------------- */

  if (redCardYear) {
    redCardYear.addEventListener(
      "change",
      async () => {
        if (hasApprovedMemberAccess()) {
          await loadRedCardRecords();
        }
      }
    );
  }


  /* -------------------------------------------------------
     OVERLAY CLICK
  ------------------------------------------------------- */

  if (overlay) {
    overlay.addEventListener(
      "click",
      (event) => {

        if (event.target === overlay) {
          closeAllWindows();
        }

      }
    );
  }


  /* -------------------------------------------------------
     ESCAPE KEY
  ------------------------------------------------------- */

  document.addEventListener(
    "keydown",
    (event) => {

      if (event.key === "Escape") {
        closeAllWindows();
      }

    }
  );
}


/* =========================================================
   ACTION HANDLER
========================================================= */

async function handleAction(action) {

  switch (action) {

    case "member-login":
      openWindow("login");
      break;


    case "member-signup":
      openWindow("signup");
      break;


    case "public-lessons":
      openWindow("publicLessons");
      break;


    case "public-reviewers":
      openWindow("publicReviewers");
      break;


    case "close-window":
      closeAllWindows();
      break;


    case "logout":
      await handleLogout();
      break;


    default:
      console.warn(
        "Unknown data-action:",
        action
      );
  }
}


/* =========================================================
   AUTHENTICATION STATE HELPERS
========================================================= */

function isAuthenticated() {
  return Boolean(
    currentSession &&
    currentSession.user
  );
}


function getCurrentRole() {

  return String(
    currentMember?.role || ""
  )
    .trim()
    .toLowerCase();
}


function hasApprovedMemberAccess() {

  return [
    "member",
    "officer",
    "admin"
  ].includes(
    getCurrentRole()
  );
}


function isOfficerOrAdmin() {

  return [
    "officer",
    "admin"
  ].includes(
    getCurrentRole()
  );
}


function isPendingApplicant() {

  return getCurrentRole() === "pending";
}


/* =========================================================
   ACCESS MESSAGE
========================================================= */

function showAccessDeniedMessage() {

  if (isPendingApplicant()) {

    showToast(
      "Your SME membership application is still pending assessment.",
      "info"
    );

    return;
  }


  if (!isAuthenticated()) {

    showToast(
      "Please log in with an approved SME member account.",
      "warning"
    );

    openWindow("login");

    return;
  }


  showToast(
    "You do not have permission to access this feature.",
    "error"
  );
}


/* =========================================================
   OPEN MEMBER FEATURE
========================================================= */

async function openMemberFeature(feature) {

  if (!hasApprovedMemberAccess()) {
    showAccessDeniedMessage();
    return;
  }


  switch (feature) {

    case "dashboard":
      openWindow("dashboard");
      break;


    case "finance":
      openWindow("finance");
      await loadFinanceRecords();
      break;


    case "red-card":
      openWindow("redCard");
      await loadRedCardRecords();
      break;


    case "member-reviewers":
      openWindow("memberReviewers");
      await loadMemberReviewers();
      break;


    case "announcements":
      openWindow("announcements");
      break;


    case "upload-reviewer":
      openWindow("uploadReviewer");
      await loadMyReviewerSubmissions();
      break;


    case "reviewer-verification":

      if (!isOfficerOrAdmin()) {

        showToast(
          "Officer or Admin access is required.",
          "error"
        );

        return;
      }

      openWindow("reviewerVerification");

      await loadReviewerVerificationSubmissions();

      break;


    default:

      console.warn(
        "Unknown member feature:",
        feature
      );
  }
}


/* =========================================================
   WINDOW MANAGEMENT
========================================================= */

function openWindow(windowName) {

  const protectedWindows = [
    "dashboard",
    "finance",
    "redCard",
    "memberReviewers",
    "announcements",
    "uploadReviewer"
  ];


  if (
    protectedWindows.includes(windowName) &&
    !hasApprovedMemberAccess()
  ) {

    showAccessDeniedMessage();

    return;
  }


  if (
    windowName === "reviewerVerification" &&
    !isOfficerOrAdmin()
  ) {

    showToast(
      "Officer or Admin access is required.",
      "error"
    );

    return;
  }


  closeAllWindows();


  const windowElement =
    document.getElementById(
      `${windowName}Window`
    );


  if (!windowElement) {

    console.warn(
      `Window not found: #${windowName}Window`
    );

    return;
  }


  windowElement.classList.add("active");


  if (overlay) {
    overlay.classList.add("active");
  }


  document.body.classList.add(
    "modal-open"
  );
}


function closeAllWindows() {

  const windows =
    document.querySelectorAll(
      ".window, .modal-window, [data-window]"
    );


  windows.forEach(
    (windowElement) => {

      windowElement.classList.remove(
        "active"
      );

      windowElement.classList.remove(
        "show"
      );
    }
  );


  if (overlay) {
    overlay.classList.remove(
      "active"
    );
  }


  document.body.classList.remove(
    "modal-open"
  );
}


/* =========================================================
   LOGIN
========================================================= */

async function handleLogin(event) {

  event.preventDefault();


  const emailInput =
    document.getElementById("loginEmail");

  const passwordInput =
    document.getElementById("loginPassword");

  const message =
    document.getElementById("loginMessage");


  const email =
    emailInput?.value.trim() || "";

  const password =
    passwordInput?.value || "";


  if (!email || !password) {

    setFormMessage(
      message,
      "Please enter your email and password.",
      "error"
    );

    return;
  }


  setFormMessage(
    message,
    "Logging in...",
    "info"
  );


  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth.signInWithPassword({
        email,
        password
      });


    if (error) {
      throw error;
    }


    if (!data?.session) {

      throw new Error(
        "Login succeeded, but no session was returned."
      );
    }


    await applyAuthSession(
      data.session
    );


    const role =
      getCurrentRole();


    if (role === "pending") {

      setFormMessage(
        message,
        "Login successful. Your membership application is still pending assessment.",
        "warning"
      );

      showToast(
        "Your application is pending assessment.",
        "info"
      );

    } else if (
      ["member", "officer", "admin"].includes(role)
    ) {

      setFormMessage(
        message,
        "Login successful.",
        "success"
      );

      showToast(
        "Welcome back!",
        "success"
      );

      closeAllWindows();

    } else {

      setFormMessage(
        message,
        "Your account does not currently have an approved SME role.",
        "warning"
      );

      showToast(
        "Your account does not have member access.",
        "warning"
      );
    }


    updateNavigation();
    updateMemberDashboard();

  } catch (error) {

    console.error(
      "Login error:",
      error
    );


    setFormMessage(
      message,
      getSupabaseErrorMessage(
        error,
        "Unable to log in."
      ),
      "error"
    );
  }
}


/* =========================================================
   MEMBER SIGNUP
========================================================= */

async function handleMemberSignup(event) {

  event.preventDefault();


  const firstName =
    getInputValue("signupFirstName");

  const middleName =
    getInputValue("signupMiddleName");

  const lastName =
    getInputValue("signupLastName");

  const yearLevel =
    getInputValue("signupYearLevel");

  const section =
    getInputValue("signupSection");

  const email =
    getInputValue("signupEmail");

  const password =
    document.getElementById(
      "signupPassword"
    )?.value || "";

  const confirmPassword =
    document.getElementById(
      "signupConfirmPassword"
    )?.value || "";

  const message =
    document.getElementById(
      "signupMessage"
    );


  /* -------------------------------------------------------
     VALIDATION
  ------------------------------------------------------- */

  if (
    !firstName ||
    !lastName ||
    !yearLevel ||
    !section ||
    !email ||
    !password ||
    !confirmPassword
  ) {

    setFormMessage(
      message,
      "Please complete all required fields.",
      "error"
    );

    return;
  }


  if (password.length < 6) {

    setFormMessage(
      message,
      "Password must contain at least 6 characters.",
      "error"
    );

    return;
  }


  if (password !== confirmPassword) {

    setFormMessage(
      message,
      "Passwords do not match.",
      "error"
    );

    return;
  }


  setFormMessage(
    message,
    "Submitting your membership application...",
    "info"
  );


  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth.signUp({

        email,

        password,

        options: {
          data: {
            first_name: firstName,
            middle_name: middleName,
            last_name: lastName,
            year_level: yearLevel,
            section: section
          }
        }
      });


    if (error) {
      throw error;
    }


    /*
      The database trigger should create the profile
      and member application.

      If email confirmation is enabled, Supabase may
      return a user without a session.
    */


    if (data?.session) {

      await applyAuthSession(
        data.session
      );


      setFormMessage(
        message,
        "Application submitted successfully. Your account is pending SME assessment.",
        "success"
      );

    } else {

      setFormMessage(
        message,
        "Application submitted successfully. Please check your email if email confirmation is required. Your SME membership is still pending assessment.",
        "success"
      );
    }


    if (
      document.getElementById(
        "signupPassword"
      )
    ) {
      document.getElementById(
        "signupPassword"
      ).value = "";
    }


    if (
      document.getElementById(
        "signupConfirmPassword"
      )
    ) {
      document.getElementById(
        "signupConfirmPassword"
      ).value = "";
    }


    showToast(
      "Membership application submitted.",
      "success"
    );


    updateNavigation();
    updateMemberDashboard();

  } catch (error) {

    console.error(
      "Signup error:",
      error
    );


    setFormMessage(
      message,
      getSupabaseErrorMessage(
        error,
        "Unable to submit your application."
      ),
      "error"
    );
  }
}


/* =========================================================
   SESSION RESTORATION
========================================================= */

async function restoreMemberSession() {

  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth.getSession();


    if (error) {
      throw error;
    }


    if (data?.session) {

      await applyAuthSession(
        data.session
      );

    } else {

      clearAuthState();
    }

  } catch (error) {

    console.error(
      "Session restoration error:",
      error
    );

    clearAuthState();
  }


  if (!authInitialized) {

    authInitialized = true;


    supabaseClient.auth.onAuthStateChange(
      (event, session) => {

        /*
          Do not perform Supabase queries directly
          inside the auth callback.

          A short timeout allows the auth event to
          finish before profile queries are performed.
        */

        setTimeout(
          async () => {

            try {

              await applyAuthSession(
                session
              );

              updateNavigation();
              updateMemberDashboard();

            } catch (error) {

              console.error(
                "Auth state handling error:",
                error
              );
            }

          },
          0
        );
      }
    );
  }
}


/* =========================================================
   APPLY AUTH SESSION
========================================================= */

async function applyAuthSession(session) {

  if (!session || !session.user) {

    clearAuthState();

    return;
  }


  currentSession = session;

  currentMember = null;

  loadedProfileUserId = null;


  await loadCurrentMemberProfile();


  updateNavigation();
  updateMemberDashboard();
}


/* =========================================================
   LOAD CURRENT MEMBER PROFILE
========================================================= */

async function loadCurrentMemberProfile() {

  if (!currentSession?.user?.id) {

    currentMember = null;

    return;
  }


  const userId =
    currentSession.user.id;


  if (
    profileLoading &&
    loadedProfileUserId === userId
  ) {
    return;
  }


  profileLoading = true;


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("profiles")
        .select(
          "id, full_name, email, role, year_level, section"
        )
        .eq("id", userId)
        .maybeSingle();


    if (error) {
      throw error;
    }


    /*
      FAIL CLOSED

      If no profile exists, NEVER assume "member".
      Treat the account as pending/unapproved.
    */

    if (!data) {

      currentMember = {
        id: userId,
        name:
          currentSession.user.user_metadata
            ?.first_name ||
          currentSession.user.email ||
          "User",
        email:
          currentSession.user.email || "",
        role: "pending",
        year_level: "",
        section: ""
      };

    } else {

      currentMember = {

        id: data.id,

        name:
          data.full_name ||
          currentSession.user.user_metadata
            ?.first_name ||
          data.email ||
          currentSession.user.email ||
          "Member",

        email:
          data.email ||
          currentSession.user.email ||
          "",

        /*
          Never default this to "member".
        */

        role:
          String(
            data.role || "pending"
          ).toLowerCase(),

        year_level:
          data.year_level || "",

        section:
          data.section || ""
      };
    }


    loadedProfileUserId = userId;

  } catch (error) {

    console.error(
      "Profile loading error:",
      error
    );


    /*
      Fail closed if profile loading fails.
    */

    currentMember = {

      id: userId,

      name:
        currentSession.user.email ||
        "User",

      email:
        currentSession.user.email ||
        "",

      role: "pending",

      year_level: "",
      section: ""
    };

  } finally {

    profileLoading = false;
  }
}


/* =========================================================
   CLEAR AUTH STATE
========================================================= */

function clearAuthState() {

  currentSession = null;
  currentMember = null;

  loadedProfileUserId = null;
  profileLoading = false;
}


/* =========================================================
   LOGOUT
========================================================= */

async function handleLogout() {

  try {

    const {
      error
    } =
      await supabaseClient.auth.signOut();


    if (error) {
      throw error;
    }


    clearAuthState();

    closeAllWindows();

    updateNavigation();
    updateMemberDashboard();


    showToast(
      "You have been logged out.",
      "success"
    );

  } catch (error) {

    console.error(
      "Logout error:",
      error
    );


    showToast(
      getSupabaseErrorMessage(
        error,
        "Unable to log out."
      ),
      "error"
    );
  }
}


/* =========================================================
   NAVIGATION
========================================================= */

function updateNavigation() {

  if (!navAuthArea) {
    return;
  }


  if (!isAuthenticated()) {

    navAuthArea.innerHTML = `
      <button
        type="button"
        class="nav-auth-btn"
        data-action="member-login"
      >
        Member Login
      </button>
    `;

    return;
  }


  const fullName =
    currentMember?.name ||
    currentSession?.user?.email ||
    "Member";


  const firstName =
    String(fullName)
      .trim()
      .split(/\s+/)[0] ||
    "Member";


  const role =
    getCurrentRole();


  let roleLabel = "";


  if (role === "pending") {
    roleLabel = "Pending";
  } else if (role === "officer") {
    roleLabel = "Officer";
  } else if (role === "admin") {
    roleLabel = "Admin";
  } else if (role === "member") {
    roleLabel = "Member";
  }


  navAuthArea.innerHTML = `
    <button
      type="button"
      class="nav-auth-btn"
      data-member-feature="dashboard"
    >
      👤 ${escapeHTML(firstName)}
    </button>

    ${
      roleLabel
        ? `
          <span class="nav-role-label">
            ${escapeHTML(roleLabel)}
          </span>
        `
        : ""
    }

    <button
      type="button"
      class="nav-logout-btn"
      data-action="logout"
    >
      Logout
    </button>
  `;
}


/* =========================================================
   MEMBER DASHBOARD
========================================================= */

function updateMemberDashboard() {

  if (!memberName) {
    return;
  }


  if (!isAuthenticated()) {

    memberName.textContent =
      "Guest";

    return;
  }


  const name =
    currentMember?.name ||
    currentSession?.user?.email ||
    "User";


  const role =
    getCurrentRole();


  let roleText =
    "Pending Assessment";


  if (role === "member") {
    roleText = "SME Member";
  }

  if (role === "officer") {
    roleText = "SME Officer";
  }

  if (role === "admin") {
    roleText = "Administrator";
  }


  memberName.textContent =
    `${name} — ${roleText}`;
}


/* =========================================================
   PUBLIC REVIEWERS
========================================================= */

function renderPublicReviewers() {

  const container =
    document.getElementById(
      "publicReviewersList"
    );


  if (!container) {
    return;
  }


  container.innerHTML =
    PUBLIC_REVIEWERS.map(
      (reviewer) => `
        <div class="reviewer-card">

          <div class="reviewer-card-content">

            <h3>
              ${escapeHTML(
                reviewer.title
              )}
            </h3>

            <p>
              ${escapeHTML(
                reviewer.description
              )}
            </p>

          </div>

        </div>
      `
    ).join("");
}


/* =========================================================
   PUBLIC VIDEO LESSONS
========================================================= */

function renderVideoLessons() {

  const container =
    document.getElementById(
      "videoLessonsList"
    );


  if (!container) {
    return;
  }


  container.innerHTML =
    VIDEO_LESSONS.map(
      (lesson) => `
        <div class="video-lesson-card">

          <div class="video-lesson-content">

            <h3>
              ${escapeHTML(
                lesson.title
              )}
            </h3>

            <p>
              ${escapeHTML(
                lesson.description
              )}
            </p>

          </div>

        </div>
      `
    ).join("");
}


/* =========================================================
   FINANCE
========================================================= */

async function loadFinanceRecords() {

  if (!hasApprovedMemberAccess()) {

    showAccessDeniedMessage();

    return;
  }


  const tableBody =
    document.getElementById(
      "financeTableBody"
    );


  const incomeElement =
    document.getElementById(
      "totalIncome"
    );


  const expensesElement =
    document.getElementById(
      "totalExpenses"
    );


  const balanceElement =
    document.getElementById(
      "totalBalance"
    );


  if (tableBody) {

    tableBody.innerHTML = `
      <tr>
        <td colspan="100%">
          Loading financial records...
        </td>
      </tr>
    `;
  }


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("finance_records")
        .select(
          "id, transaction_date, transaction_type, category, description, amount, reference, recorded_by, created_at"
        )
        .order(
          "transaction_date",
          {
            ascending: false
          }
        );


    if (error) {
      throw error;
    }


    const records =
      Array.isArray(data)
        ? data
        : [];


    let income = 0;
    let expenses = 0;


    records.forEach(
      (record) => {

        const amount =
          Number(record.amount) || 0;


        const type =
          String(
            record.transaction_type || ""
          ).toLowerCase();


        if (
          type === "income" ||
          type === "credit" ||
          type === "deposit"
        ) {

          income += amount;

        } else {

          expenses += amount;
        }
      }
    );


    const balance =
      income - expenses;


    if (incomeElement) {
      incomeElement.textContent =
        formatCurrency(income);
    }


    if (expensesElement) {
      expensesElement.textContent =
        formatCurrency(expenses);
    }


    if (balanceElement) {
      balanceElement.textContent =
        formatCurrency(balance);
    }


    if (!tableBody) {
      return;
    }


    if (!records.length) {

      tableBody.innerHTML = `
        <tr>
          <td colspan="100%">
            No financial records found.
          </td>
        </tr>
      `;

      return;
    }


    tableBody.innerHTML =
      records.map(
        (record) => {

          const amount =
            Number(record.amount) || 0;


          return `
            <tr>

              <td>
                ${escapeHTML(
                  formatDate(
                    record.transaction_date
                  )
                )}
              </td>

              <td>
                ${escapeHTML(
                  record.transaction_type || "—"
                )}
              </td>

              <td>
                ${escapeHTML(
                  record.category || "—"
                )}
              </td>

              <td>
                ${escapeHTML(
                  record.description || "—"
                )}
              </td>

              <td>
                ${formatCurrency(amount)}
              </td>

              <td>
                ${escapeHTML(
                  record.reference || "—"
                )}
              </td>

            </tr>
          `;
        }
      ).join("");

  } catch (error) {

    console.error(
      "Finance loading error:",
      error
    );


    if (tableBody) {

      tableBody.innerHTML = `
        <tr>
          <td colspan="100%">
            Unable to load financial records.
          </td>
        </tr>
      `;
    }


    showToast(
      getSupabaseErrorMessage(
        error,
        "Unable to load financial records."
      ),
      "error"
    );
  }
}


/* =========================================================
   RED CARD TRACKER
========================================================= */

async function loadRedCardRecords() {

  if (!hasApprovedMemberAccess()) {

    showAccessDeniedMessage();

    return;
  }


  if (!redCardTableBody) {
    return;
  }


  redCardTableBody.innerHTML = `
    <tr>
      <td colspan="100%">
        Loading Red Card records...
      </td>
    </tr>
  `;


  try {

    let query =
      supabaseClient
        .from("red_card_records")
        .select(
          "id, member_id, member_name, year_level, section, offense, description, card_level, status, incident_date, recorded_by, created_at"
        )
        .order(
          "incident_date",
          {
            ascending: false
          }
        );


    const selectedYear =
      redCardYear?.value?.trim() || "";


    if (selectedYear) {

      query =
        query.eq(
          "year_level",
          selectedYear
        );
    }


    const {
      data,
      error
    } =
      await query;


    if (error) {
      throw error;
    }


    const records =
      Array.isArray(data)
        ? data
        : [];


    if (!records.length) {

      redCardTableBody.innerHTML = `
        <tr>
          <td colspan="100%">
            No Red Card records found.
          </td>
        </tr>
      `;

      return;
    }


    redCardTableBody.innerHTML =
      records.map(
        (record) => `

          <tr>

            <td>
              ${escapeHTML(
                record.member_name || "—"
              )}
            </td>

            <td>
              ${escapeHTML(
                record.year_level || "—"
              )}
            </td>

            <td>
              ${escapeHTML(
                record.section || "—"
              )}
            </td>

            <td>
              ${escapeHTML(
                record.offense || "—"
              )}
            </td>

            <td>
              ${escapeHTML(
                record.description || "—"
              )}
            </td>

            <td>
              ${escapeHTML(
                record.card_level || "—"
              )}
            </td>

            <td>
              ${escapeHTML(
                record.status || "—"
              )}
            </td>

            <td>
              ${escapeHTML(
                formatDate(
                  record.incident_date
                )
              )}
            </td>

          </tr>
        `
      ).join("");

  } catch (error) {

    console.error(
      "Red Card loading error:",
      error
    );


    redCardTableBody.innerHTML = `
      <tr>
        <td colspan="100%">
          Unable to load Red Card records.
        </td>
      </tr>
    `;


    showToast(
      getSupabaseErrorMessage(
        error,
        "Unable to load Red Card records."
      ),
      "error"
    );
  }
}


/* =========================================================
   MEMBER REVIEWERS
========================================================= */

async function loadMemberReviewers() {

  if (!hasApprovedMemberAccess()) {

    showAccessDeniedMessage();

    return;
  }


  const container =
    document.getElementById(
      "memberReviewersList"
    );


  if (!container) {
    return;
  }


  container.innerHTML = `
    <div class="loading-state">
      Loading member reviewers...
    </div>
  `;


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("reviewer_submissions")
        .select(
          "id, title, subject, year_level, description, file_name, file_path, file_size, file_type, status, created_at"
        )
        .eq(
          "status",
          "approved"
        )
        .order(
          "created_at",
          {
            ascending: false
          }
        );


    if (error) {
      throw error;
    }


    const reviewers =
      Array.isArray(data)
        ? data
        : [];


    if (!reviewers.length) {

      container.innerHTML = `
        <div class="empty-state">
          No approved member reviewers are available yet.
        </div>
      `;

      return;
    }


    container.innerHTML =
      reviewers.map(
        (reviewer) => `

          <div class="reviewer-card">

            <div class="reviewer-card-content">

              <h3>
                ${escapeHTML(
                  reviewer.title || "Untitled Reviewer"
                )}
              </h3>

              <p>
                <strong>Subject:</strong>
                ${escapeHTML(
                  reviewer.subject || "—"
                )}
              </p>

              <p>
                <strong>Year Level:</strong>
                ${escapeHTML(
                  reviewer.year_level || "—"
                )}
              </p>

              ${
                reviewer.description
                  ? `
                    <p>
                      ${escapeHTML(
                        reviewer.description
                      )}
                    </p>
                  `
                  : ""
              }

              ${
                reviewer.file_path
                  ? `
                    <button
                      type="button"
                      class="reviewer-open-btn"
                      data-reviewer-file="${escapeHTML(
                        reviewer.file_path
                      )}"
                    >
                      Open Reviewer
                    </button>
                  `
                  : ""
              }

            </div>

          </div>
        `
      ).join("");

  } catch (error) {

    console.error(
      "Member reviewer loading error:",
      error
    );


    container.innerHTML = `
      <div class="error-state">
        Unable to load member reviewers.
      </div>
    `;


    showToast(
      getSupabaseErrorMessage(
        error,
        "Unable to load member reviewers."
      ),
      "error"
    );
  }
}


/* =========================================================
   OPEN REVIEWER FILE
========================================================= */

async function openReviewerFile(filePath) {

  if (!hasApprovedMemberAccess()) {

    showAccessDeniedMessage();

    return;
  }


  if (!filePath) {

    showToast(
      "Reviewer file is unavailable.",
      "error"
    );

    return;
  }


  try {

    const {
      data,
      error
    } =
      await supabaseClient.storage
        .from("reviewer-files")
        .createSignedUrl(
          filePath,
          60 * 10
        );


    if (error) {
      throw error;
    }


    if (!data?.signedUrl) {

      throw new Error(
        "Unable to create reviewer file URL."
      );
    }


    window.open(
      data.signedUrl,
      "_blank",
      "noopener,noreferrer"
    );

  } catch (error) {

    console.error(
      "Reviewer file error:",
      error
    );


    showToast(
      getSupabaseErrorMessage(
        error,
        "Unable to open reviewer file."
      ),
      "error"
    );
  }
}


/* =========================================================
   REVIEWER UPLOAD
========================================================= */

async function handleReviewerUpload(event) {

  event.preventDefault();


  if (!hasApprovedMemberAccess()) {

    showAccessDeniedMessage();

    return;
  }


  const title =
    getInputValue(
      "reviewerTitle"
    );

  const subject =
    getInputValue(
      "reviewerSubject"
    );

  const yearLevel =
    getInputValue(
      "reviewerYearLevel"
    );

  const description =
    getInputValue(
      "reviewerDescription"
    );

  const fileInput =
    document.getElementById(
      "reviewerFile"
    );

  const message =
    document.getElementById(
      "reviewerUploadMessage"
    );


  const file =
    fileInput?.files?.[0];


  if (
    !title ||
    !subject ||
    !yearLevel ||
    !file
  ) {

    setFormMessage(
      message,
      "Please complete the required fields and select a file.",
      "error"
    );

    return;
  }


  setFormMessage(
    message,
    "Uploading reviewer...",
    "info"
  );


  try {

    const userId =
      currentSession.user.id;


    const safeFileName =
      sanitizeFileName(
        file.name
      );


    const filePath =
      `${userId}/${Date.now()}_${safeFileName}`;


    const {
      error: uploadError
    } =
      await supabaseClient.storage
        .from("reviewer-files")
        .upload(
          filePath,
          file,
          {
            upsert: false
          }
        );


    if (uploadError) {
      throw uploadError;
    }


    const {
      error: insertError
    } =
      await supabaseClient
        .from("reviewer_submissions")
        .insert({
          user_id: userId,
          title,
          subject,
          year_level: yearLevel,
          description,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
          status: "pending"
        });


    if (insertError) {

      /*
        If database insertion fails after storage upload,
        attempt to remove the uploaded file.
      */

      try {

        await supabaseClient.storage
          .from("reviewer-files")
          .remove([
            filePath
          ]);

      } catch (cleanupError) {

        console.warn(
          "Unable to remove orphaned reviewer file:",
          cleanupError
        );
      }


      throw insertError;
    }


    setFormMessage(
      message,
      "Reviewer submitted successfully and is now pending verification.",
      "success"
    );


    if (fileInput) {
      fileInput.value = "";
    }


    showToast(
      "Reviewer submitted for verification.",
      "success"
    );


    await loadMyReviewerSubmissions();

  } catch (error) {

    console.error(
      "Reviewer upload error:",
      error
    );


    setFormMessage(
      message,
      getSupabaseErrorMessage(
        error,
        "Unable to upload reviewer."
      ),
      "error"
    );
  }
}


/* =========================================================
   LOAD MY REVIEWER SUBMISSIONS
========================================================= */

async function loadMyReviewerSubmissions() {

  if (!hasApprovedMemberAccess()) {
    return;
  }


  const container =
    document.getElementById(
      "myReviewerSubmissions"
    );


  if (!container) {
    return;
  }


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("reviewer_submissions")
        .select(
          "id, title, subject, year_level, description, file_name, file_path, file_size, file_type, status, rejection_reason, created_at, reviewed_at"
        )
        .eq(
          "user_id",
          currentSession.user.id
        )
        .order(
          "created_at",
          {
            ascending: false
          }
        );


    if (error) {
      throw error;
    }


    const submissions =
      Array.isArray(data)
        ? data
        : [];


    if (!submissions.length) {

      container.innerHTML = `
        <div class="empty-state">
          You have not submitted any reviewers yet.
        </div>
      `;

      return;
    }


    container.innerHTML =
      submissions.map(
        (submission) => `

          <div class="submission-card">

            <h4>
              ${escapeHTML(
                submission.title || "Untitled Reviewer"
              )}
            </h4>

            <p>
              ${escapeHTML(
                submission.subject || "—"
              )}
            </p>

            <span class="submission-status">
              ${escapeHTML(
                submission.status || "pending"
              )}
            </span>

            ${
              submission.rejection_reason
                ? `
                  <p>
                    <strong>Reason:</strong>
                    ${escapeHTML(
                      submission.rejection_reason
                    )}
                  </p>
                `
                : ""
            }

          </div>
        `
      ).join("");

  } catch (error) {

    console.error(
      "My reviewer submissions error:",
      error
    );


    container.innerHTML = `
      <div class="error-state">
        Unable to load your submissions.
      </div>
    `;
  }
}


/* =========================================================
   REVIEWER VERIFICATION
========================================================= */

async function loadReviewerVerificationSubmissions() {

  if (!isOfficerOrAdmin()) {

    showToast(
      "Officer or Admin access is required.",
      "error"
    );

    return;
  }


  const container =
    document.getElementById(
      "reviewerVerificationList"
    );


  if (!container) {
    return;
  }


  container.innerHTML = `
    <div class="loading-state">
      Loading reviewer submissions...
    </div>
  `;


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("reviewer_submissions")
        .select(
          "id, user_id, title, subject, year_level, description, file_name, file_path, file_size, file_type, status, rejection_reason, created_at, reviewed_at, reviewed_by"
        )
        .order(
          "created_at",
          {
            ascending: false
          }
        );


    if (error) {
      throw error;
    }


    const submissions =
      Array.isArray(data)
        ? data
        : [];


    if (!submissions.length) {

      container.innerHTML = `
        <div class="empty-state">
          No reviewer submissions found.
        </div>
      `;

      return;
    }


    container.innerHTML =
      submissions.map(
        (submission) => {

          const status =
            String(
              submission.status || "pending"
            ).toLowerCase();


          return `

            <div class="verification-card">

              <div class="verification-card-content">

                <h3>
                  ${escapeHTML(
                    submission.title ||
                    "Untitled Reviewer"
                  )}
                </h3>

                <p>
                  <strong>Subject:</strong>
                  ${escapeHTML(
                    submission.subject || "—"
                  )}
                </p>

                <p>
                  <strong>Year Level:</strong>
                  ${escapeHTML(
                    submission.year_level || "—"
                  )}
                </p>

                <p>
                  <strong>File:</strong>
                  ${escapeHTML(
                    submission.file_name || "—"
                  )}
                </p>

                <p>
                  <strong>Status:</strong>
                  ${escapeHTML(status)}
                </p>

                ${
                  submission.description
                    ? `
                      <p>
                        ${escapeHTML(
                          submission.description
                        )}
                      </p>
                    `
                    : ""
                }

                ${
                  submission.file_path
                    ? `
                      <button
                        type="button"
                        data-reviewer-file="${escapeHTML(
                          submission.file_path
                        )}"
                      >
                        View File
                      </button>
                    `
                    : ""
                }

                ${
                  status === "pending"
                    ? `
                      <div class="verification-actions">

                        <button
                          type="button"
                          data-reviewer-verification-action="approve"
                          data-submission-id="${escapeHTML(
                            submission.id
                          )}"
                        >
                          Approve
                        </button>

                        <button
                          type="button"
                          data-reviewer-verification-action="reject"
                          data-submission-id="${escapeHTML(
                            submission.id
                          )}"
                        >
                          Reject
                        </button>

                      </div>
                    `
                    : ""
                }

              </div>

            </div>
          `;
        }
      ).join("");

  } catch (error) {

    console.error(
      "Reviewer verification loading error:",
      error
    );


    container.innerHTML = `
      <div class="error-state">
        Unable to load reviewer submissions.
      </div>
    `;


    showToast(
      getSupabaseErrorMessage(
        error,
        "Unable to load reviewer submissions."
      ),
      "error"
    );
  }
}


/* =========================================================
   REVIEWER VERIFICATION ACTION
========================================================= */

async function handleReviewerVerificationAction(
  action,
  submissionId
) {

  if (!isOfficerOrAdmin()) {

    showToast(
      "Officer or Admin access is required.",
      "error"
    );

    return;
  }


  if (!submissionId) {
    return;
  }


  const normalizedAction =
    String(action)
      .trim()
      .toLowerCase();


  if (
    normalizedAction !== "approve" &&
    normalizedAction !== "reject"
  ) {
    return;
  }


  let rejectionReason = null;


  if (normalizedAction === "reject") {

    rejectionReason =
      window.prompt(
        "Enter the reason for rejecting this reviewer:"
      );


    if (
      rejectionReason === null
    ) {
      return;
    }


    rejectionReason =
      rejectionReason.trim();


    if (!rejectionReason) {

      showToast(
        "A rejection reason is required.",
        "warning"
      );

      return;
    }
  }


  const newStatus =
    normalizedAction === "approve"
      ? "approved"
      : "rejected";


  try {

    const {
      error
    } =
      await supabaseClient
        .from("reviewer_submissions")
        .update({
          status: newStatus,
          rejection_reason:
            rejectionReason,
          reviewed_by:
            currentSession.user.id,
          reviewed_at:
            new Date().toISOString()
        })
        .eq(
          "id",
          submissionId
        );


    if (error) {
      throw error;
    }


    showToast(
      normalizedAction === "approve"
        ? "Reviewer approved."
        : "Reviewer rejected.",
      "success"
    );


    await loadReviewerVerificationSubmissions();

  } catch (error) {

    console.error(
      "Reviewer verification action error:",
      error
    );


    showToast(
      getSupabaseErrorMessage(
        error,
        "Unable to update reviewer submission."
      ),
      "error"
    );
  }
}


/* =========================================================
   REVIEWER UPLOAD FORM LISTENER
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const reviewerUploadForm =
      document.getElementById(
        "reviewerUploadForm"
      );


    if (reviewerUploadForm) {

      reviewerUploadForm.addEventListener(
        "submit",
        handleReviewerUpload
      );
    }
  }
);


/* =========================================================
   TOAST
========================================================= */

function showToast(
  message,
  type = "info"
) {

  if (!toast) {
    return;
  }


  if (toastTimeout) {

    clearTimeout(
      toastTimeout
    );
  }


  toast.textContent =
    message;


  toast.className =
    "toast";


  toast.classList.add(
    type
  );


  toast.classList.add(
    "show"
  );


  toastTimeout =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      4000
    );
}


/* =========================================================
   FORM MESSAGE
========================================================= */

function setFormMessage(
  element,
  message,
  type = "info"
) {

  if (!element) {
    return;
  }


  element.textContent =
    message;


  element.className =
    "form-message";


  element.classList.add(
    type
  );
}


/* =========================================================
   INPUT HELPER
========================================================= */

function getInputValue(id) {

  const element =
    document.getElementById(id);


  return element
    ? String(
        element.value || ""
      ).trim()
    : "";
}


/* =========================================================
   SUPABASE ERROR MESSAGE
========================================================= */

function getSupabaseErrorMessage(
  error,
  fallback
) {

  if (!error) {
    return fallback;
  }


  const message =
    String(
      error.message || ""
    ).trim();


  if (!message) {
    return fallback;
  }


  /*
    Common user-friendly messages.
  */

  const lower =
    message.toLowerCase();


  if (
    lower.includes(
      "invalid login credentials"
    )
  ) {

    return "Incorrect email or password.";
  }


  if (
    lower.includes(
      "email not confirmed"
    )
  ) {

    return "Please confirm your email before logging in.";
  }


  if (
    lower.includes(
      "user already registered"
    )
  ) {

    return "An account with this email already exists.";
  }


  return message;
}


/* =========================================================
   CURRENCY
========================================================= */

function formatCurrency(
  amount
) {

  const number =
    Number(amount) || 0;


  return new Intl.NumberFormat(
    "en-PH",
    {
      style: "currency",
      currency: "PHP"
    }
  ).format(number);
}


/* =========================================================
   DATE
========================================================= */

function formatDate(
  value
) {

  if (!value) {
    return "—";
  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return String(value);
  }


  return date.toLocaleDateString(
    "en-PH",
    {
      year: "numeric",
      month: "short",
      day: "numeric"
    }
  );
}


/* =========================================================
   FILE NAME SANITIZER
========================================================= */

function sanitizeFileName(
  fileName
) {

  return String(
    fileName || "file"
  )
    .replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    );
}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(
  value
) {

  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }


  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
}


/* =========================================================
   REVEAL ANIMATIONS
========================================================= */

function initializeRevealAnimations() {

  const revealElements =
    document.querySelectorAll(
      ".reveal, [data-reveal]"
    );


  if (!revealElements.length) {
    return;
  }


  /*
    Use IntersectionObserver when available.
    If unavailable, simply show the elements.
  */

  if (
    !("IntersectionObserver" in window)
  ) {

    revealElements.forEach(
      (element) => {
        element.classList.add(
          "visible"
        );
      }
    );

    return;
  }


  const observer =
    new IntersectionObserver(
      (entries) => {

        entries.forEach(
          (entry) => {

            if (
              entry.isIntersecting
            ) {

              entry.target.classList.add(
                "visible"
              );

              observer.unobserve(
                entry.target
              );
            }

          }
        );

      },
      {
        threshold: 0.08
      }
    );


  revealElements.forEach(
    (element) => {

      observer.observe(
        element
      );
    }
  );
}


/* =========================================================
   MATH BACKGROUND INTERACTION
========================================================= */

(function initializeMathBackground() {

  function startMathBackground() {

    const container =
      document.querySelector(
        ".math-background"
      );


    if (!container) {
      return;
    }


    /*
      Prevent duplicate initialization.
    */

    if (
      container.dataset.initialized === "true"
    ) {
      return;
    }


    container.dataset.initialized =
      "true";


    const symbols = [
      "∑",
      "π",
      "∞",
      "√",
      "∫",
      "x²",
      "f(x)",
      "Δ",
      "θ",
      "∂",
      "∇",
      "≈",
      "≠",
      "≤",
      "≥"
    ];


    const fragment =
      document.createDocumentFragment();


    for (
      let i = 0;
      i < 24;
      i++
    ) {

      const element =
        document.createElement(
          "span"
        );


      element.className =
        "math-symbol";


      element.textContent =
        symbols[
          Math.floor(
            Math.random() *
            symbols.length
          )
        ];


      element.style.left =
        `${Math.random() * 100}%`;


      element.style.top =
        `${Math.random() * 100}%`;


      element.style.animationDelay =
        `${Math.random() * 6}s`;


      element.style.animationDuration =
        `${8 + Math.random() * 10}s`;


      fragment.appendChild(
        element
      );
    }


    container.appendChild(
      fragment
    );
  }


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      startMathBackground
    );

  } else {

    startMathBackground();
  }

})();


/* =========================================================
   DEBUG HELPERS
   ---------------------------------------------------------
   These do not control security.
   They simply make development easier.
========================================================= */

window.SIATP = {

  getSession() {
    return currentSession;
  },


  getMember() {
    return currentMember;
  },


  getRole() {
    return getCurrentRole();
  },


  isAuthenticated() {
    return isAuthenticated();
  },


  hasMemberAccess() {
    return hasApprovedMemberAccess();
  },


  isOfficerOrAdmin() {
    return isOfficerOrAdmin();
  }

};


/* =========================================================
   END OF SCRIPT
========================================================= */
