const express = require("express");
const { exec } = require("child_process");
const cors = require("cors");
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

let port = 3000;
//const path = () => `http://localhost:${port}/addon.json`;

// find all addon.json files in the recursive directory
function findAddonPaths(startPath) {
    let results = [];

    if (!fs.existsSync(startPath)) {
        console.log("Directory ", startPath, " not found.");
        return;
    }

    const files = fs.readdirSync(startPath);

    for (let i = 0; i < files.length; i++) {
        let filename = path.join(startPath, files[i]);
        let stat = fs.lstatSync(filename);

        if (stat.isDirectory()) {
            results = results.concat(findAddonPaths(filename)); //recurse
        }
        else if (filename.indexOf('addon.json') >= 0) {
            // split the path to get the addon folder name
            const pathParts = filename.split('\\');
            const addonFolder = pathParts[pathParts.length - 3];
            // generate the url to the addon.json file
            const url = `http://localhost:${port}/${addonFolder}/export/addon.json`;
            results.push(url);
        }
    }

    return results;
}

// Start the server
function tryListen(path) {
    const currentPath = path
    const addonPaths = findAddonPaths(currentPath);

    // Create an express application
    const app = express();

    // Enable all CORS requests
    app.use(cors());

    // Serve static files from the 'export' directory
    app.use(express.static(path));

    app.listen(port, () => {
        console.log("Server is running at " + chalk.green.bold("http://localhost:" + port));
        console.log("Server is serving files from " + chalk.green.bold(currentPath));
        console.log("Available addon urls:");

        // log addon.json file path for every addon
        for(let i = 0; i < addonPaths.length; i++) {
            console.log(chalk.green.bold(addonPaths[i]));
        }
    });
}

process.on("uncaughtException", function (err) {
    if (err.code === "EADDRINUSE") {
      console.log(`Port ${port} is already in use. Trying another port...`);
      port++;
      tryListen();
    } else {
      console.log(err);
      process.exit(1);
    }
}); 

module.exports = tryListen;