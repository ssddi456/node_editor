var fs = require('fs');
var path = require('path');
var debug_name = path.basename(__filename, '.js');
if (debug_name == 'index') {
    debug_name = path.basename(__dirname);
}
(require.main === module) && (function () {
    process.env.DEBUG = '*';
})()
var debug = require('debug')(debug_name);
var req = require('request').defaults({
    proxy: null,
});

var _ = require('underscore');

var task = fs.readFileSync(path.join(__dirname, '../.vscode/tasks.json'), 'utf8');
task = task.replace(/\s*\/\/.*$/gm, '');
task = JSON.parse(task);

var child_process = require('child_process');

var cp = child_process.spawn(
    task.command + '.cmd',
    task.args,
    {
        cwd: path.join(__dirname, '..')
    });

cp.stdout.pipe(process.stdout);
cp.stderr.pipe(process.stderr);

var lazy_reload = _.throttle(function () {
    console.log('data end ');
    
    req.get('http://localhost:35729/reload',
        {
            qs: {
                command: 'reload',
                path: 'app.js', // or your filename
                liveCSS: true
            }
        }, function (err, resp, body) {
            console.log('send reload end', body);
        });
}, 300);

cp.stdout.on('data', lazy_reload);

// add reload here
