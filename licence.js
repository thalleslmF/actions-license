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
    console.log(prNumber)
    const owner = github.context.payload.repository.owner
    const repo = github.context.payload.repository.name
    const response = await ctokit.rest.pulls.get({
        owner: owner,
        repo: repo,
        pull_number: prNumber
    })
    console.log(response)
    for( let name of fileNames) {
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