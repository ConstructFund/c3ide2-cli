const {prompt} = require('inquirer');
const {program} = require('commander');
const chalk = require('chalk');
const package = require('./package.json'); 
const scaffold = require('./commands/scaffold');
const server = require('./commands/server');

const questions = [
    {
        type: 'list',
        name: 'addonType',
        message: 'Select addon type ...',
        choices: ['plugin', 'behavior', 'effect', 'theme']
    },
    {
        type: 'input',
        name: 'addonName',
        message: 'Enter addon name ...'
    },
    {
        type: 'input',
        name: 'author',
        message: 'Enter author name ...'
    }
];

async function parseArguments(options) {
    let opts = {};
    // check if options object contains all required properties
    if (options.type && options.name && options.author) {
        opts = { addonType: options.type, addonName: options.name, addonAuthor: options.author };
    } else {
        console.log(chalk.green.bold('creating addon ...'));
        const answers = await prompt(questions);
        opts = { addonType: answers.addonType, addonName: answers.addonName, addonAuthor: answers.author };
    }
    return opts;
}

program
.name('addon-create')
.version(package.version)
.description('a cli for generating addon\'s for construct 3 using c3ide2-framework')
.option('-t, --type <type>', 'the type of addon to create') // plugin / behavior / effect 
.option('-n, --name <name>', 'the name of the addon')
.option('-a, --author <author>', 'the author of the addon')
.action(async (options) => {
    const opts = await parseArguments(options);
    console.log(chalk.green.bold('creating addon ...'));
    console.log(chalk.green.bold('type: ') + chalk.white.bold(opts.addonType));
    console.log(chalk.green.bold('name: ') + chalk.white.bold(opts.addonName));
    console.log(chalk.green.bold('author: ') + chalk.white.bold(opts.addonAuthor));
  
    scaffold(opts.addonType, opts);
});

program
.command('server')
.description('start a local server for testing addons')
.option('-p, --path <path>', 'the path to root folder of the addon', process.cwd())
.action((options) => {
    server(options.path);
});

program.parse(process.argv);