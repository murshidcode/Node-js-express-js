const cookieParser = require('cookie-parser');
const express = require('express');
const session = require('express-session');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('views'));
app.use(cookieParser());
app.use(
    session({
        resave: true,
        saveUninitialized: false,
        secret: "secret",
        cookie: { maxAge: 3600000 } // Optional: Set session expiration time (1 hour)
    })
);

app.set('view engine', 'ejs');

// Mock credentials
const emailA = 'ab';
const passwordB = '12';

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.isAuthenticated) {
        return next();
    } else {
        res.redirect('/');
    }
}

// Middleware to redirect logged-in users away from the login page
function redirectIfAuthenticated(req, res, next) {
    if (req.session.isAuthenticated) {
        return res.redirect('/home');
    }
    next();
}

// Middleware to set no-cache headers
function setNoCacheHeaders(req, res, next) {
    res.set('Cache-Control', 'no-store'); // Prevent caching
    res.set('Pragma', 'no-cache'); // HTTP 1.0
    res.set('Expires', '0'); // Proxies
    next();
}


app.get('/', redirectIfAuthenticated, setNoCacheHeaders, (req, res) => {
    res.render('pages/form', { alertMessage: null });
});


app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (emailA === email && passwordB === password) {
        req.session.isAuthenticated = true;
        req.session.user = { email };  // Store user info in session
        res.redirect('/home');
    } else {
        const alertMessage = 'Please enter the correct email and password';
        res.render('pages/form', { alertMessage });
    }
});


app.get('/home', isAuthenticated, (req, res) => {
    const student = { name: 'About us' };
    res.render('pages/home', { students: student });
});


app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Failed to destroy session:', err);
            res.send("Error logging out. Please try again.");
        } else {
            res.clearCookie('connect.sid');  
            res.redirect("/");
        }
    });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
