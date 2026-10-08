/* =========================================================
   SME INTEGRATED ACADEMIC & TRANSPARENCY PLATFORM
   MAIN JAVASCRIPT
   SUPABASE AUTHENTICATION VERSION

   ACCESS LEVELS
   ---------------------------------------------------------
   PUBLIC
      - Video Lessons
      - Public Reviewers

   PENDING
      - Authenticated applicant
      - Cannot access member features

   MEMBER
      - Approved SME member

   OFFICER
      - Approved SME officer

   ADMIN
      - Administrator

   IMPORTANT
   ---------------------------------------------------------
   Frontend checks improve UX.
   Supabase RLS must enforce actual security.
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
   PUBLIC REVIEWERS
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


/* =========================================================
   VIDEO LESSONS
========================================================= */

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

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    cacheDOM();

    initializeRevealAnimations();

    renderPublicReviewers();
    renderVideoLessons();

    setupEventListeners();

    await restoreMemberSession();

    updateNavigation();
    updateMemberDashboard();

  }
);


/* =========================================================
   CACHE DOM
========================================================= */

function cacheDOM() {

  overlay =
    document.getElementById(
      "windowOverlay"
    );

  toast =
    document.getElementById(
      "toast"
    );

  navAuthArea =
    document.getElementById(
      "navAuthArea"
    );


  /*
    IMPORTANT:
    These IDs match the HTML you just sent.
  */

  loginForm =
    document.getElementById(
      "loginForm"
    );

  signupForm =
    document.getElementById(
      "memberSignupForm"
    );


  memberName =
    document.getElementById(
      "memberName"
    );


  redCardYear =
    document.getElementById(
      "redCardYear"
    );

  redCardTableBody =
    document.getElementById(
      "redCardTableBody"
    );
}


/* =========================================================
   EVENT LISTENERS
========================================================= */

function setupEventListeners() {

  /* -------------------------------------------------------
     ALL DATA-ACTION BUTTONS
  ------------------------------------------------------- */

  document.addEventListener(
    "click",
    async (event) => {

      const actionElement =
        event.target.closest(
          "[data-action]"
        );


      if (actionElement) {

        event.preventDefault();


        const action =
          actionElement.getAttribute(
            "data-action"
          );


        if (action) {

          await handleAction(
            action
          );

          return;
        }
      }


      /* ---------------------------------------------------
         MEMBER FEATURES
      --------------------------------------------------- */

      const featureElement =
        event.target.closest(
          "[data-member-feature]"
        );


      if (featureElement) {

        event.preventDefault();


        const feature =
          featureElement.getAttribute(
            "data-member-feature"
          );


        if (feature) {

          await openMemberFeature(
            feature
          );

          return;
        }
      }


      /* ---------------------------------------------------
         REVIEWER FILE
      --------------------------------------------------- */

      const reviewerFileButton =
        event.target.closest(
          "[data-reviewer-file]"
        );


      if (reviewerFileButton) {

        event.preventDefault();


        const filePath =
          reviewerFileButton.getAttribute(
            "data-reviewer-file"
          );


        if (filePath) {

          await openReviewerFile(
            filePath
          );
        }

        return;
      }


      /* ---------------------------------------------------
         REVIEWER VERIFICATION
      --------------------------------------------------- */

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


        if (
          action &&
          submissionId
        ) {

          await handleReviewerVerificationAction(
            action,
            submissionId
          );
        }

        return;
      }

    }
  );


  /* -------------------------------------------------------
     LOGIN
  ------------------------------------------------------- */

  if (loginForm) {

    loginForm.addEventListener(
      "submit",
      handleLogin
    );
  }


  /* -------------------------------------------------------
     SIGNUP
  ------------------------------------------------------- */

  if (signupForm) {

    signupForm.addEventListener(
      "submit",
      handleMemberSignup
    );
  }


  /* -------------------------------------------------------
     REVIEWER UPLOAD
  ------------------------------------------------------- */

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


  /* -------------------------------------------------------
     RED CARD FILTER
  ------------------------------------------------------- */

  if (redCardYear) {

    redCardYear.addEventListener(
      "change",
      async () => {

        if (
          hasApprovedMemberAccess()
        ) {

          await loadRedCardRecords();
        }

      }
    );
  }


  /* -------------------------------------------------------
     OVERLAY
  ------------------------------------------------------- */

  if (overlay) {

    overlay.addEventListener(
      "click",
      (event) => {

        if (
          event.target === overlay
        ) {

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

      if (
        event.key === "Escape"
      ) {

        closeAllWindows();
      }

    }
  );
}


/* =========================================================
   ACTION HANDLER
========================================================= */

async function handleAction(
  action
) {

  switch (action) {

    case "member-login":

      openWindow(
        "login"
      );

      break;


    case "member-signup":

      openWindow(
        "memberSignup"
      );

      break;


    case "public-lessons":

      openWindow(
        "videoLessons"
      );

      break;


    case "public-reviewers":

      openWindow(
        "publicReviewers"
      );

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
   AUTHENTICATION HELPERS
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

  return (
    getCurrentRole() ===
    "pending"
  );
}


/* =========================================================
   ACCESS DENIED
========================================================= */

function showAccessDeniedMessage() {

  if (
    isPendingApplicant()
  ) {

    showToast(
      "Your SME membership application is still pending assessment.",
      "info"
    );

    return;
  }


  if (
    !isAuthenticated()
  ) {

    showToast(
      "Please log in with an approved SME member account.",
      "warning"
    );

    openWindow(
      "login"
    );

    return;
  }


  showToast(
    "You do not have permission to access this feature.",
    "error"
  );
}


/* =========================================================
   MEMBER FEATURE
========================================================= */

async function openMemberFeature(
  feature
) {

  /* -------------------------------------------------------
     OFFICER / ADMIN FEATURE
  ------------------------------------------------------- */

  if (
    feature ===
    "reviewer-verification"
  ) {

    if (
      !isOfficerOrAdmin()
    ) {

      showToast(
        "Officer or Admin access is required.",
        "error"
      );

      return;
    }


    openWindow(
      "reviewerVerification"
    );


    await loadReviewerVerificationSubmissions();

    return;
  }


  /* -------------------------------------------------------
     NORMAL MEMBER FEATURES
  ------------------------------------------------------- */

  if (
    !hasApprovedMemberAccess()
  ) {

    showAccessDeniedMessage();

    return;
  }


  switch (feature) {

    case "dashboard":

      openWindow(
        "memberDashboard"
      );

      break;


    case "finance":

      openWindow(
        "finance"
      );

      await loadFinanceRecords();

      break;


    case "red-card":

      openWindow(
        "redCard"
      );

      await loadRedCardRecords();

      break;


    case "member-reviewers":

      openWindow(
        "memberReviewers"
      );

      await loadMemberReviewers();

      break;


    case "announcements":

      openWindow(
        "announcements"
      );

      break;


    case "upload-reviewer":

      openWindow(
        "uploadReviewer"
      );

      await loadMyReviewerSubmissions();

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

function openWindow(
  windowName
) {

  /* -------------------------------------------------------
     MAP JAVASCRIPT NAMES TO ACTUAL HTML IDS
  ------------------------------------------------------- */

  const windowMap = {

    login:
      "loginWindow",

    memberSignup:
      "memberSignupWindow",

    videoLessons:
      "videoLessonsWindow",

    publicReviewers:
      "publicReviewersWindow",

    memberDashboard:
      "memberDashboardWindow",

    finance:
      "financeWindow",

    redCard:
      "redCardWindow",

    memberReviewers:
      "memberReviewersWindow",

    announcements:
      "announcementsWindow",

    uploadReviewer:
      "uploadReviewerWindow",

    reviewerVerification:
      "reviewerVerificationWindow"

  };


  const protectedWindows = [

    "memberDashboard",
    "finance",
    "redCard",
    "memberReviewers",
    "announcements",
    "uploadReviewer"

  ];


  if (
    protectedWindows.includes(
      windowName
    ) &&
    !hasApprovedMemberAccess()
  ) {

    showAccessDeniedMessage();

    return;
  }


  if (
    windowName ===
    "reviewerVerification" &&
    !isOfficerOrAdmin()
  ) {

    showToast(
      "Officer or Admin access is required.",
      "error"
    );

    return;
  }


  closeAllWindows();


  const elementId =
    windowMap[
      windowName
    ];


  if (!elementId) {

    console.warn(
      "Unknown window:",
      windowName
    );

    return;
  }


  const windowElement =
    document.getElementById(
      elementId
    );


  if (!windowElement) {

    console.error(
      "Window element not found:",
      elementId
    );

    return;
  }


  windowElement.classList.add(
    "active"
  );


  if (overlay) {

    overlay.classList.add(
      "active"
    );

    overlay.setAttribute(
      "aria-hidden",
      "false"
    );
  }


  document.body.classList.add(
    "modal-open"
  );
}


function closeAllWindows() {

  const windows =
    document.querySelectorAll(
      ".site-window"
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

    overlay.setAttribute(
      "aria-hidden",
      "true"
    );
  }


  document.body.classList.remove(
    "modal-open"
  );
}


/* =========================================================
   LOGIN
========================================================= */

async function handleLogin(
  event
) {

  event.preventDefault();


  /*
    MATCHES YOUR HTML:
    memberEmail
    memberPassword
  */

  const emailInput =
    document.getElementById(
      "memberEmail"
    );


  const passwordInput =
    document.getElementById(
      "memberPassword"
    );


  const message =
    document.getElementById(
      "loginMessage"
    );


  const email =
    emailInput?.value.trim() ||
    "";


  const password =
    passwordInput?.value ||
    "";


  if (
    !email ||
    !password
  ) {

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


    if (
      !data?.session
    ) {

      throw new Error(
        "Login succeeded, but no session was returned."
      );
    }


    await applyAuthSession(
      data.session
    );


    const role =
      getCurrentRole();


    if (
      role ===
      "pending"
    ) {

      setFormMessage(
        message,
        "Login successful. Your membership application is still pending assessment.",
        "warning"
      );


      showToast(
        "Your application is pending assessment.",
        "info"
      );

    }

    else if (
      [
        "member",
        "officer",
        "admin"
      ].includes(role)
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

    }

    else {

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

  }

  catch (error) {

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
   SIGNUP
========================================================= */

async function handleMemberSignup(
  event
) {

  event.preventDefault();


  const firstName =
    getInputValue(
      "signupFirstName"
    );


  const middleName =
    getInputValue(
      "signupMiddleName"
    );


  const lastName =
    getInputValue(
      "signupLastName"
    );


  const yearLevel =
    getInputValue(
      "signupYearLevel"
    );


  const section =
    getInputValue(
      "signupSection"
    );


  const email =
    getInputValue(
      "signupEmail"
    );


  const password =
    document.getElementById(
      "signupPassword"
    )?.value ||
    "";


  const confirmPassword =
    document.getElementById(
      "signupConfirmPassword"
    )?.value ||
    "";


  const message =
    document.getElementById(
      "signupMessage"
    );


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


  if (
    password.length <
    6
  ) {

    setFormMessage(
      message,
      "Password must contain at least 6 characters.",
      "error"
    );

    return;
  }


  if (
    password !==
    confirmPassword
  ) {

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

            first_name:
              firstName,

            middle_name:
              middleName,

            last_name:
              lastName,

            year_level:
              yearLevel,

            section:
              section

          }

        }

      });


    if (error) {

      throw error;
    }


    /*
      If email confirmation is enabled,
      Supabase may return a user without
      a session.
    */

    if (
      data?.session
    ) {

      await applyAuthSession(
        data.session
      );


      setFormMessage(
        message,
        "Application submitted successfully. Your account is pending SME assessment.",
        "success"
      );

    }

    else {

      setFormMessage(
        message,
        "Application submitted successfully. Please check your email if confirmation is required. Your SME membership is still pending assessment.",
        "success"
      );
    }


    const passwordElement =
      document.getElementById(
        "signupPassword"
      );


    const confirmPasswordElement =
      document.getElementById(
        "signupConfirmPassword"
      );


    if (
      passwordElement
    ) {

      passwordElement.value =
        "";
    }


    if (
      confirmPasswordElement
    ) {

      confirmPasswordElement.value =
        "";
    }


    showToast(
      "Membership application submitted.",
      "success"
    );


    updateNavigation();
    updateMemberDashboard();

  }

  catch (error) {

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
   SESSION RESTORE
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


    if (
      data?.session
    ) {

      await applyAuthSession(
        data.session
      );

    }

    else {

      clearAuthState();
    }

  }

  catch (error) {

    console.error(
      "Session restoration error:",
      error
    );


    clearAuthState();
  }


  if (
    !authInitialized
  ) {

    authInitialized =
      true;


    supabaseClient.auth.onAuthStateChange(
      (event, session) => {

        setTimeout(
          async () => {

            try {

              await applyAuthSession(
                session
              );


              updateNavigation();
              updateMemberDashboard();

            }

            catch (error) {

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

async function applyAuthSession(
  session
) {

  if (
    !session ||
    !session.user
  ) {

    clearAuthState();

    return;
  }


  currentSession =
    session;


  currentMember =
    null;


  loadedProfileUserId =
    null;


  await loadCurrentMemberProfile();


  updateNavigation();
  updateMemberDashboard();
}


/* =========================================================
   LOAD PROFILE
========================================================= */

async function loadCurrentMemberProfile() {

  if (
    !currentSession?.user?.id
  ) {

    currentMember =
      null;

    return;
  }


  const userId =
    currentSession.user.id;


  if (
    profileLoading &&
    loadedProfileUserId ===
      userId
  ) {

    return;
  }


  profileLoading =
    true;


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
        .eq(
          "id",
          userId
        )
        .maybeSingle();


    if (error) {

      throw error;
    }


    /*
      FAIL CLOSED

      Never automatically turn an authenticated
      user into a member.
    */

    if (!data) {

      currentMember = {

        id:
          userId,

        name:
          currentSession.user
            .user_metadata
            ?.first_name ||
          currentSession.user.email ||
          "User",

        email:
          currentSession.user.email ||
          "",

        role:
          "pending",

        year_level:
          "",

        section:
          ""

      };

    }

    else {

      currentMember = {

        id:
          data.id,

        name:
          data.full_name ||
          currentSession.user
            .user_metadata
            ?.first_name ||
          data.email ||
          currentSession.user.email ||
          "Member",

        email:
          data.email ||
          currentSession.user.email ||
          "",

        role:
          String(
            data.role ||
            "pending"
          ).toLowerCase(),

        year_level:
          data.year_level ||
          "",

        section:
          data.section ||
          ""

      };
    }


    loadedProfileUserId =
      userId;

  }

  catch (error) {

    console.error(
      "Profile loading error:",
      error
    );


    /*
      FAIL CLOSED
    */

    currentMember = {

      id:
        userId,

      name:
        currentSession.user.email ||
        "User",

      email:
        currentSession.user.email ||
        "",

      role:
        "pending",

      year_level:
        "",

      section:
        ""

    };

  }

  finally {

    profileLoading =
      false;
  }
}


/* =========================================================
   CLEAR AUTH
========================================================= */

function clearAuthState() {

  currentSession =
    null;

  currentMember =
    null;

  loadedProfileUserId =
    null;

  profileLoading =
    false;
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

  }

  catch (error) {

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


  if (
    !isAuthenticated()
  ) {

    navAuthArea.innerHTML = `

      <button
        class="nav-button"
        type="button"
        data-action="member-login"
      >

        🔐 Member Login

      </button>

    `;

    return;
  }


  const fullName =
    currentMember?.name ||
    currentSession?.user?.email ||
    "Member";


  const firstName =
    String(
      fullName
    )
      .trim()
      .split(/\s+/)[0] ||
    "Member";


  const role =
    getCurrentRole();


  let roleLabel =
    "";


  if (
    role ===
    "pending"
  ) {

    roleLabel =
      "Pending";

  }

  else if (
    role ===
    "officer"
  ) {

    roleLabel =
      "Officer";

  }

  else if (
    role ===
    "admin"
  ) {

    roleLabel =
      "Admin";

  }

  else if (
    role ===
    "member"
  ) {

    roleLabel =
      "Member";
  }


  navAuthArea.innerHTML = `

    <button
      class="nav-button"
      type="button"
      data-member-feature="dashboard"
    >

      👤 ${escapeHTML(
        firstName
      )}

    </button>


    ${
      roleLabel
        ? `
          <span
            class="nav-role-label"
          >
            ${escapeHTML(
              roleLabel
            )}
          </span>
        `
        : ""
    }


    <button
      class="nav-button"
      type="button"
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


  if (
    !isAuthenticated()
  ) {

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


  if (
    role ===
    "member"
  ) {

    roleText =
      "SME Member";
  }


  if (
    role ===
    "officer"
  ) {

    roleText =
      "SME Officer";
  }


  if (
    role ===
    "admin"
  ) {

    roleText =
      "Administrator";
  }


  memberName.textContent =
    `${name} — ${roleText}`;
}


/* =========================================================
   PUBLIC REVIEWERS
========================================================= */

function renderPublicReviewers() {

  /*
    MATCHES YOUR HTML:
    publicReviewerList
  */

  const container =
    document.getElementById(
      "publicReviewerList"
    );


  if (!container) {

    return;
  }


  container.innerHTML =
    PUBLIC_REVIEWERS.map(
      (reviewer) => `

        <article
          class="detail-card"
        >

          <h4>
            ${escapeHTML(
              reviewer.title
            )}
          </h4>

          <p>
            ${escapeHTML(
              reviewer.description
            )}
          </p>

        </article>

      `
    ).join("");
}


/* =========================================================
   VIDEO LESSONS
========================================================= */

function renderVideoLessons() {

  /*
    MATCHES YOUR HTML:
    videoLessonList
  */

  const container =
    document.getElementById(
      "videoLessonList"
    );


  if (!container) {

    return;
  }


  container.innerHTML =
    VIDEO_LESSONS.map(
      (lesson) => `

        <article
          class="detail-card"
        >

          <h4>
            🎥 ${escapeHTML(
              lesson.title
            )}
          </h4>

          <p>
            ${escapeHTML(
              lesson.description
            )}
          </p>

        </article>

      `
    ).join("");
}


/* =========================================================
   FINANCE
========================================================= */

async function loadFinanceRecords() {

  if (
    !hasApprovedMemberAccess()
  ) {

    showAccessDeniedMessage();

    return;
  }


  /*
    Your HTML does NOT currently have
    financeTableBody / totalIncome / totalExpenses.

    It has:
    #financeRecords
    #financeTransactionList
  */

  const recordContainer =
    document.getElementById(
      "financeRecords"
    );


  const transactionContainer =
    document.getElementById(
      "financeTransactionList"
    );


  if (
    transactionContainer
  ) {

    transactionContainer.innerHTML = `
      <article>
        <strong>
          Loading financial records...
        </strong>
      </article>
    `;
  }


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from(
          "finance_records"
        )
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


    let income =
      0;

    let expenses =
      0;


    records.forEach(
      (record) => {

        const amount =
          Number(
            record.amount
          ) || 0;


        const type =
          String(
            record.transaction_type ||
            ""
          ).toLowerCase();


        if (
          type === "income" ||
          type === "credit" ||
          type === "deposit"
        ) {

          income += amount;

        }

        else {

          expenses += amount;
        }

      }
    );


    const balance =
      income -
      expenses;


    if (
      recordContainer
    ) {

      recordContainer.innerHTML = `

        <div class="record-line">

          <span>
            Total Income
          </span>

          <strong>
            ${formatCurrency(
              income
            )}
          </strong>

        </div>


        <div class="record-line">

          <span>
            Total Expenses
          </span>

          <strong>
            ${formatCurrency(
              expenses
            )}
          </strong>

        </div>


        <div class="record-line">

          <span>
            Current Balance
          </span>

          <strong>
            ${formatCurrency(
              balance
            )}
          </strong>

        </div>

      `;
    }


    if (
      !transactionContainer
    ) {

      return;
    }


    if (
      !records.length
    ) {

      transactionContainer.innerHTML = `

        <article>

          <strong>
            No financial records found.
          </strong>

          <span>
            There are currently no transactions available.
          </span>

        </article>

      `;

      return;
    }


    transactionContainer.innerHTML =
      records.map(
        (record) => `

          <article>

            <strong>

              ${escapeHTML(
                record.description ||
                record.category ||
                "Transaction"
              )}

            </strong>


            <span>

              ${escapeHTML(
                formatDate(
                  record.transaction_date
                )
              )}

              ·

              ${escapeHTML(
                record.transaction_type ||
                "Transaction"
              )}

              ·

              ${formatCurrency(
                Number(
                  record.amount
                ) || 0
              )}

            </span>

          </article>

        `
      ).join("");

  }

  catch (error) {

    console.error(
      "Finance loading error:",
      error
    );


    if (
      recordContainer
    ) {

      recordContainer.innerHTML = `

        <div class="record-line">

          <span>
            Finance Records
          </span>

          <strong>
            Unable to load
          </strong>

        </div>

      `;
    }


    if (
      transactionContainer
    ) {

      transactionContainer.innerHTML = `

        <article>

          <strong>
            Unable to load financial records.
          </strong>

          <span>
            Please try again later.
          </span>

        </article>

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
   RED CARD
========================================================= */

async function loadRedCardRecords() {

  if (
    !hasApprovedMemberAccess()
  ) {

    showAccessDeniedMessage();

    return;
  }


  if (
    !redCardTableBody
  ) {

    return;
  }


  redCardTableBody.innerHTML = `

    <tr>

      <td colspan="7">
        Loading Red Card records...
      </td>

    </tr>

  `;


  try {

    let query =
      supabaseClient
        .from(
          "red_card_records"
        )
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
      redCardYear?.value ||
      "";


    /*
      "all" means no filter.
    */

    if (
      selectedYear &&
      selectedYear !==
        "all"
    ) {

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


    if (
      !records.length
    ) {

      redCardTableBody.innerHTML = `

        <tr>

          <td colspan="7">
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
                record.member_name ||
                "—"
              )}
            </td>

            <td>
              ${escapeHTML(
                record.year_level ||
                "—"
              )}
            </td>

            <td>
              ${escapeHTML(
                record.section ||
                "—"
              )}
            </td>

            <td>
              ${escapeHTML(
                record.offense ||
                record.description ||
                "—"
              )}
            </td>

            <td>
              ${escapeHTML(
                record.card_level ||
                "—"
              )}
            </td>

            <td>
              ${escapeHTML(
                record.status ||
                "—"
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

  }

  catch (error) {

    console.error(
      "Red Card loading error:",
      error
    );


    redCardTableBody.innerHTML = `

      <tr>

        <td colspan="7">
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

  if (
    !hasApprovedMemberAccess()
  ) {

    showAccessDeniedMessage();

    return;
  }


  /*
    MATCHES YOUR HTML:
    memberReviewerList
  */

  const container =
    document.getElementById(
      "memberReviewerList"
    );


  if (!container) {

    return;
  }


  container.innerHTML = `

    <article>

      <strong>
        Loading member reviewers...
      </strong>

    </article>

  `;


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from(
          "reviewer_submissions"
        )
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


    if (
      !reviewers.length
    ) {

      container.innerHTML = `

        <article>

          <strong>
            No approved member reviewers yet.
          </strong>

          <span>
            Approved reviewers will appear here.
          </span>

        </article>

      `;

      return;
    }


    container.innerHTML =
      reviewers.map(
        (reviewer) => `

          <article>

            <strong>

              ${escapeHTML(
                reviewer.title ||
                "Untitled Reviewer"
              )}

            </strong>


            <span>

              Subject:
              ${escapeHTML(
                reviewer.subject ||
                "—"
              )}

              <br>

              Year Level:
              ${escapeHTML(
                reviewer.year_level ||
                "—"
              )}

            </span>


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
                    class="primary-button"
                    data-reviewer-file="${escapeHTML(
                      reviewer.file_path
                    )}"
                  >
                    📖 Open Reviewer
                  </button>
                `
                : ""
            }

          </article>

        `
      ).join("");

  }

  catch (error) {

    console.error(
      "Member reviewer loading error:",
      error
    );


    container.innerHTML = `

      <article>

        <strong>
          Unable to load member reviewers.
        </strong>

      </article>

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

async function openReviewerFile(
  filePath
) {

  if (
    !hasApprovedMemberAccess()
  ) {

    showAccessDeniedMessage();

    return;
  }


  try {

    const {
      data,
      error
    } =
      await supabaseClient.storage
        .from(
          "reviewer-files"
        )
        .createSignedUrl(
          filePath,
          60 * 10
        );


    if (error) {

      throw error;
    }


    if (
      !data?.signedUrl
    ) {

      throw new Error(
        "Unable to create reviewer file URL."
      );
    }


    window.open(
      data.signedUrl,
      "_blank",
      "noopener,noreferrer"
    );

  }

  catch (error) {

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

async function handleReviewerUpload(
  event
) {

  event.preventDefault();


  if (
    !hasApprovedMemberAccess()
  ) {

    showAccessDeniedMessage();

    return;
  }


  const title =
    getInputValue(
      "reviewerTitle"
    );


  const description =
    getInputValue(
      "reviewerDescription"
    );


  const subject =
    getInputValue(
      "reviewerSubject"
    );


  const yearLevel =
    getInputValue(
      "reviewerYearLevel"
    );


  const fileInput =
    document.getElementById(
      "reviewerFile"
    );


  /*
    MATCHES YOUR HTML:
    uploadMessage
  */

  const message =
    document.getElementById(
      "uploadMessage"
    );


  const file =
    fileInput?.files?.[0];


  if (
    !title ||
    !description ||
    !subject ||
    !yearLevel ||
    !file
  ) {

    setFormMessage(
      message,
      "Please complete all required fields and select a file.",
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
      error:
        uploadError
    } =
      await supabaseClient.storage
        .from(
          "reviewer-files"
        )
        .upload(
          filePath,
          file,
          {
            upsert: false
          }
        );


    if (
      uploadError
    ) {

      throw uploadError;
    }


    const {
      error:
        insertError
    } =
      await supabaseClient
        .from(
          "reviewer_submissions"
        )
        .insert({

          user_id:
            userId,

          title:
            title,

          subject:
            subject,

          year_level:
            yearLevel,

          description:
            description,

          file_name:
            file.name,

          file_path:
            filePath,

          file_size:
            file.size,

          file_type:
            file.type,

          status:
            "pending"

        });


    if (
      insertError
    ) {

      try {

        await supabaseClient.storage
          .from(
            "reviewer-files"
          )
          .remove([
            filePath
          ]);

      }

      catch (cleanupError) {

        console.warn(
          "Storage cleanup failed:",
          cleanupError
        );
      }


      throw insertError;
    }


    setFormMessage(
      message,
      "Reviewer submitted successfully. It is now pending verification.",
      "success"
    );


    if (
      fileInput
    ) {

      fileInput.value =
        "";
    }


    showToast(
      "Reviewer submitted for verification.",
      "success"
    );


    await loadMyReviewerSubmissions();

  }

  catch (error) {

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
   MY REVIEWER SUBMISSIONS
========================================================= */

async function loadMyReviewerSubmissions() {

  if (
    !hasApprovedMemberAccess()
  ) {

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
        .from(
          "reviewer_submissions"
        )
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


    if (
      !submissions.length
    ) {

      container.innerHTML = `

        <article>

          <strong>
            No submissions yet.
          </strong>

          <span>
            Your submitted reviewers will appear here.
          </span>

        </article>

      `;

      return;
    }


    container.innerHTML =
      submissions.map(
        (submission) => `

          <article>

            <strong>
              ${escapeHTML(
                submission.title ||
                "Untitled Reviewer"
              )}
            </strong>


            <span>

              ${escapeHTML(
                submission.subject ||
                "—"
              )}

              ·

              ${escapeHTML(
                submission.year_level ||
                "—"
              )}

              <br>

              Status:
              ${escapeHTML(
                submission.status ||
                "pending"
              )}

            </span>


            ${
              submission.rejection_reason
                ? `
                  <p>

                    <strong>
                      Rejection Reason:
                    </strong>

                    ${escapeHTML(
                      submission.rejection_reason
                    )}

                  </p>
                `
                : ""
            }

          </article>

        `
      ).join("");

  }

  catch (error) {

    console.error(
      "Submission loading error:",
      error
    );


    container.innerHTML = `

      <article>

        <strong>
          Unable to load your submissions.
        </strong>

      </article>

    `;
  }
}


/* =========================================================
   REVIEWER VERIFICATION
========================================================= */

async function loadReviewerVerificationSubmissions() {

  if (
    !isOfficerOrAdmin()
  ) {

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

    <article>

      <strong>
        Loading reviewer submissions...
      </strong>

    </article>

  `;


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from(
          "reviewer_submissions"
        )
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


    if (
      !submissions.length
    ) {

      container.innerHTML = `

        <article>

          <strong>
            No reviewer submissions found.
          </strong>

        </article>

      `;

      return;
    }


    container.innerHTML =
      submissions.map(
        (submission) => {

          const status =
            String(
              submission.status ||
              "pending"
            ).toLowerCase();


          return `

            <article>

              <strong>

                ${escapeHTML(
                  submission.title ||
                  "Untitled Reviewer"
                )}

              </strong>


              <span>

                Subject:
                ${escapeHTML(
                  submission.subject ||
                  "—"
                )}

                <br>

                Year Level:
                ${escapeHTML(
                  submission.year_level ||
                  "—"
                )}

                <br>

                File:
                ${escapeHTML(
                  submission.file_name ||
                  "—"
                )}

                <br>

                Status:
                ${escapeHTML(
                  status
                )}

              </span>


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
                      class="primary-button"
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
                status ===
                "pending"
                  ? `

                    <div
                      class="verification-actions"
                      style="
                        display: flex;
                        gap: 10px;
                        margin-top: 14px;
                      "
                    >

                      <button
                        type="button"
                        class="primary-button"
                        data-reviewer-verification-action="approve"
                        data-submission-id="${escapeHTML(
                          submission.id
                        )}"
                      >
                        ✅ Approve
                      </button>


                      <button
                        type="button"
                        class="secondary-button"
                        data-reviewer-verification-action="reject"
                        data-submission-id="${escapeHTML(
                          submission.id
                        )}"
                      >
                        ❌ Reject
                      </button>

                    </div>

                  `
                  : ""
              }

            </article>

          `;
        }
      ).join("");

  }

  catch (error) {

    console.error(
      "Verification loading error:",
      error
    );


    container.innerHTML = `

      <article>

        <strong>
          Unable to load reviewer submissions.
        </strong>

      </article>

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

  if (
    !isOfficerOrAdmin()
  ) {

    showToast(
      "Officer or Admin access is required.",
      "error"
    );

    return;
  }


  const normalizedAction =
    String(
      action
    )
      .trim()
      .toLowerCase();


  if (
    normalizedAction !==
      "approve" &&
    normalizedAction !==
      "reject"
  ) {

    return;
  }


  let rejectionReason =
    null;


  if (
    normalizedAction ===
    "reject"
  ) {

    rejectionReason =
      window.prompt(
        "Enter the reason for rejecting this reviewer:"
      );


    if (
      rejectionReason ===
      null
    ) {

      return;
    }


    rejectionReason =
      rejectionReason.trim();


    if (
      !rejectionReason
    ) {

      showToast(
        "A rejection reason is required.",
        "warning"
      );

      return;
    }
  }


  const newStatus =
    normalizedAction ===
    "approve"
      ? "approved"
      : "rejected";


  try {

    const {
      error
    } =
      await supabaseClient
        .from(
          "reviewer_submissions"
        )
        .update({

          status:
            newStatus,

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
      normalizedAction ===
        "approve"
        ? "Reviewer approved."
        : "Reviewer rejected.",
      "success"
    );


    await loadReviewerVerificationSubmissions();

  }

  catch (error) {

    console.error(
      "Verification action error:",
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
   TOAST
========================================================= */

function showToast(
  message,
  type = "info"
) {

  if (!toast) {

    return;
  }


  if (
    toastTimeout
  ) {

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
   INPUT VALUE
========================================================= */

function getInputValue(
  id
) {

  const element =
    document.getElementById(
      id
    );


  return element
    ? String(
        element.value ||
        ""
      ).trim()
    : "";
}


/* =========================================================
   ERROR MESSAGE
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
      error.message ||
      ""
    ).trim();


  if (!message) {

    return fallback;
  }


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
    Number(
      amount
    ) || 0;


  return new Intl.NumberFormat(
    "en-PH",
    {
      style:
        "currency",

      currency:
        "PHP"
    }
  ).format(
    number
  );
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
    new Date(
      value
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return String(
      value
    );
  }


  return date.toLocaleDateString(
    "en-PH",
    {
      year:
        "numeric",

      month:
        "short",

      day:
        "numeric"
    }
  );
}


/* =========================================================
   FILE NAME
========================================================= */

function sanitizeFileName(
  fileName
) {

  return String(
    fileName ||
    "file"
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


  return String(
    value
  )
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

  const elements =
    document.querySelectorAll(
      ".reveal, [data-reveal]"
    );


  if (
    !elements.length
  ) {

    return;
  }


  if (
    !(
      "IntersectionObserver"
      in window
    )
  ) {

    elements.forEach(
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
        threshold:
          0.08
      }
    );


  elements.forEach(
    (element) => {

      observer.observe(
        element
      );

    }
  );
}


/* =========================================================
   MATH BACKGROUND
========================================================= */

(function initializeMathBackground() {

  function start() {

    const container =
      document.querySelector(
        ".math-background"
      );


    if (!container) {

      return;
    }


    /*
      Your HTML already contains the math symbols.
      Therefore we do NOT generate another set.

      This prevents duplicated symbols.
    */

    container.dataset.initialized =
      "true";
  }


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      start
    );

  }

  else {

    start();
  }

})();


/* =========================================================
   OPTIONAL DEBUG ACCESS
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
