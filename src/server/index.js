var derby = require('derby');
var config = require('./config');

process.env.NODE_ENV = config.get('environment');
process.env.MONGO_URL = config.get('mongodb:uri');
process.env.SESSION_SECRET = config.get('session:secret');
process.env.SESSION_KEY = config.get('session:key');
process.env.SESSION_COOKIE = config.get('session:cookie');
process.env.PORT = config.get('port');
process.env.REDIS_HOST = config.get('redis:host');
process.env.REDIS_PORT = config.get('redis:port');
process.env.REDIS_PASSWORD = config.get('redis:pass');

var options = {
    static: __dirname + '/../../public',
    auth: {
        passport: {
            registerCallback: function(req, res, user, done) {
                var model = req.getModel();
                var $user = model.at('auths.' + user.id);
                model.fetch($user, function() {
                    $user.set('displayName', $user.get('github.displayName'));
                    $user.set('username', $user.get('github.username'));
                    $user.set('profileUrl', $user.get('github.profileUrl'));
                    $user.set('emails', $user.get('github.emails'));
                    done();
                })
            },
            failureRedirect: '/'
        },
        strategies: {
            github: {
                strategy: require('passport-github').Strategy,
                conf: {
                    clientID: 'aa90d8e73471ac8b8949',
                    clientSecret: '34a0d145dec4358a0b55a6e84e3977c07ee4afbe',
                    callbackURL: 'http://localhost:3000/auth/github/callback'
                }
            }
        },
        user: {
            id: true,
            displayName: true,
            username: true,
            profileUrl: true,
            emails: true,
            online: true
        }
    }
}


exports.run = function (app, opts, cb) {

    //options = options || {};

    derby.run(createServer);

    function createServer() {
        if (typeof app === 'string') app = require(app);

        var expressApp = require('./server.js').setup(app, options);

        var server = require('http').createServer(expressApp);
        server.listen(process.env.PORT, function (err) {
            console.log('%d listening. Go to: http://localhost:%d/', process.pid, process.env.PORT);
            cb && cb(err);
        });
    }
}