const { checkLicense } = require("./licence");
const util = require("util");
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
            const errors = await checkLicense(fileNames, { copyrightContent: copyrightContent, startDateLicense: startDateLicense })
            if(errors) {
                console.log(errors.title)
                console.log(errors.details)
                process.exit()
            }
    }
)