
const { checkLicense } = require("./licence");
const core = require('@actions/core')
const util = require("util")
const chalk = require('chalk')
fs = require('fs');
glob = require('glob')
let file = "config.json"
const data = fs.readFileSync(file, 'utf-8');
let dataObject = JSON.parse(data)
let copyrightContent = dataObject.copyright
let ignore = dataObject.ignore
let startDateLicense = dataObject.startDateLicense
glob(
    "**/*.*",{cwd: process.cwd(), ignore }, async (err,fileNames) => {
            const error = await checkLicense(fileNames, { copyrightContent: copyrightContent, startDateLicense: startDateLicense })
            if(error) {
                console.log(chalk.red(error.title))
                console.log(chalk.red(error.details))
                core.setFailed('Action failed');
            }
    }
)
console.log('should fail')