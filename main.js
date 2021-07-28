const { checkLicense } = require("./licence");
fs = require('fs');
glob = require('glob')
let file = "config.json"
const data = fs.readFileSync(file, 'utf-8');
let dataObject = JSON.parse(data)
let copyrightContent = dataObject.copyright
let ignore = dataObject.ignore
glob(
    "**/*.*",{cwd: process.cwd(), ignore: ignore }, (err,fileNames) => {
        if (err) {
            console.log(err)
        }
        checkLicense(fileNames, copyrightContent).then(r =>
        console.log(r))
            .catch(
                err => console.error(err)
            )
    }
)
