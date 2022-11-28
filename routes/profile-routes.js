import express from 'express';

const router = express.Router();


// make sure the user has not already logged in.
const authCheck = (req, res, next) => {
    if (!req.user) {
        // if user is not logged in
        res.redirect('/auth/login');
    } else {
        // if logged in, 
        // Todo: retrieve info from database and determine if the use is a
        // 1. basic subscriber
        // 2. pro or premium member.
        console.log("You are already logged in.");
        next();
    }
}

// final check with middleware authCheck.
router.get('/', authCheck, (req, res) => {
    // Okay, user is legit.  Let display views/profile.ejs
    // console.log(req.user);
    res.render('pages/profile', {user: req.user});

});

export { router };