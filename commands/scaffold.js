const chalk = require("chalk");
const degit = require("degit");
const fs = require("fs");
const path = require("path");

const addonTemplate = {
  plugin: {
    url: "https://github.com/ConstructFund/c3ide2-framework/plugins",
    config: "pluginConfig.js",
  },
  plugin_v2: {
    url: "https://github.com/ConstructFund/c3ide2-framework/plugins_v2#add_sdk_v2_templates",
    config: "pluginConfig.js",
  },
  behavior: {
    url: "https://github.com/ConstructFund/c3ide2-framework/behaviors",
    config: "behaviorConfig.js",
  },
  behavior_v2: {
    url: "https://github.com/ConstructFund/c3ide2-framework/behaviors_v2#add_sdk_v2_templates",
    config: "behaviorConfig.js",
  },
  effect: {
    url: "https://github.com/ConstructFund/c3ide2-framework/effects",
    config: "effectConfig.js",
  },
  theme: {
    url: "https://github.com/ConstructFund/c3ide2-framework/themes",
    config: "themeConfig.js",
  },
};

async function create(type, params) {
  validateValues(type, params);
  const path = await cloneTemplate(type, params);
  await installDependencies(path);
  await maybeExecuteInitScript(path);
  updateAddonPlaceholder(path, type, params);
  console.log(`${chalk.green.bold("addon created successfully")}`);
}

function validateValues(type, params) {
  if (!Object.keys(addonTemplate).includes(type)) {
    throw new Error(
      `${chalk.red.bold(
        "invalid addon type, please select one of the following: plugin, behavior, effect, theme"
      )}`
    );
  }

  if (
    params.addonName === undefined ||
    params.addonName === null ||
    params.addonName === ""
  ) {
    throw new Error(`${chalk.red.bold("please provide addon name")}`);
  }

  if (
    params.addonAuthor === undefined ||
    params.addonAuthor === null ||
    params.addonAuthor === ""
  ) {
    throw new Error(`${chalk.red.bold("please provide addon author")}`);
  }
}

function generateAddonID(params) {
  const { addonName, addonAuthor } = params;

  const addonId = `${addonAuthor}_${addonName}`
    .toLowerCase()
    .replace(/ /g, "_");
  if (fs.existsSync(addonId)) {
    throw new Error(
      `${chalk.red.bold(
        "a folder with plugin ID : " + addonId + " already exists"
      )}`
    );
  }

  fs.mkdirSync(addonId);
  console.log(
    `${chalk.green.bold("addon folder " + addonId + " created successfully")}`
  );
  return addonId;
}

async function cloneTemplate(type, params) {
  console.log(`${chalk.white.bold("cloning plugin template ...")}`);
  const addonId = generateAddonID(params);
  const emitter = degit(addonTemplate[type].url, {
    cache: false,
    force: true,
    verbose: true,
  });

  const addonPath = path.resolve(process.cwd(), addonId);
  await emitter.clone(addonPath);

  console.log(`${chalk.green.bold("plugin template cloned successfully")}`);
  return addonPath;
}

function updateAddonPlaceholder(addonPath, type, params) {
  console.log(`${chalk.white.bold("updating addon config ...")}`);
  const { addonName, addonAuthor } = params;
  const templateFile = addonTemplate[type].config;
  const addonConfigPath = path.resolve(
    process.cwd(),
    addonPath,
    "src",
    templateFile
  );
  const addonId = `${addonAuthor}_${addonName}`
    .toLowerCase()
    .replace(/ /g, "_");

  let config = fs.readFileSync(addonConfigPath, "utf8");
  config = config.replace(/<@ADDON_ID>/g, addonId);
  config = config.replace(/<@ADDON_NAME>/g, addonName);
  config = config.replace(/<@ADDON_AUTHOR>/g, addonAuthor);

  fs.writeFileSync(addonConfigPath, config);
}

function installDependencies(addonPath) {
  return new Promise((resolve, reject) => {
    console.log(`${chalk.white.bold("installing dependencies ...")}`);
    const addonConfigPath = path.resolve(process.cwd(), addonPath);
    const { exec } = require("child_process");
    exec("npm install", { cwd: addonConfigPath }, (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        reject(err);
        return;
      }
      console.log(`${chalk.green.bold("dependencies installed successfully")}`);
      resolve();
    });
  });
}

function maybeExecuteInitScript(addonPath) {
  return new Promise((resolve, reject) => {
    const initScriptPath = path.resolve(process.cwd(), addonPath, "init.js");
    if (fs.existsSync(initScriptPath)) {
      console.log(`${chalk.white.bold("executing init script ...")}`);
      const init = require(initScriptPath);
      init()
        .then(() => {
          resolve();
        })
        .catch((err) => {
          console.error(err);
          reject(err);
        });
    } else {
      resolve();
    }
  });
}

module.exports = create;
