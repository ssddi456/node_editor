var fs = require('fs');
var path    = require('path');
var debug_name = path.basename(__filename,'.js');
if( debug_name == 'index'){
  debug_name = path.basename(__dirname);
}
(require.main === module) && (function(){
    process.env.DEBUG = '*';
})()
var debug = require('debug')(debug_name);

var task = fs.readFileSync( path.join(__dirname,'../.vscode/tasks.json'), 'utf8');
task = task.replace(/\s*\/\/.*$/gm,'');
task = JSON.parse(task);

var child_process = require('child_process');

var cp = child_process.spawn( 
            task.command + '.cmd', 
            task.args,
            { 
              cwd : path.join(__dirname, '..')
            });

cp.stdout.pipe(process.stdout);
cp.stderr.pipe(process.stderr);

// add reload here