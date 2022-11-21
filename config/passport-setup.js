
import passport  from 'passport';
import GoogleStrategy  from 'passport-google-oauth20';
import { User } from '../models/user-models.js';

import { GoogleclientID, GoogleclientSecret } from '../loadSecrets.js';

// const logging = console.log(GoogleclientID + '  ---  ' + GoogleclientSecret);

// serialize user structure in the mongodb
const serialize = passport.serializeUser((user, done) => {
    done(null, user.id);
});

const deserialize = passport.deserializeUser((id, done) => {
try {
    User.findById(id).then((user) => {
        done(null, user);
    })
} catch (err) {
    console.log(err);
}
});


/*
 * Note: Passport google strategy required clientID and clientSecret
 * which can be obtained from registering within your google account.
 * There is a configuration file `keys.js` containing the above info code,
 * which is not part of this source code.
 * 
 * Go to https://console.cloud.google.com/ to create your own clientID and clientSecret.
 */
const googleStrategy = passport.use(new GoogleStrategy({
    // options for google strategy
    // callbackURL: '/auth/google/redirect',
    callbackURL: 'https://techrolemiweather.cyclic.app/auth/google/redirect',
    // clientID: keys.google.clientID, 
    // clientSecret: keys.google.clientSecret
    clientID: GoogleclientID,
    clientSecret: GoogleclientSecret

}, (accessToken, refreshToken, profile, done) => {
    // passport callback function
    // console.log('accessToken: ' + accessToken);

    // console.log(profile);

    // now that the google profile is here, let's store it in database.  However, to avoid duplicates in mongoDB collection, we perform dbase checking first.

    //1. Check if user exists in mongoDb
    User.findOne({googleId: profile.id}).then((currentUser) => {
        if (currentUser) {
            // found user already saved previously, proceed.
            // console.log('user is: ' + currentUser);
            done(null, currentUser);  // trigger serializer
        } else {
            // if not, this is then the first time this user logon
            new User({
                username: profile.displayName,
                googleId: profile.id,
                thumbnail: profile._json.picture
            }).save().then((newUser) => {
                console.log('New user created: ' + newUser);
                done(null, newUser);  // trigger the serializer method
            });
        }
    })

}));

export { serialize, deserialize, googleStrategy };