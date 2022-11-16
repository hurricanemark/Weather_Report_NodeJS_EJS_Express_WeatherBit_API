import express from 'express';
import passport from 'passport';


const router = express.Router();

// auth login
router.get('/login', (req, res) => {
    res.render('login', {user: req.user});
});

// auth logout
router.get('/logout', (req, res) => {
    // handle with passport
    // Simply destroy the session cookie containing express.session
    req.logout();

    // redirect to login page
    res.redirect('/');
});

// First, get the consent autho with google credential
router.get('/google', passport.authenticate('google', {
    scope: ['profile']
}));


// Second, passport negotiates for information using the consent string i.e. accessToken, refreshToken. callback route for google to redirect to profile info.  Whereupon we check it against out application data in mongodb.
router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
    // After the middleware authenticated, we'd got the user info in req.user.  

    // res.send(req.user);  // this will display raw json on the browser.
    res.redirect('/profile/');    // handing it over to /routes/profile-routes.js where it will be formatted into /views/profile.ejs
});


export { router };