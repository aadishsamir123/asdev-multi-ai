// Register the service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/pwabuilder-sw.js")
      .then((registration) => {
        // Listen for updates
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (
                installingWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                console.log("New content available, page will update.");
                alert(
                  "There's a new version of Multi AI! The app will now update."
                );

                updateApp();
              }
            };
          }
        };
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
  });
}

//window.addEventListener('load', () => {
//    if (!window.matchMedia('(display-mode: fullscreen)').matches) {
//        // Redirect to another page if the PWA is not installed
//        window.location.href = 'install.html'; // Replace 'install.html' with the URL of your installation page
//    }
//});

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCSUD-S4p6eNREfTu111tfpCPm6JYDBuEE",
  authDomain: "multi-ai-9278f.firebaseapp.com",
  projectId: "multi-ai-9278f",
  storageBucket: "multi-ai-9278f.appspot.com",
  messagingSenderId: "672256086419",
  appId: "1:672256086419:web:4a5d0585b4b17f127b5866",
  measurementId: "G-2DNY2VK422",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize variables
const auth = firebase.auth();
const database = firebase.database();

// Function to validate email
function validate_email(email) {
  const expression = /^[^@]+@\w+(\.\w+)+\w$/;
  return expression.test(email);
}

// Function to validate password
function validate_password(password) {
  return password.length >= 6;
}

function showError(error) {
  let message;

  // Log the entire error object to understand its structure
  console.log("Error object:", error);
  // Extract error details from the response
  const errorCode = error.error?.code;
  const errorMessage = error.error?.message || error.message;

  switch (error) {
    case "There is no user record corresponding to this identifier. The user may have been deleted.":
      message = "Email or password is incorrect.";
      break;
    case "The password is invalid or the user does not have a password.":
      message = "Incorrect password/Created account using Google.";
      break;
    case "The user account has been disabled by an administrator.":
      message = "The account has been disabled.";
      break;
    case "Invalid email or password.":
      message = "Invalid email or password format.";
      break;
    case "The popup has been closed by the user before finalizing the operation.":
      message = "The sign-in popup has been closed.";
      break;
    default:
      message =
        "The request was invalid. Please check the details and try again.";
      break;
  }

  // Display the error message
  const x = document.getElementById("snackbar");
  x.innerHTML =
    "<i class='fas fa-circle-xmark'></i> <strong>" + message + "</strong>";
  x.className = "show";
  setTimeout(function () {
    x.className = x.className.replace("show", "");
  }, 3000);
}

// Function to get cookie value by name
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

// Function to redirect to a specific page
function redirectToPage(page) {
  window.location.href = page;
}

// Function to check if user is authenticated and redirect accordingly
function checkAuthAndRedirect() {
  const uid = getCookie("user");
  if (uid) {
    auth.onAuthStateChanged((user) => {
      if (user && user.uid === uid) {
        redirectToPage("h.html"); // Redirect to index.html if UID is valid
      }
    });
  }
}

// Call checkAuthAndRedirect on page load
document.addEventListener("DOMContentLoaded", checkAuthAndRedirect);
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    console.log(
      "%cWARNING!",
      "color: red; font-size: 40px; font-weight: bold; background-color: #FFFF00;"
    );
    console.log(
      "%cUsing this console may allow attackers to impersonate you and steal your information using an attack called Self-XSS.",
      "font-size: 16px;"
    );
    console.log(
      "%cDo not enter or paste code that you do not understand.",
      "font-size: 18px;"
    );
  }, 1000);
});

// Register function with error handling
function register() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!validate_email(email) || !validate_password(password)) {
    showError("Invalid email or password");
    return;
  }

  auth
    .createUserWithEmailAndPassword(email, password)
    .then(() => {
      const user = auth.currentUser;
      const database_ref = database.ref();
      const user_data = {
        email: email,
        last_login: Date.now(),
      };
      database_ref.child("users/" + user.uid).set(user_data);
      redirectToPage("h.html"); // Redirect to the home page
    })
    .catch((error) => {
      showError(error.message);
    });
}

// Login function with error handling
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!validate_email(email) || !validate_password(password)) {
    showError("Invalid email or password.");
    return;
  }

  auth
    .signInWithEmailAndPassword(email, password)
    .then(() => {
      const user = auth.currentUser;
      const database_ref = database.ref();
      const user_data = {
        last_login: Date.now(),
      };
      database_ref.child("users/" + user.uid).update(user_data);
      document.cookie = `user=${user.uid}; path=/; max-age=2592000`; // Set cookie for auto-login
      redirectToPage("h.html"); // Redirect to the home page
    })
    .catch((error) => {
      showError(error.message);
    });
}

// Google Sign-In function
function googleSignIn() {
  const provider = new firebase.auth.GoogleAuthProvider();

  auth
    .signInWithPopup(provider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access Google APIs.
      const token = result.credential.accessToken;
      // The signed-in user info.
      const user = result.user;
      // Save user data to the database if needed
      const database_ref = database.ref();
      const user_data = {
        email: user.email,
        last_login: Date.now(),
      };
      database_ref.child("users/" + user.uid).set(user_data);
      // Set cookie for auto-login
      document.cookie = `user=${user.uid}; path=/; max-age=2592000`;
      redirectToPage("h.html"); // Redirect to the home page
    })
    .catch((error) => {
      showError(error.message);
    });
}

function passwordReset() {
  location.href = "pwrst.html";
}

document.addEventListener("DOMContentLoaded", function () {
  // Show the splash screen
  const splashScreen = document.getElementById("splashScreen");

  // Ensure fonts are loaded before hiding the splash screen
  if (document.fonts) {
    document.fonts.ready.then(function () {
      window.dispatchEvent(new Event("load"));
    });
  }

  // Hide the splash screen after everything is loaded
  window.addEventListener("load", function () {
    setTimeout(() => {
      splashScreen.style.opacity = "0";
      splashScreen.style.transition = "opacity 0.5s ease";
      splashScreen.addEventListener("transitionend", () => {
        splashScreen.style.display = "none";
      });
    }, 1500); // Adjust delay as needed
  });
});
