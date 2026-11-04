# Instructions for AI Coding Agents

Read this file before beginning any repository task. It is the required entry point for the detailed guidance below.

## Required reading by task

Every coding task requires:

- [Workflow and ownership rules](docs/agents/WORKFLOW.md)
- [Code standards](docs/agents/CODE_STANDARDS.md)
- [Validation requirements](docs/agents/VALIDATION.md)

Before creating or updating a pull request, also read the [PR review checklist](docs/agents/PR_REVIEW.md).

For security-sensitive, infrastructure, authentication, payment, database, media, deployment, or configuration work, also read the [security requirements](docs/agents/SECURITY.md).

## Universal requirements

- Never develop on or push directly to `main`. Use an isolated, agent-owned feature branch and worktree based on the latest `origin/main`.
- Never merge a pull request without explicit user authorization.
- Preserve unrelated, uncommitted work and other agents' branches and worktrees. Do not reset, delete, overwrite, stash, clean, rebase, rename, or force-push work you do not own.
- Keep changes focused and do not expand the approved task scope. Respect the existing application architecture, integrations, and security constraints.
- Never read, print, expose, embed, or commit secrets, credentials, populated environment files, private keys, tokens, or personal data.
- Do not claim tests, validation, builds, deployments, or external behavior passed unless they were actually executed and verified. Report failures and skipped checks accurately.

## Repository context

Cosmos Universe is a multi-experience 1950s Space Age / Atompunk fictional world built with Nuxt 4, Vue 3, TypeScript, Tailwind v4, and DaisyUI v5. It includes the Grand Concourse, Astro Pop storefront, Passport Office, CosmoPort Voyage, and About experiences. See [README.md](README.md) for current shipped capabilities; do not describe planned features as implemented, describe the repository as a minimal frontend, or imply fictional checkout is real-world fulfillment.

Preserve existing systems. Do not introduce services, authentication mechanisms, payment flows, or infrastructure changes without clear scope and approval.

## Completion

Summarize changed files and meaningful decisions, report checks actually performed and their limitations, and surface blockers or unresolved risks. Do not merge the PR.
