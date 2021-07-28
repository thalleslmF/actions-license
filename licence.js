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

function getExtensionCommentPattern(extension) {
    let result = ''
    switch(extension) {

        case "yaml" : case "sh": case "properties":
            result = "#"
        break;
         case "sql":
         result = "--"
            default:
         result = "/*"
    }
    return result
}

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

const checkLicense = async (fileNames, config) => {
    let errors = []
    const token = core.getInput('token') || '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 '
    const octokit = github.getOctokit(token)
    const prNumber = github.context.payload.pull_request.number
    const owner = github.context.payload.repository.owner.login
    const repo = github.context.payload.repository.name
    const responsePr = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', ({
        owner: owner,
        repo: repo,
        pull_number: prNumber
    }))

    const responseCompare = await octokit.request('GET /repos/{owner}/{repo}/compare/{basehead}', {
        owner: owner,
q        basehead: `${responsePr.data.base.sha}...${responsePr.data.head.sha}`
    })
    const listFilesPr = responseCompare.data.files.map(
        file => {
            return {
                name: file.filename,
                status: file.status
            }
        }
    )
    for ( let name of fileNames) {

        if( !listFilesPr.some(
            file => file.name === name)) {
            continue
        }
        fs.open(name, 'r', (status,fd) => {

            var buffer = new Buffer(8000)
            fs.read(fd, buffer, 0, 8000, 0, (err) => {
                if (err) {
                    console.error(`Error reading file ${err}`)
                }
                const copyrightFile = buffer.toString('utf-8')
                const allCopyrightIncluded = config.copyrightContent.every(
                    line => copyrightFile.includes(line)
                )

                if (!allCopyrightIncluded) {
                    console.error(`File ${name} :No copyright header!`)
                    errors.push(
                        name
                    )
                } else {
                    const fileSearched = listFilesPr.find(
                        file => file.name === name
                    )
                    const correctDate = hasCorrectCopyrightDate(copyrightFile, fileSearched.status, config.startDateLicense)
                    if (correctDate) {
                        console.log(`File ${name} :ok!`)
                    } else {
                        console.error(`fix file: ${name} copyright date!`)
                        errors.push(
                            name
                        )
                    }
                }
            })
        })
    }
    if(errors.length) {
        throw new Error(`
            Quantity of copyright errors: ${errors.length}
            Fix copyright on the following files: ${errors}
        `)
    }
}


exports.checkLicense = checkLicense