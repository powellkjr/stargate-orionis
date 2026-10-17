# Cline Instructions

## User shell preference — Git Bash only

- Always recommend Git Bash-compatible commands to the user, including on Windows.
- The user only uses Git Bash and will never run PowerShell commands. Do not
  provide PowerShell or Windows Command Prompt syntax as instructions or alternatives.
- Use Bash syntax for variables, environment assignments, quoting, pipelines,
  redirection, and multiline commands. Label shell code blocks `bash`.
- When absolute paths are needed in commands, use Git Bash paths such as
  `/c/Users/Powel/Documents/projects/git/stargate-orionis`, not backslash paths.
- Prefer commands run from the repository root when practical, and state the
  required working directory clearly.

Continue to follow `AGENTS.md` and consult `REPO_MAP.md` for repository navigation.