// Register the service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/pwabuilder-sw.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}

//window.addEventListener('load', () => {
//    if (!window.matchMedia('(display-mode: fullscreen)').matches) {
//        // Redirect to another page if the PWA is not installed
//        window.location.href = 'install.html'; // Replace 'install.html' with the URL of your installation page
//    }
//});

document.addEventListener("DOMContentLoaded", function () {
    // Show the splash screen
    const splashScreen = document.getElementById("splashScreen");

    // Ensure fonts are loaded before hiding the splash screen
    if (document.fonts) {
        document.fonts.ready.then(function () {
            window.dispatchEvent(new Event('load'));
        });
    }

    // Hide the splash screen after everything is loaded
    window.addEventListener("load", function () {
        setTimeout(() => {
            splashScreen.style.opacity = '0';
            splashScreen.style.transition = 'opacity 0.5s ease';
            splashScreen.addEventListener('transitionend', () => {
                splashScreen.style.display = 'none';
            });
        }, 1500); // Adjust delay as needed
    });
});

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCSUD-S4p6eNREfTu111tfpCPm6JYDBuEE",
    authDomain: "multi-ai-9278f.firebaseapp.com",
    projectId: "multi-ai-9278f",
    storageBucket: "multi-ai-9278f.appspot.com",
    messagingSenderId: "672256086419",
    appId: "1:672256086419:web:4a5d0585b4b17f127b5866",
    measurementId: "G-2DNY2VK422"
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
  console.log('Error object:', error);

  // Extract error details from the response
  const errorCode = error.error?.code;
  const errorMessage = error.error?.message || error.message;

  switch (error) {
    case 'There is no user record corresponding to this identifier. The user may have been deleted.':
      message = 'Email does not exist';
      break;
    case 'The password is invalid or the user does not have a password.':
      message = 'Incorrect password/Created account using Google.';
      break;
    case 'The user account has been disabled by an administrator.':
      message = 'The account has been disabled.'
      break;
    case 'Invalid email or password.':
      message = 'Invalid email or password format. Please make sure the password is at least 6 characters.'
      break;
    default:
      message = 'The request was invalid. Please check the details and try again.';
      break;
  }

  // Display the error message
  alert(message);
}
// Function to get cookie value by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Function to redirect to a specific page
function redirectToPage(page) {
    window.location.href = page;
}

// Function to check if user is authenticated and redirect accordingly
function checkAuthAndRedirect() {
    const uid = getCookie('user');
    if (uid) {
        auth.onAuthStateChanged(user => {
            if (user && user.uid === uid) {
                redirectToPage('h.html');  // Redirect to index.html if UID is valid
            }
        });
    }
}

// Call checkAuthAndRedirect on page load
document.addEventListener('DOMContentLoaded', checkAuthAndRedirect);

// Register function with error handling
function register() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!validate_email(email) || !validate_password(password)) {
        showError('Invalid email or password');
        return;
    }

    auth.createUserWithEmailAndPassword(email, password)
        .then(() => {
            const user = auth.currentUser;
            const database_ref = database.ref();
            const user_data = {
                email: email,
                last_login: Date.now()
            };
            database_ref.child('users/' + user.uid).set(user_data);
            redirectToPage('h.html');  // Redirect to the home page
        })
        .catch(error => {
            showError(error.message);
        });
}

// Login function with error handling
function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!validate_email(email) || !validate_password(password)) {
        showError('Invalid email or password.');
        return;
    }

    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            const user = auth.currentUser;
            const database_ref = database.ref();
            const user_data = {
                last_login: Date.now()
            };
            database_ref.child('users/' + user.uid).update(user_data);
            document.cookie = `user=${user.uid}; path=/; max-age=2592000`;  // Set cookie for auto-login
            redirectToPage('h.html');  // Redirect to the home page
        })
        .catch(error => {
            showError(error.message);
        });
}

// Google Sign-In function
function googleSignIn() {
    const provider = new firebase.auth.GoogleAuthProvider();

    auth.signInWithPopup(provider)
        .then(result => {
            // This gives you a Google Access Token. You can use it to access Google APIs.
            const token = result.credential.accessToken;
            // The signed-in user info.
            const user = result.user;
            // Save user data to the database if needed
            const database_ref = database.ref();
            const user_data = {
                email: user.email,
                last_login: Date.now()
            };
            database_ref.child('users/' + user.uid).set(user_data);
            // Set cookie for auto-login
            document.cookie = `user=${user.uid}; path=/; max-age=2592000`;
            redirectToPage('h.html');  // Redirect to the home page
        })
        .catch(error => {
            showError(error.message);
        });
}

function passwordReset() {
    location.href = "password-reset.html"
}