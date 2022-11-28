import express from 'express';

const router = express.Router();


// make sure the user has not already logged in.
const registerCheck = (req, res, next) => {
    if (!req.user) {
        // if user is not logged in
        res.redirect('/profile');
    } else {
        // if logged in
        console.log("You are already logged in.");
        next();
    }
}

router.post('/', (req, res) => {
    res.render('pages/register', {user: req.user});
});


// final check with middleware authCheck.
router.get('/',(req, res) => {
    // Okay, user is legit.  Let display views/profile.ejs
    // console.log(req.user);
    res.render('pages/register', {user: req.user});

});

export { router };