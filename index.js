const {program} = require('commander');
const chalk = require('chalk');
const {plugin} = require('./commands/make');

program
.version('0.0.1')
.description('a cli for generating addon\'s for construct 3 using c3ide2-framework')

program
.command('plugin <name>')
.option('-a, --author <author>', 'the author of the plugin', 'default')
.description('Create a new plugin')
.action((name) => {
    const author = program.commands[0]._optionValues.author;
    console.log(chalk.green(`Creating plugin ${name} by ${author}`));
    plugin(name, author);
});

program.parse(process.argv);