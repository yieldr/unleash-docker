'use strict';

/**
 * Auth0
 *
 * For more info on using this strategy, check out the passport-auth0
 * documentation here:
 *
 * http://www.passportjs.org/packages/passport-auth0/
 *
 * This example assumes that all users authenticating via auth0 should have
 * access. You would proably limit access to users you trust.
 *
 * The implementation assumes the following environement variables:
 *
 *  - AUTH0_DOMAIN
 *  - AUTH0_CLIENT_ID
 *  - AUTH0_CLIENT_SECRET
 *  - AUTH0_CALLBACK_URL
 */
const { User, AuthenticationRequired } = require('unleash-server/lib/server-impl.js');

const passport = require('passport');
const Auth0Strategy = require('passport-auth0');

passport.use(
  new Auth0Strategy({
      domain: process.env.AUTH0_DOMAIN,
      clientID: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      callbackURL: process.env.AUTH0_CALLBACK_URL || `http://${process.env.HTTP_HOST}:${process.env.HTTP_HOST}/api/auth/callback`,
      scope: 'openid profile email email_verified'
    },
    function(accessToken, refreshToken, extraParams, profile, done) {
      return done(null, new User({
        name: profile.displayName,
        email: profile.emails[0].value,
        imageUrl: profile.picture
      }));
    }));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = {

  preRouterHook: function(app) {

    app.use(passport.initialize());
    app.use(passport.session());

    app.get('/api/admin/login', passport.authenticate('auth0'));

    app.get('/api/auth/callback', passport.authenticate('auth0', {
        failureRedirect: '/api/admin/error-login',
      }),
      (req, res) => {
        res.redirect('/');
      }
    );

    app.use('/api/admin', (req, res, next) => {
      if (req.user) {
        next();
      } else {
        return res
          .status('401')
          .json(
            new AuthenticationRequired({
              path: '/api/admin/login',
              type: 'custom',
              message: `You have to identify yourself in order to use Unleash.
                        Click the button and follow the instructions.`,
            })
          )
          .end();
      }
    });

    app.use('/api/client', (req, res, next) => {
      if (req.header('authorization') !== process.env.SHARED_SECRET) {
        res.sendStatus(401);
      } else {
        next();
      }
    });
  }

}
