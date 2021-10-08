# actions-license-1
This action checks the license headers in the files of  pull requests
Inspired on [Deno License Checker]

# Usage

Create `config.json` like the following:

```
"copyright": [
    "Copyright",
    "Licensed under the **, Version 2.0 (the \"License\");", // Put your license here in a array format
  ],
  "ignore": [
    "node_modules/**", //Put the file pattern you want to ignore on the check
    "**.md",
    "**.json",
    "**.png",
    "**.idea",
    ".github",
    ".git",
    ".gitignore",
    ".vscode",
    "coverage/**",
    "upgrades/**",
    "**.svg"
  ],
  ``` 
[Deno license checker]: https://github.com/kt3k/deno_license_checker
  
 
 
```
