const chalk = require('chalk');
const degit = require('degit');
const fs = require('fs');
const path = require('path');

const addonTemplate = {
    plugin: {
        url: 'https://github.com/armandoalonso/c3ide2-framework/plugins', //'https://github.com/ConstructFund/c3ide2-framework/plugins',
        config: 'pluginConfig.js'
    },
    behavior: {
        url: 'https://github.com/armandoalonso/c3ide2-framework/behaviors', //'https://github.com/ConstructFund/c3ide2-framework/behaviors',
        config: 'behaviorConfig.js'
    },
    effect: {
        url: 'https://github.com/armandoalonso/c3ide2-framework/effects', //'https://github.com/ConstructFund/c3ide2-framework/effects',
        config: 'effectConfig.js'
    },
    theme: {
        url: 'https://github.com/armandoalonso/c3ide2-framework/themes', //'https://github.com/ConstructFund/c3ide2-framework/themes',
        config: 'themeConfig.js'
    }
}

async function create(type, params) {
    validateValues(type, params);
    const path = await cloneTemplate(type, params);
    updateAddonPlaceholder(path, type, params);
}

function validateValues(type, params) {
    if (!Object.keys(addonTemplate).includes(type)) {
        throw new Error(`${chalk.red.bold("invalid addon type, please select one of the following: plugin, behavior, effect, theme")}`);
    }

    if (params.addonName === undefined || params.addonName === null || params.addonName === '') {
        throw new Error(`${chalk.red.bold("please provide addon name")}`);
    }

    if (params.addonAuthor === undefined || params.addonAuthor === null || params.addonAuthor === '') {
        throw new Error(`${chalk.red.bold("please provide addon author")}`);
    }
}

function generateAddonID(params) {
    const {addonName, addonAuthor} = params;

    const addonId = `${addonAuthor}_${addonName}`.toLowerCase().replace(/ /g, '_');
    if (fs.existsSync(addonId)) {
        throw new Error(`${chalk.red.bold("a folder with plugin ID : "+addonId+" already exists")}`);
    }

    fs.mkdirSync(addonId);
    console.log(`${chalk.green.bold("addon folder "+addonId+" created successfully")}`);
    return addonId;
}

async function cloneTemplate(type, params) {
    console.log(`${chalk.white.bold("cloning plugin template ...")}`);
    const addonId = generateAddonID(params);
    const emitter = degit(addonTemplate[type].url, { cache: false, force: true, verbose: true });

    const addonPath = path.resolve(process.cwd(), addonId)
    await emitter.clone(addonPath);
    
    console.log(`${chalk.green.bold("plugin template cloned successfully")}`);
    return addonPath;
}

function updateAddonPlaceholder(addonPath, type, params) {
    const {addonName, addonAuthor} = params;
    const templateFile = addonTemplate[type].config;
    const addonConfigPath = path.resolve(process.cwd(), addonPath, 'src', templateFile);
    const addonId = `${addonAuthor}_${addonName}`.toLowerCase().replace(/ /g, '_');

    let config = fs.readFileSync(addonConfigPath, 'utf8');
    config = config.replace(/<@ADDON_ID>/g, addonId);
    config = config.replace(/<@ADDON_NAME>/g, addonName);
    config = config.replace(/<@ADDON_AUTHOR>/g, addonAuthor);
    
    fs.writeFileSync(addonConfigPath, config);
}

module.exports = create;
