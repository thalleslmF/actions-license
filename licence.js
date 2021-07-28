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

const checkLicense = async (fileNames, copyrightContent) => {
    const token = core.getInput('token')
    const octokit = github.getOctokit(token)
    const prNumber = github.context.payload.pull_request.number
    const owner = github.context.payload.repository.owner.login
    const repo = github.context.payload.repository.name
    const responsePr = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', ({
        owner: owner,
        repo: repo,
        pull_number: prNumber
    }))

    console.log(responsePr.data)
    console.log(responsePr.data)

    const responseCompare = await octokit.request('GET /repos/{owner}/{repo}/compare/{basehead}', {
        owner: owner,
        repo: repo,
        basehead: `${responsePr.data.head.sha}...${responsePr.data.base.sha}`
    })
    const listFilesPr = responseCompare.data.files.map(
        file => file.filename
    )
    console.log(listFilesPr)
    for ( let name of fileNames) {

        if( !listFilesPr.includes(name)) {
            console.info(`${name} not in PR: ignoring...`)
            continue
        }
        fs.open(name, 'r', (status,fd) => {

            var buffer = new Buffer(8000)
            fs.read(fd, buffer, 0, 8000, 0, (err) => {
                if (err) {
                    console.error(`Error reading file ${err}`)
                }
                const copyrightFile = buffer.toString('utf-8')
                const allCopyrightIncluded = copyrightContent.every(
                    line => copyrightFile.includes(line)
                )

                if (!allCopyrightIncluded) {
                    console.error(`File ${name} :No copyright header!`)
                } else {
                    console.error(`File ${name} :ok!`)
                }
            })
        })
    }



}



exports.checkLicense = checkLicense