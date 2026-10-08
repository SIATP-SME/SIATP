 /* =========================================================
   SME INTEGRATED ACADEMIC & TRANSPARENCY PLATFORM
   MAIN JAVASCRIPT
   SUPABASE AUTHENTICATION VERSION
========================================================= */


/* =========================================================
   SUPABASE CONFIGURATION
========================================================= */

const SUPABASE_URL =
  "https://ktlgmgbhacxcvbyomgeo.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_fysL0f4fh1t5kUwksnIKFw_SrWXC9Zf";

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
    year: "1st Year",
    title: "General Mathematics",
    description:
      "Basic mathematical concepts and foundational skills."
  },

  {
    year: "2nd Year",
    title: "College Algebra",
    description:
      "Algebraic expressions, equations, functions, and applications."
  },

  {
    year: "3rd Year",
    title: "Geometry",
    description:
      "Geometric concepts, properties, proofs, and problem solving."
  },

  {
    year: "4th Year",
    title: "Advanced Mathematics",
    description:
      "Higher-level mathematical concepts and problem-solving strategies."
  }
];


/* =========================================================
   PUBLIC VIDEO LESSONS
========================================================= */

const VIDEO_LESSONS = [
  {
    title: "Introduction to Algebra",
    description:
      "Learn the basic concepts of variables, expressions, and equations."
  },

  {
    title: "Understanding Functions",
    description:
      "Explore functions, domain, range, and their representations."
  },

  {
    title: "Quadratic Equations",
    description:
      "Learn different methods for solving quadratic equations."
  },

  {
    title: "Problem-Solving Strategies",
    description:
      "Explore strategies that can help students solve mathematical problems."
  }
];


/* =========================================================
   FRONTEND STATE
========================================================= */

let currentMember = null;
let currentSession = null;

let toastTimeout;

let authInitialized = false;
let profileLoading = false;
let loadedProfileUserId = null;


/* =========================================================
   DOM ELEMENTS
========================================================= */

let overlay;
let toast;
let navAuthArea;
let loginForm;
let memberName;
let redCardYear;
let redCardTableBody;


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    console.log(
      "SME Platform initializing..."
    );

    cacheDOM();

    initializeRevealAnimations();

    renderPublicReviewers();

    renderVideoLessons();

    setupEventListeners();

    await restoreMemberSession();

    updateNavigation();

    updateMemberDashboard();

    console.log(
      "SME Platform initialized."
    );

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

  loginForm =
    document.getElementById(
      "loginForm"
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

  document.addEventListener(
    "click",
    (event) => {

      const actionElement =
        event.target.closest(
          "[data-action]"
        );

      const memberElement =
        event.target.closest(
          "[data-member-feature]"
        );


      /* =========================================
         NORMAL ACTION
      ========================================= */

      if (actionElement) {

        const action =
          actionElement.dataset.action;

        handleAction(action);

        return;

      }


      /* =========================================
         MEMBER FEATURE
      ========================================= */

      if (memberElement) {

        const feature =
          memberElement.dataset.memberFeature;

        openMemberFeature(feature);

      }

    }
  );


  /* =========================================
     LOGIN FORM
  ========================================= */

  if (loginForm) {

  loginForm.addEventListener(
    "submit",
    handleLogin
  );

}


/* =========================================
   MEMBER SIGNUP FORM
========================================= */

const memberSignupForm =
  document.getElementById(
    "memberSignupForm"
  );


if (memberSignupForm) {

  memberSignupForm.addEventListener(
    "submit",
    handleMemberSignup
  );

}
  }
  /* =========================================
     RED CARD YEAR
  ========================================= */

 const redCardYear =
  document.getElementById(
    "redCardYear"
  );

if (redCardYear) {

  redCardYear.addEventListener(
    "change",
    () => {

      loadRedCardRecords();

    }
  );

}


  /* =========================================
     REVIEWER UPLOAD FORM
  ========================================= */

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


  /* =========================================
     CLOSE MODAL BY CLICKING OUTSIDE
  ========================================= */

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


  /* =========================================
     ESCAPE KEY
  ========================================= */

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

function handleAction(action) {

  switch (action) {

    case "member-login":

      if (isMemberLoggedIn()) {

        openWindow("dashboard");

      } else {

        openWindow("login");

      }

      break;
        
        case "member-signup":

  openWindow("member-signup");

  break;


    case "public-lessons":

      openWindow("public-lessons");

      break;


    case "public-reviewers":

      openWindow("public-reviewers");

      break;


    case "close-window":

      closeAllWindows();

      break;


    case "logout":

      logoutMember();

      break;


    default:

      console.warn(
        "Unknown action:",
        action
      );

  }

}


/* =========================================================
   MEMBER FEATURE ACCESS
========================================================= */

function openMemberFeature(feature) {

  if (!isMemberLoggedIn()) {

    showToast(
      "🔒 Please log in as an SME Member first."
    );

    openWindow("login");

    return;

  }


  switch (feature) {

    case "dashboard":

      openWindow("dashboard");

      break;


    case "finance":

      openWindow("finance");

      break;


    case "red-card":

      openWindow("red-card");

      break;


    case "member-reviewers":

      openWindow("member-reviewers");

      break;


    case "announcements":

      openWindow("announcements");

      break;


    case "upload-reviewer":

      openWindow("upload-reviewer");

      break;


    default:

      console.warn(
        "Unknown member feature:",
        feature
      );

  }

}


/* =========================================================
   OPEN WINDOW
========================================================= */

function openWindow(windowName) {

  let target =
    document.querySelector(
      `[data-window="${windowName}"]`
    );


  if (!target) {

    console.warn(
      `Window "${windowName}" not found.`
    );

    return;

  }


  const protectedWindows = [

    "dashboard",
    "finance",
    "red-card",
    "member-reviewers",
    "announcements",
    "upload-reviewer"

  ];


  if (
    protectedWindows.includes(
      windowName
    ) &&
    !isMemberLoggedIn()
  ) {

    showToast(
      "🔒 This section requires SME Member access."
    );


    target =
      document.querySelector(
        '[data-window="login"]'
      );


    if (!target) {

      return;

    }


    windowName = "login";

  }


  closeAllWindows(false);


  target.classList.add(
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
    "no-scroll"
  );


  if (
    windowName === "dashboard"
  ) {

    updateMemberDashboard();

  }


  if (
    windowName === "red-card"
  ) {

    renderRedCardRecords();

  }


  if (
    windowName === "member-reviewers"
  ) {

    loadMemberReviewers();

  }


  if (
    windowName === "finance"
  ) {

    loadFinanceRecords();

  }


  if (
    windowName === "upload-reviewer"
  ) {

    loadMyReviewerSubmissions();

  }

}


/* =========================================================
   CLOSE WINDOWS
========================================================= */

function closeAllWindows(
  hideOverlay = true
) {

  document
    .querySelectorAll(
      ".site-window"
    )
    .forEach(
      (windowElement) => {

        windowElement.classList.remove(
          "active"
        );

      }
    );


  if (
    hideOverlay &&
    overlay
  ) {

    overlay.classList.remove(
      "active"
    );

    overlay.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.classList.remove(
      "no-scroll"
    );

  }

}


/* =========================================================
   LOGIN
========================================================= */

async function handleLogin(event) {

  event.preventDefault();


  const emailInput =
    document.getElementById(
      "memberEmail"
    );

  const passwordInput =
    document.getElementById(
      "memberPassword"
    );

  const loginMessage =
    document.getElementById(
      "loginMessage"
    );


  const email =
    emailInput
      ? emailInput.value.trim()
      : "";

  const password =
    passwordInput
      ? passwordInput.value
      : "";


  if (!email || !password) {

    if (loginMessage) {

      loginMessage.textContent =
        "Please enter your email and password.";

    }

    return;

  }


  if (loginMessage) {

    loginMessage.textContent =
      "Signing in...";

  }


  const {
    data,
    error
  } =
    await supabaseClient.auth.signInWithPassword({

      email,
      password

    });


if (error) {

  console.error(
    "Supabase login error:",
    error
  );


  if (loginMessage) {

    loginMessage.textContent =
      `${error.name || "Auth Error"}: ${error.message}`;

  }


  showToast(
    `❌ ${error.message}`
  );

  return;

}


  /*
     signInWithPassword() triggers the
     auth-state listener automatically.

     Do not load the profile manually here.
  */

  if (loginMessage) {

    loginMessage.textContent =
      "";

  }


  closeAllWindows();


  showToast(
    "✅ Welcome to the SME Member Hub."
  );

}


/* =========================================================
   RESTORE MEMBER SESSION
========================================================= */

async function restoreMemberSession() {

  const {
    data,
    error
  } =
    await supabaseClient.auth.getSession();


  if (error) {

    console.error(
      "Session restoration error:",
      error
    );

    return;

  }


  /*
     Apply the current session.

     Profile loading is handled by
     applyAuthSession().
  */

  await applyAuthSession(
    data.session,
    true
  );

}


/* =========================================================
   APPLY AUTH SESSION
========================================================= */

async function applyAuthSession(
  session,
  isInitialSession = false
) {

  currentSession =
    session || null;


  if (
    !session ||
    !session.user
  ) {

    currentMember = null;

    loadedProfileUserId = null;

    updateNavigation();

    updateMemberDashboard();

    return;

  }


  currentMember =
    session.user;


  /*
     Load the profile only when this user
     has not already been loaded.
  */

  if (
    loadedProfileUserId !==
    currentMember.id
  ) {

    await loadCurrentMemberProfile();

  }


  authInitialized = true;


  updateNavigation();

  updateMemberDashboard();

}


/* =========================================================
   LOAD CURRENT MEMBER PROFILE
========================================================= */

async function loadCurrentMemberProfile() {

  if (!currentMember) {

    return;

  }


  const userId =
    currentMember.id;


  /*
     Prevent duplicate profile requests.
  */

  if (
    loadedProfileUserId === userId
  ) {

    return;

  }


  /*
     Prevent simultaneous profile requests.
  */

  if (profileLoading) {

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
        .eq(
          "id",
          userId
        )
        .single();


    if (error) {

      console.error(
        "Profile loading error:",
        error
      );

      showToast(
        "⚠️ Unable to load your SME profile."
      );

      return;

    }


    /*
       Make sure the session has not changed
       while the profile was loading.
    */

    if (
      !currentMember ||
      currentMember.id !== userId
    ) {

      return;

    }


    currentMember.profile =
      data;


    currentMember.name =
      data.full_name ||
      data.email ||
      currentMember.email ||
      "SME Member";


    currentMember.role =
      data.role ||
      "member";


    currentMember.year_level =
      data.year_level ||
      "";


    currentMember.section =
      data.section ||
      "";


    loadedProfileUserId =
      userId;


  } finally {

    profileLoading = false;

  }

}


/* =========================================================
   CHECK LOGIN
========================================================= */

function isMemberLoggedIn() {

  return Boolean(
    currentSession &&
    currentSession.user
  );

}


/* =========================================================
   LOGOUT
========================================================= */

async function logoutMember() {

  const {
    error
  } =
    await supabaseClient.auth.signOut();


  if (error) {

    console.error(
      "Logout error:",
      error
    );

    showToast(
      "❌ Unable to log out. Please try again."
    );

    return;

  }


  currentSession = null;

  currentMember = null;

  loadedProfileUserId = null;

  authInitialized = false;


  updateNavigation();

  updateMemberDashboard();

  closeAllWindows();


  showToast(
    "👋 You have been logged out."
  );

}


/* =========================================================
   AUTH STATE LISTENER
========================================================= */

supabaseClient.auth.onAuthStateChange(
  (
    event,
    session
  ) => {

    console.log(
      "Auth state changed:",
      event
    );


    /*
       Supabase recommends avoiding additional
       Supabase requests directly inside the
       auth-state callback.

       Process the session after the callback.
    */

    setTimeout(
      async () => {

        /*
           The initial session is already handled
           by restoreMemberSession().

           Once initialization is complete,
           we do not need to process INITIAL_SESSION
           again.
        */

        if (
          event === "INITIAL_SESSION" &&
          authInitialized
        ) {

          return;

        }


        await applyAuthSession(
          session
        );

      },
      0
    );

  }
);


/* =========================================================
   NAVIGATION
========================================================= */

function updateNavigation() {
  if (!navAuthArea) {
    return;
  }

  if (isMemberLoggedIn()) {
    const fullName =
      currentMember?.name ||
      currentMember?.profile?.full_name ||
      currentMember?.email ||
      "SME Member";

    // Get first name only
    const firstName =
      String(fullName)
        .trim()
        .split(/\s+/)[0] || "Member";

    navAuthArea.innerHTML = `
      <button
        class="nav-button"
        type="button"
        data-action="member-login"
      >
        👤 ${escapeHTML(firstName)}
      </button>

      <button
        class="nav-button"
        type="button"
        data-action="logout"
      >
        Logout
      </button>
    `;

    return;
  }

  navAuthArea.innerHTML = `
    <button
      class="nav-button"
      type="button"
      data-action="member-login"
    >
      🔐 Member Login
    </button>
  `;
}


/* =========================================================
   DASHBOARD
========================================================= */

function updateMemberDashboard() {

  if (!memberName) {

    return;

  }


  if (
    !isMemberLoggedIn() ||
    !currentMember
  ) {

    memberName.textContent =
      "Unauthorized";

    return;

  }


  const name =
    currentMember.name ||
    currentMember.email ||
    "SME Member";


  const role =
    currentMember.role ||
    "member";


  memberName.textContent =
    `${name} — ${role}`;

}


/* =========================================================
   PUBLIC REVIEWERS
========================================================= */

function renderPublicReviewers() {

  const container =
    document.getElementById(
      "publicReviewerList"
    );


  if (!container) {

    return;

  }


  container.innerHTML =
    PUBLIC_REVIEWERS
      .map(
        (reviewer) => `

          <article class="folder-card">

            <span>
              ${escapeHTML(
                reviewer.year
              )}
            </span>

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
      )
      .join("");

}


/* =========================================================
   VIDEO LESSONS
========================================================= */

function renderVideoLessons() {

  const container =
    document.getElementById(
      "videoLessonList"
    );


  if (!container) {

    return;

  }


  container.innerHTML =
    VIDEO_LESSONS
      .map(
        (lesson, index) => `

          <article>

            <strong>
              🎥 ${index + 1}.
              ${escapeHTML(
                lesson.title
              )}
            </strong>

            <span>
              ${escapeHTML(
                lesson.description
              )}
            </span>

          </article>

        `
      )
      .join("");

}


/* =========================================================
   FINANCE
========================================================= */

/* =========================================================
   FINANCE
========================================================= */

async function loadFinanceRecords() {

  const recordContainer =
    document.getElementById(
      "financeRecords"
    );

  const transactionContainer =
    document.getElementById(
      "financeTransactionList"
    );


  if (!recordContainer) {

    return;

  }


  /*
     Security check

     The frontend only requests finance data
     when a user is authenticated.

     Supabase RLS provides the actual protection.
  */

  if (!isMemberLoggedIn()) {

    recordContainer.innerHTML = `
      <div class="record-line">
        <span>Finance Records</span>
        <strong>Unauthorized</strong>
      </div>
    `;

    if (transactionContainer) {

      transactionContainer.innerHTML = `
        <article>
          <strong>🔒 Member access required.</strong>
          <span>
            Please log in to view SME financial records.
          </span>
        </article>
      `;

    }

    return;

  }


  /*
     Loading state
  */

  recordContainer.innerHTML = `
    <div class="record-line">
      <span>Finance Records</span>
      <strong>Loading...</strong>
    </div>
  `;


  if (transactionContainer) {

    transactionContainer.innerHTML = `
      <article>
        <strong>Loading finance records...</strong>
        <span>
          Please wait while the latest records are retrieved.
        </span>
      </article>
    `;

  }


  /*
     Get finance records from Supabase
  */

  const {
    data,
    error
  } =
    await supabaseClient
      .from("finance_records")
      .select(`
        id,
        transaction_date,
        transaction_type,
        category,
        description,
        amount,
        reference,
        recorded_by,
        created_at
      `)
      .order(
        "transaction_date",
        {
          ascending: false
        }
      )
      .order(
        "id",
        {
          ascending: false
        }
      );


  /*
     Handle database error
  */

  if (error) {

    console.error(
      "Finance loading error:",
      error
    );


    recordContainer.innerHTML = `
      <div class="record-line">
        <span>Finance Records</span>
        <strong>Unable to load</strong>
      </div>
    `;


    if (transactionContainer) {

      transactionContainer.innerHTML = `
        <article>
          <strong>⚠️ Finance records could not be loaded.</strong>
          <span>
            Please try again later.
          </span>
        </article>
      `;

    }


    showToast(
      "⚠️ Unable to load finance records."
    );

    return;

  }


  /*
     Make sure we always have an array.
  */

  const records =
    Array.isArray(data)
      ? data
      : [];


  /*
     Calculate totals
  */

  let totalIncome = 0;
  let totalExpense = 0;


  records.forEach(
    (record) => {

      const amount =
        Number(
          record.amount
        ) || 0;


      if (
        record.transaction_type ===
        "income"
      ) {

        totalIncome += amount;

      }


      if (
        record.transaction_type ===
        "expense"
      ) {

        totalExpense += amount;

      }

    }
  );


  const balance =
    totalIncome -
    totalExpense;


  /*
     Display summary
  */

  recordContainer.innerHTML = `

    <div class="record-line">

      <span>
        Total Income
      </span>

      <strong>
        ₱${formatCurrency(totalIncome)}
      </strong>

    </div>


    <div class="record-line">

      <span>
        Total Expenses
      </span>

      <strong>
        ₱${formatCurrency(totalExpense)}
      </strong>

    </div>


    <div class="record-line">

      <span>
        Current Balance
      </span>

      <strong>
        ₱${formatCurrency(balance)}
      </strong>

    </div>

  `;


  /*
     No transactions
  */

  if (
    records.length === 0
  ) {

    if (transactionContainer) {

      transactionContainer.innerHTML = `
        <article>
          <strong>No finance records yet.</strong>
          <span>
            Finance transactions will appear here
            once they are recorded.
          </span>
        </article>
      `;

    }

    return;

  }


  /*
     Display transaction list
  */

  if (transactionContainer) {

    transactionContainer.innerHTML =
      records
        .map(
          (record) => {

            const amount =
              Number(
                record.amount
              ) || 0;


            const type =
              record.transaction_type;


            const amountDisplay =
              type === "income"
                ? `+₱${formatCurrency(amount)}`
                : `-₱${formatCurrency(amount)}`;


            const date =
              formatFinanceDate(
                record.transaction_date
              );


            const description =
              record.description ||
              "No description";


            const reference =
              record.reference ||
              "No reference";


            return `

              <article class="finance-transaction">

                <div>

                  <strong>
                    ${escapeHTML(
                      record.category
                    )}
                  </strong>

                  <span>
                    ${escapeHTML(
                      description
                    )}
                  </span>

                </div>


                <div>

                  <strong>
                    ${amountDisplay}
                  </strong>

                  <span>
                    ${escapeHTML(
                      date
                    )}
                  </span>

                  <span>
                    ${escapeHTML(
                      reference
                    )}
                  </span>

                </div>

              </article>

            `;

          }
        )
        .join("");

  }

}


/* =========================================================
   FINANCE CURRENCY FORMAT
========================================================= */

function formatCurrency(
  amount
) {

  return Number(
    amount || 0
  ).toLocaleString(
    "en-PH",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  );

}


/* =========================================================
   FINANCE DATE FORMAT
========================================================= */

function formatFinanceDate(
  date
) {

  if (!date) {

    return "No date";

  }


  const parsedDate =
    new Date(
      `${date}T00:00:00`
    );


  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {

    return date;

  }


  return parsedDate.toLocaleDateString(
    "en-PH",
    {
      year: "numeric",
      month: "short",
      day: "numeric"
    }
  );

}

/* =========================================================
   RED CARD RECORDS
========================================================= */

/* =========================================================
   RED CARD TRACKER
========================================================= */

async function loadRedCardRecords() {

  const tableBody =
    document.getElementById(
      "redCardTableBody"
    );

  const yearFilter =
    document.getElementById(
      "redCardYear"
    );


  if (!tableBody) {

    return;

  }


  /*
     Only authenticated members can access
     Red Card information.
  */

  if (!isMemberLoggedIn()) {

    tableBody.innerHTML = `
      <tr>
        <td colspan="7">
          🔒 Member access required.
        </td>
      </tr>
    `;

    return;

  }


  /*
     Loading state
  */

  tableBody.innerHTML = `
    <tr>
      <td colspan="7">
        Loading Red Card records...
      </td>
    </tr>
  `;


  /*
     Build the Supabase query.

     RLS decides what the current user
     is actually allowed to see.
  */

  let query =
    supabaseClient
      .from("red_card_records")
      .select(`
        id,
        member_id,
        member_name,
        year_level,
        section,
        offense,
        description,
        card_level,
        status,
        incident_date,
        recorded_by,
        created_at
      `)
      .order(
        "incident_date",
        {
          ascending: false
        }
      )
      .order(
        "id",
        {
          ascending: false
        }
      );


  /*
     Optional year-level filter
  */

  const selectedYear =
    yearFilter
      ? yearFilter.value
      : "";


  if (
    selectedYear &&
    selectedYear !== "all"
  ) {

    query =
      query.eq(
        "year_level",
        selectedYear
      );

  }


  /*
     Execute query
  */

  const {
    data,
    error
  } =
    await query;


  /*
     Handle database error
  */

  if (error) {

    console.error(
      "Red Card loading error:",
      error
    );


    tableBody.innerHTML = `
      <tr>
        <td colspan="7">
          ⚠️ Unable to load Red Card records.
        </td>
      </tr>
    `;


    showToast(
      "⚠️ Unable to load Red Card records."
    );

    return;

  }


  const records =
    Array.isArray(data)
      ? data
      : [];


  /*
     No records
  */

  if (
    records.length === 0
  ) {

    tableBody.innerHTML = `
      <tr>
        <td colspan="7">
          No Red Card records found.
        </td>
      </tr>
    `;

    return;

  }


  /*
     Render records
  */

  tableBody.innerHTML =
    records
      .map(
        (record) => {

          const statusClass =
            record.status === "resolved"
              ? "resolved"
              : "active";


          const cardLevel =
            Number(
              record.card_level
            ) || 1;


          return `

            <tr>

              <td>
                ${escapeHTML(
                  record.member_name
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
                  record.offense
                )}
              </td>

              <td>
                Red Card ${cardLevel}
              </td>

              <td>
                <span
                  class="red-card-status ${statusClass}"
                >
                  ${escapeHTML(
                    record.status
                  )}
                </span>
              </td>

              <td>
                ${formatRedCardDate(
                  record.incident_date
                )}
              </td>

            </tr>

          `;

        }
      )
      .join("");

}


/* =========================================================
   RED CARD DATE FORMAT
========================================================= */

function formatRedCardDate(
  date
) {

  if (!date) {

    return "—";

  }


  const parsedDate =
    new Date(
      `${date}T00:00:00`
    );


  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {

    return escapeHTML(
      date
    );

  }


  return parsedDate.toLocaleDateString(
    "en-PH",
    {
      year: "numeric",
      month: "short",
      day: "numeric"
    }
  );

}

/* =========================================================
   MEMBER REVIEWERS
========================================================= */

async function loadMemberReviewers() {
  const list = document.getElementById("memberReviewerList");

  if (!list) return;

  list.innerHTML = `
    <div class="empty-state">
      <p>Loading reviewers...</p>
    </div>
  `;

  if (!isMemberLoggedIn()) {
    list.innerHTML = `
      <div class="empty-state">
        <p>🔒 Please log in to access SME Member Reviewers.</p>
      </div>
    `;
    return;
  }

  try {
    const { data: reviewers, error } = await supabaseClient
      .from("reviewer_submissions")
      .select(`
        id,
        title,
        subject,
        year_level,
        description,
        file_name,
        file_path,
        file_size,
        file_type,
        status,
        created_at
      `)
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    if (!reviewers || reviewers.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <p>No approved member reviewers are available yet.</p>
        </div>
      `;
      return;
    }

    list.innerHTML = reviewers
      .map((reviewer) => {
        const submittedDate = reviewer.created_at
          ? new Date(reviewer.created_at).toLocaleDateString(
              "en-US",
              {
                year: "numeric",
                month: "short",
                day: "numeric"
              }
            )
          : "Unknown date";

        return `
          <div class="reviewer-card">
            <div class="reviewer-card-header">
              <div>
                <h3>${escapeHTML(reviewer.title)}</h3>

                <p>
                  ${escapeHTML(reviewer.subject)}
                  •
                  ${escapeHTML(reviewer.year_level)}
                </p>
              </div>

              <span class="status-badge approved">
                Approved
              </span>
            </div>

            ${
              reviewer.description
                ? `
                  <p class="reviewer-description">
                    ${escapeHTML(reviewer.description)}
                  </p>
                `
                : ""
            }

            <div
              style="
                display:flex;
                align-items:center;
                justify-content:space-between;
                gap:12px;
                flex-wrap:wrap;
              "
            >
              <span>
                File:
                ${escapeHTML(reviewer.file_name)}
              </span>

              <span>
                Submitted:
                ${submittedDate}
              </span>
            </div>

            <button
              type="button"
              class="primary-button"
              data-reviewer-file-id="${reviewer.id}"
              data-reviewer-file-path="${escapeHTML(
                reviewer.file_path
              )}"
              style="margin-top:10px;"
            >
              📖 Open Reviewer
            </button>
          </div>
        `;
      })
      .join("");

  } catch (error) {
    console.error("Failed to load member reviewers:", error);

    list.innerHTML = `
      <div class="empty-state">
        <p>
          ⚠️ Unable to load reviewers.
          Please try again later.
        </p>
      </div>
    `;
  }
}
/* =========================================================
   OPEN APPROVED MEMBER REVIEWER
========================================================= */

document.addEventListener("click", async function (event) {

  const button = event.target.closest(
    "[data-reviewer-file-id]"
  );

  if (!button) return;


  if (!isMemberLoggedIn()) {

    showToast(
      "🔒 Member access required."
    );

    return;
  }


  const filePath =
    button.dataset.reviewerFilePath;


  if (!filePath) {

    showToast(
      "⚠️ Reviewer file path is missing."
    );

    return;
  }


  button.disabled = true;
  button.textContent = "Opening...";


  try {

    const { data, error } =
      await supabaseClient.storage
        .from("reviewer-files")
        .createSignedUrl(
          filePath,
          60 * 10
        );


    if (error) {

      console.error(
        "Reviewer signed URL error:",
        error
      );

      throw error;

    }


    if (!data?.signedUrl) {

      throw new Error(
        "Unable to generate reviewer access link."
      );

    }


    window.open(
      data.signedUrl,
      "_blank",
      "noopener,noreferrer"
    );


  } catch (error) {

    console.error(
      "Failed to open reviewer:",
      error
    );


    showToast(
      "⚠️ Unable to open reviewer file."
    );


  } finally {

    button.disabled = false;
    button.textContent = "📖 Open Reviewer";

  }

});

/* =========================================================
   REVIEWER UPLOAD
========================================================= */

async function handleReviewerUpload(event) {
  event.preventDefault();

  const titleInput = document.getElementById("reviewerTitle");
  const subjectInput = document.getElementById("reviewerSubject");
  const yearLevelInput = document.getElementById("reviewerYearLevel");
  const descriptionInput = document.getElementById("reviewerDescription");
  const fileInput = document.getElementById("reviewerFile");
  const uploadMessage = document.getElementById("uploadMessage");

  if (!isMemberLoggedIn()) {
    if (uploadMessage) {
      uploadMessage.textContent =
        "🔒 Please log in as an SME member first.";
    }

    showToast("🔒 Member access required.");
    return;
  }

  const title = titleInput ? titleInput.value.trim() : "";
  const subject = subjectInput ? subjectInput.value.trim() : "";
  const yearLevel = yearLevelInput ? yearLevelInput.value.trim() : "";
  const description = descriptionInput
    ? descriptionInput.value.trim()
    : "";
  const file = fileInput?.files?.[0];

  if (!title || !subject || !yearLevel || !file) {
    if (uploadMessage) {
      uploadMessage.textContent =
        "Please complete the required fields and select a file.";
    }

    return;
  }

  if (uploadMessage) {
    uploadMessage.textContent =
      "Uploading reviewer...";
  }

  try {
    const user = currentSession?.user;

    if (!user) {
      throw new Error("No authenticated member session found.");
    }

    const safeFileName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, "_");

    const filePath =
      `${user.id}/${Date.now()}_${safeFileName}`;

    const { error: uploadError } =
      await supabaseClient.storage
        .from("reviewer-files")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false
        });

    if (uploadError) {
      console.error(
        "Reviewer file upload error:",
        uploadError
      );

      throw uploadError;
    }

    const { data: submission, error: insertError } =
      await supabaseClient
        .from("reviewer_submissions")
        .insert({
          user_id: user.id,
          title,
          subject,
          year_level: yearLevel,
          description: description || null,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type || null,
          status: "pending"
        })
        .select()
        .single();

    if (insertError) {
      console.error(
        "Reviewer submission database error:",
        insertError
      );

      // Remove uploaded file if database insertion fails.
      await supabaseClient.storage
        .from("reviewer-files")
        .remove([filePath]);

      throw insertError;
    }

    console.log(
      "Reviewer submission created:",
      submission
    );

    if (uploadMessage) {
      uploadMessage.textContent =
        "✅ Reviewer uploaded successfully and is pending approval.";
    }

    showToast(
      "✅ Reviewer submitted for approval."
    );

    event.target.reset();

    if (typeof loadMyReviewerSubmissions === "function") {
      await loadMyReviewerSubmissions();
    }

  } catch (error) {
    console.error(
      "Reviewer upload failed:",
      error
    );

    if (uploadMessage) {
      uploadMessage.textContent =
        `⚠️ Upload failed: ${error.message}`;
    }

    showToast(
      "⚠️ Reviewer upload failed."
    );
  }
}


/* =========================================================
   MY REVIEWER SUBMISSIONS
========================================================= */

async function loadMyReviewerSubmissions() {
  const container =
    document.getElementById("myReviewerSubmissions");

  if (!container) return;

  if (!isMemberLoggedIn()) {
    container.innerHTML = `
      <article>
        <strong>🔒 Member access required</strong>
        <span>
          Please log in to view your reviewer submissions.
        </span>
      </article>
    `;
    return;
  }

  container.innerHTML = `
    <article>
      <strong>Loading submissions...</strong>
      <span>
        Please wait while your reviewer submissions are loaded.
      </span>
    </article>
  `;

  try {
    const user = currentSession?.user;

    if (!user) {
      throw new Error("No authenticated member session found.");
    }

    const { data, error } =
      await supabaseClient
        .from("reviewer_submissions")
        .select(`
          id,
          title,
          subject,
          year_level,
          description,
          file_name,
          file_size,
          file_type,
          status,
          rejection_reason,
          created_at,
          reviewed_at
        `)
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false
        });

    if (error) {
      console.error(
        "Reviewer submissions loading error:",
        error
      );

      throw error;
    }

    const submissions = Array.isArray(data)
      ? data
      : [];

    if (submissions.length === 0) {
      container.innerHTML = `
        <article>
          <strong>No submissions yet</strong>
          <span>
            Your submitted reviewers will appear here.
          </span>
        </article>
      `;

      return;
    }

    container.innerHTML =
      submissions.map(submission => {

        const status = submission.status || "pending";

        const statusLabel =
          status === "approved"
            ? "Approved"
            : status === "rejected"
              ? "Rejected"
              : "Pending Verification";

        const statusClass =
          status === "approved"
            ? "approved"
            : status === "rejected"
              ? "rejected"
              : "pending";

        const rejectionText =
          status === "rejected" &&
          submission.rejection_reason
            ? `
              <small>
                Reason: ${escapeHTML(
                  submission.rejection_reason
                )}
              </small>
            `
            : "";

        return `
          <article>
            <strong>
              ${escapeHTML(submission.title)}
            </strong>

            <span>
              ${escapeHTML(submission.subject)}
              •
              ${escapeHTML(submission.year_level)}
            </span>

            <span>
              File:
              ${escapeHTML(submission.file_name)}
            </span>

            <span class="reviewer-status ${statusClass}">
              ${statusLabel}
            </span>

            ${rejectionText}

            <small>
              Submitted:
              ${formatReviewerDate(
                submission.created_at
              )}
            </small>
          </article>
        `;

      }).join("");

  } catch (error) {
    console.error(
      "Failed to load reviewer submissions:",
      error
    );

    container.innerHTML = `
      <article>
        <strong>⚠️ Unable to load submissions</strong>
        <span>
          Please try again later.
        </span>
      </article>
    `;

    showToast(
      "⚠️ Unable to load reviewer submissions."
    );
  }
}


function formatReviewerDate(date) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return escapeHTML(String(date));
  }

  return parsedDate.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

  if (!toast) {

    return;

  }


  toast.textContent =
    message;


  toast.classList.add(
    "show"
  );


  clearTimeout(
    toastTimeout
  );


  toastTimeout =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      3000
    );

}


/* =========================================================
   REVEAL ANIMATIONS
========================================================= */

function initializeRevealAnimations() {

  const revealElements =
    document.querySelectorAll(
      ".reveal"
    );


  /*
     IMPORTANT:
     If animation fails for any reason,
     the content must remain visible.
  */

  if (
    !(
      "IntersectionObserver"
      in window
    )
  ) {

    revealElements.forEach(
      (element) => {

        element.classList.add(
          "active"
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
                "active"
              );

              observer.unobserve(
                entry.target
              );

            }

          }
        );

      },
      {
        threshold: 0.05
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
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

  return String(
    value ?? ""
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
   REVIEWER VERIFICATION ACCESS
========================================================= */

document.addEventListener("click", function (event) {

  const button = event.target.closest(
    '[data-member-feature="reviewer-verification"]'
  );

  if (!button) return;

  event.preventDefault();

  // Must be logged in first
  if (!isMemberLoggedIn()) {
    showToast("🔒 Officer/Admin access required.");
    return;
  }

  // Check the logged-in user's role
  const role =
    currentMember?.role ||
    currentSession?.user?.user_metadata?.role ||
    "";

  const normalizedRole = String(role).toLowerCase();

  // Only Officer and Admin may access verification
  if (
    normalizedRole !== "officer" &&
    normalizedRole !== "admin"
  ) {
    showToast(
      "⛔ Reviewer Verification is restricted to Officers and Admins."
    );

    return;
  }

  // Close any currently open window
  closeAllWindows();

  // Open Reviewer Verification
  const verificationWindow =
    document.getElementById(
      "reviewerVerificationWindow"
    );

  if (!verificationWindow) {
    console.error(
      "Reviewer Verification window was not found."
    );

    showToast(
      "⚠️ Reviewer Verification window not found."
    );

    return;
  }

  const overlay =
    document.getElementById("windowOverlay");

  if (overlay) {
    overlay.classList.add("active");
    overlay.setAttribute("aria-hidden", "false");
  }

  verificationWindow.classList.add("active");

  // Load pending reviewer submissions
  if (
    typeof loadReviewerVerificationSubmissions ===
    "function"
  ) {
    loadReviewerVerificationSubmissions();
  }

});
/* =========================================================
   REVIEWER VERIFICATION — LOAD SUBMISSIONS
========================================================= */

async function loadReviewerVerificationSubmissions() {

  const container =
    document.getElementById(
      "reviewerVerificationList"
    );

  if (!container) return;


  if (!isMemberLoggedIn()) {

    container.innerHTML = `
      <article>

        <strong>
          🔒 Access Required
        </strong>

        <span>
          Please log in as an SME Officer or Admin.
        </span>

      </article>
    `;

    return;
  }


  const role =
    currentMember?.role ||
    currentSession?.user?.user_metadata?.role ||
    "";

  const normalizedRole =
    String(role).toLowerCase();


  if (
    normalizedRole !== "officer" &&
    normalizedRole !== "admin"
  ) {

    container.innerHTML = `
      <article>

        <strong>
          ⛔ Unauthorized
        </strong>

        <span>
          Reviewer verification is restricted to Officers
          and Admins.
        </span>

      </article>
    `;

    return;
  }


  container.innerHTML = `
    <div
      style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:12px;
        margin-bottom:16px;
      "
    >

      <div>

        <strong>
          Reviewer Submissions
        </strong>

        <span style="display:block;">
          Review submitted member reviewers.
        </span>

      </div>


      <button
        type="button"
        class="secondary-button"
        id="refreshReviewerVerification"
      >
        🔄 Refresh
      </button>

    </div>


    <article>

      <strong>
        Loading submissions...
      </strong>

      <span>
        Please wait while reviewer submissions are loaded.
      </span>

    </article>
  `;


  const refreshButton =
    document.getElementById(
      "refreshReviewerVerification"
    );


  if (refreshButton) {

    refreshButton.addEventListener(
      "click",
      function () {

        loadReviewerVerificationSubmissions();

      }
    );

  }


  try {

    const { data, error } =
      await supabaseClient
        .from("reviewer_submissions")
        .select(`
          id,
          user_id,
          title,
          subject,
          year_level,
          description,
          file_name,
          file_size,
          file_type,
          status,
          rejection_reason,
          created_at,
          reviewed_at
        `)
        .order("created_at", {
          ascending: false
        });


    if (error) {

      console.error(
        "Reviewer verification loading error:",
        error
      );

      throw error;

    }


    const submissions =
      Array.isArray(data)
        ? data
        : [];


    const header = `
      <div
        style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:12px;
          margin-bottom:16px;
        "
      >

        <div>

          <strong>
            Reviewer Submissions
          </strong>

          <span style="display:block;">
            ${submissions.length}
            submission${submissions.length === 1 ? "" : "s"}
          </span>

        </div>


        <button
          type="button"
          class="secondary-button"
          id="refreshReviewerVerification"
        >
          🔄 Refresh
        </button>

      </div>
    `;


    if (submissions.length === 0) {

      container.innerHTML = `
        ${header}

        <article>

          <strong>
            No reviewer submissions
          </strong>

          <span>
            There are currently no reviewer submissions
            to verify.
          </span>

        </article>
      `;

      attachReviewerVerificationRefresh();

      return;
    }


    container.innerHTML =
      header +

      submissions.map(submission => {

        const status =
          submission.status || "pending";


        const statusLabel =
          status === "approved"
            ? "Approved"
            : status === "rejected"
              ? "Rejected"
              : "Pending Verification";


        const statusClass =
          status === "approved"
            ? "approved"
            : status === "rejected"
              ? "rejected"
              : "pending";


        const description =
          submission.description
            ? `
              <span>
                ${escapeHTML(
                  submission.description
                )}
              </span>
            `
            : "";


        const rejectionText =
          status === "rejected" &&
          submission.rejection_reason
            ? `
              <small>
                Rejection Reason:
                ${escapeHTML(
                  submission.rejection_reason
                )}
              </small>
            `
            : "";


        return `

          <article>

            <strong>
              ${escapeHTML(
                submission.title
              )}
            </strong>


            <span>

              ${escapeHTML(
                submission.subject
              )}

              •

              ${escapeHTML(
                submission.year_level
              )}

            </span>


            ${description}


            <span>

              File:
              ${escapeHTML(
                submission.file_name
              )}

            </span>


            <span
              class="reviewer-status ${statusClass}"
            >
              ${statusLabel}
            </span>


            <small>

              Submitted:
              ${formatReviewerDate(
                submission.created_at
              )}

            </small>


            ${rejectionText}


            ${
              status === "pending"
                ? `
                  <div
                    class="verification-actions"
                    style="
                      display:flex;
                      gap:10px;
                      margin-top:12px;
                    "
                  >

                    <button
                      type="button"
                      class="primary-button"
                      data-reviewer-action="approve"
                      data-reviewer-id="${submission.id}"
                    >
                      ✅ Approve
                    </button>


                    <button
                      type="button"
                      class="secondary-button"
                      data-reviewer-action="reject"
                      data-reviewer-id="${submission.id}"
                    >
                      ❌ Reject
                    </button>

                  </div>
                `
                : ""
            }

          </article>

        `;

      }).join("");


    attachReviewerVerificationRefresh();


  } catch (error) {

    console.error(
      "Failed to load reviewer verification submissions:",
      error
    );


    container.innerHTML = `
      <article>

        <strong>
          ⚠️ Unable to load submissions
        </strong>

        <span>
          ${escapeHTML(
            error.message ||
            "Please try again later."
          )}
        </span>

      </article>
    `;


    showToast(
      "⚠️ Unable to load reviewer submissions."
    );

  }

}


function attachReviewerVerificationRefresh() {

  const refreshButton =
    document.getElementById(
      "refreshReviewerVerification"
    );


  if (!refreshButton) return;


  refreshButton.addEventListener(
    "click",
    function () {

      loadReviewerVerificationSubmissions();

    }
  );

}
/* =========================================================
   REVIEWER VERIFICATION — APPROVE / REJECT
========================================================= */

document.addEventListener("click", async function (event) {

  const button = event.target.closest(
    "[data-reviewer-action]"
  );

  if (!button) return;


  const action =
    button.dataset.reviewerAction;

  const reviewerId =
    button.dataset.reviewerId;


  if (!reviewerId) {
    showToast("⚠️ Reviewer ID is missing.");
    return;
  }


  if (!isMemberLoggedIn()) {
    showToast("🔒 Officer/Admin access required.");
    return;
  }


  const role =
    currentMember?.role ||
    currentSession?.user?.user_metadata?.role ||
    "";

  const normalizedRole =
    String(role).toLowerCase();


  if (
    normalizedRole !== "officer" &&
    normalizedRole !== "admin"
  ) {
    showToast(
      "⛔ You are not authorized to verify reviewers."
    );

    return;
  }


  if (action === "approve") {

    const confirmed =
      confirm(
        "Approve this reviewer?\n\n" +
        "It will become available to authorized SME members."
      );

    if (!confirmed) return;


    button.disabled = true;
    button.textContent = "Approving...";


    try {

      const { data, error } =
        await supabaseClient
          .from("reviewer_submissions")
          .update({
            status: "approved",
            rejection_reason: null,
            reviewed_by: currentSession.user.id,
            reviewed_at: new Date().toISOString()
          })
          .eq("id", reviewerId)
          .select()
          .single();


      if (error) {

        console.error(
          "Reviewer approval error:",
          error
        );

        throw error;

      }


      console.log(
        "Reviewer approved:",
        data
      );


      showToast(
        "✅ Reviewer approved successfully."
      );


      await loadReviewerVerificationSubmissions();


    } catch (error) {

      console.error(
        "Failed to approve reviewer:",
        error
      );


      button.disabled = false;
      button.textContent = "✅ Approve";


      showToast(
        "⚠️ Failed to approve reviewer."
      );

    }

    return;
  }



  if (action === "reject") {

    const reason =
      prompt(
        "Enter the reason for rejecting this reviewer:"
      );


    if (reason === null) {
      return;
    }


    const trimmedReason =
      reason.trim();


    if (!trimmedReason) {

      showToast(
        "⚠️ Please provide a rejection reason."
      );

      return;

    }


    button.disabled = true;
    button.textContent = "Rejecting...";


    try {

      const { data, error } =
        await supabaseClient
          .from("reviewer_submissions")
          .update({
            status: "rejected",
            rejection_reason: trimmedReason,
            reviewed_by: currentSession.user.id,
            reviewed_at: new Date().toISOString()
          })
          .eq("id", reviewerId)
          .select()
          .single();


      if (error) {

        console.error(
          "Reviewer rejection error:",
          error
        );

        throw error;

      }


      console.log(
        "Reviewer rejected:",
        data
      );


      showToast(
        "❌ Reviewer rejected."
      );


      await loadReviewerVerificationSubmissions();


    } catch (error) {

      console.error(
        "Failed to reject reviewer:",
        error
      );


      button.disabled = false;
      button.textContent = "❌ Reject";


      showToast(
        "⚠️ Failed to reject reviewer."
      );

    }

  }

});
/* =========================================================
   SIATP INTERACTIVE MATHEMATICAL BACKGROUND
   ========================================================= */

(function initMathBackgroundInteraction() {

  const background =
    document.querySelector(".math-background");

  if (!background) return;

  /*
   * Disable mouse interaction for users who prefer
   * reduced motion.
   */
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }

  const symbols =
    background.querySelectorAll(".math-symbol");

  const shapes =
    background.querySelectorAll(".math-shape");

  let mouseX = 0;
  let mouseY = 0;

  let targetX = 0;
  let targetY = 0;

  let animationFrame = null;

  /*
   * Track mouse position.
   */
  document.addEventListener(
    "mousemove",
    function (event) {

      targetX =
        (event.clientX / window.innerWidth - 0.5) * 2;

      targetY =
        (event.clientY / window.innerHeight - 0.5) * 2;

    },
    { passive: true }
  );

  /*
   * Smoothly follow the mouse.
   */
  function animateMathBackground() {

    mouseX += (targetX - mouseX) * 0.025;
    mouseY += (targetY - mouseY) * 0.025;

    symbols.forEach(function (symbol, index) {

      const depth =
        2 + (index % 4) * 1.5;

      const x =
        mouseX * depth;

      const y =
        mouseY * depth;

      symbol.style.marginLeft =
        `${x}px`;

      symbol.style.marginTop =
        `${y}px`;

    });

    shapes.forEach(function (shape, index) {

      const depth =
        1.5 + (index % 3);

      const x =
        mouseX * depth;

      const y =
        mouseY * depth;

      shape.style.marginLeft =
        `${x}px`;

      shape.style.marginTop =
        `${y}px`;

    });

    animationFrame =
      requestAnimationFrame(
        animateMathBackground
      );
  }

  animationFrame =
    requestAnimationFrame(
      animateMathBackground
    );

})();
