const chalk = require('chalk');
const degit = require('degit');
const fs = require('fs');
const path = require('path');

function setPluginConfigValues(addonName, author) {
    const addonId = `${author}_${addonName}`.toLowerCase().replace(/ /g, '-');
    const configPath = path.resolve(process.cwd(), addonId, 'src/pluginConfig.js');
    //read config file text file
    let config = fs.readFileSync(configPath, 'utf8');
    config = config.replace(/plugin_id/g, addonId);
    config = config.replace(/My Plugin/g, addonName);
    config = config.replace(/skymen/g, author.replace(/ /g, ''));
    
    fs.writeFileSync(configPath, config);
}

const makePlugin = (addonName, author) => {
    if (author === undefined || author === null || author === '') {
        author = "default"
    }
    
    const addonId = `${author}_${addonName}`.toLowerCase().replace(/ /g, '-');
    if (fs.existsSync(addonId)) {
        console.log(`${chalk.red.bold("a plugin with given name already exists")}`);
        return;
    }

    fs.mkdirSync(addonId);

    const emitter = degit('https://github.com/ConstructFund/c3ide2-framework/plugins', {
        cache: false,
        force: true,
        verbose: true
    });

    emitter.clone(path.resolve(process.cwd(), addonId)).then(() => {
        console.log(`${chalk.green.bold("plugin created successfully")}`);

        // update plugin config placehlder values
        setPluginConfigValues(addonName, author);
    });

    
};



module.exports = {
    plugin: makePlugin
};
