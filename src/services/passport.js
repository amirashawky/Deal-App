import passport from 'passport';
import passportJwt from 'passport-jwt';
import passportLocal from 'passport-local';
import config from '../config';
import User from '../models/user.model/user.model';
let FacebookStrategy = require('passport-facebook').Strategy;
const JwtStrategy = passportJwt.Strategy;
const LocalStrategy = passportLocal.Strategy;
const { ExtractJwt } = passportJwt;
const { jwtSecret } = config;


passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwtSecret
}, (payload, done) => {
    User.findOne({_id: payload.sub, status : 'ACTIVE' })
    .then(user => {
        //console.log(user)

        if (!user)
            return done(null, false);

        return done(null, user)
    }).catch(err => {
        console.log('Passport Error: ', err);
        return done(null, false);
    })
}
));

passport.use(new LocalStrategy({
    usernameField: 'email'
}, (email, password, done) => {

    User.findOne({ email,status:'ACTIVE' }).then(user => {
        if (!user)
            return done(null, false);

        // Compare Passwords 
        user.isValidPassword(password, function (err, isMatch) {
            if (err) return done(err);
            if (!isMatch) return done(null, false, { error: 'Invalid Credentials' });

            return done(null, user);
        })

    });
}));



const requireAuth = passport.authenticate('jwt', { session: false });



export { requireAuth   };