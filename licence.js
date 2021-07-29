/*
 * Copyright 2020, 2021 ZUP IT SERVICOS EM TECNOLOGIA E INOVACAO SA
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const core = require('@actions/core')
const github = require('@actions/github')
const fs = require("fs");
const util = require("util");
const chalk = require('chalk')
function hasCorrectCopyrightDate(copyrightFile, status, startDateLicense) {
    let requiredDate = ''
    if (status === 'modified'){
        requiredDate = `${startDateLicense, new Date().getFullYear()}`
    }
    if (status == 'created'){
        requiredDate = new Date().getFullYear()
    }
    return copyrightFile.includes(requiredDate)
}

async function openFile(name) {
    return await new Promise(
        (resolve,reject) => {
            fs.open(name, 'r', (error, fd) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(fd)
                }
            })
        })
}

async function checkLicenseFile(file, config, fd) {
    let buffer = new Buffer(8000)
    return await new Promise(
        (resolve, reject) => {
            fs.read(fd, buffer, 0, 8000, 0, (err) => {
                if (err) {
                    console.error(`Error reading file ${err}`)
                }
                const copyrightFile = buffer.toString('utf-8')
                const allCopyrightIncluded = config.copyrightContent.every(
                    line => copyrightFile.includes(line)
                )

                if (!allCopyrightIncluded) {
                    console.log('File ' + chalk.yellow(file.name) + chalk.red(': No copyright header!'))
                    reject(file.name)
                } else {

                    const correctDate = hasCorrectCopyrightDate(copyrightFile, file.status, config.startDateLicense)
                    if (correctDate) {
                        console.log('File ' + chalk.yellow(file.name) + chalk.green(': ok!'))
                        console.log(`File ${file.name} :ok!`)
                        resolve()
                    } else {
                        console.log(`file ${file.name}: Fix copyright date!`)
                        reject(file.name)
                    }
                }
            })
        })
    }

async function checkFilesLicense(filesPr, config) {
    let errors = []
    for ( let file of filesPr) {
        const fd = await openFile(file.name)
        try{
            await checkLicenseFile(file, config, fd)
        } catch (error) {
            errors.push(error)
        }
    }
    if (errors.length) {
        return({
            title: `Quantity of files with copyright errors: ${errors.length}`,
            details: `Files : ${util.inspect(errors)}`
        })
    }
}

function removeIgnoredFiles(filesPr, fileNames) {
    return filesPr.filter(
        file => fileNames.includes(file.name)
    )
}

const checkLicense = async (fileNames, config) => {
    const token = core.getInput('token')
    const octokit = github.getOctokit(token)
    const prNumber = github.context.payload.pull_request.number
    const owner =  github.context.payload.repository.owner.login
    const repo =  github.context.payload.repository.name
    const responsePr = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', ({
        owner: owner,
        repo: repo,
        pull_number: prNumber
    }))

    const responseCompare = await octokit.request('GET /repos/{owner}/{repo}/compare/{basehead}', {
        owner: owner,
        repo: repo,
        basehead: `${responsePr.data.base.sha}...${responsePr.data.head.sha}`
    })
    const filesPr = responseCompare.data.files.map(
        file => {
            return {
                name: file.filename,
                status: file.status
            }
        }
    )
    const filesFiltered = removeIgnoredFiles(filesPr, fileNames)
    return await checkFilesLicense(filesFiltered, config)

}


exports.checkLicense = checkLicense