# Agent workflow

## Preflight and ownership

Before editing, read `AGENTS.md` and the task-required documents it links. Inspect relevant code, tests, components, composables, routes, and documentation before changing behavior. From the checkout where work begins, run:

```sh
pwd
git rev-parse --show-toplevel
git branch --show-current
git status --short --branch
git worktree list --porcelain
```

Identify the intended working location and ownership. Treat existing worktrees, branches, and uncommitted changes as owned by someone else unless explicitly assigned. If the checkout is dirty or ownership is unclear, do not disturb it.

## Isolated branches and worktrees

Never develop directly on `main` or switch a shared checkout's branch. One agent owns one dedicated feature branch and one dedicated worktree. Use unique, descriptive names and create the branch from the latest fetched `origin/main`, not the current checkout's HEAD or a stale local `main`, unless explicitly approved otherwise.

```sh
git fetch origin main
git worktree add -b chore/descriptive-task ../cosmos-universe-descriptive-task origin/main
cd ../cosmos-universe-descriptive-task
git rev-parse --show-toplevel
git branch --show-current
git status --short --branch
```

If fetching fails, report the failure rather than claiming the branch is current. Perform edits, installs, builds, tests, commits, and pushes only in the agent-owned worktree.

## Parallel work

Do not share another agent's checkout. Never force-push, reset, rebase, rename, delete, overwrite, stash, or clean another agent's branch, worktree, or changes. Do not silently resolve uncertain ownership. Preserve unrelated changes and keep pull requests focused and reasonably small.

## Commit, push, and pull request

Before committing or pushing, recheck the worktree root, branch, and `git status --short --branch`. Follow [VALIDATION.md](VALIDATION.md) after the final source modification and [PR_REVIEW.md](PR_REVIEW.md) before creating or updating a PR.

Stage only intended files. Commit normally so the existing Husky pre-commit hook runs; never bypass hooks or validation to produce a passing PR. If a hook changes files or any additional source change is made, repeat the affected review and validation steps. Verify the final commit contains the reviewed files, push the owned branch, and open or update a focused PR targeting `main`. Never merge without explicit user authorization, and do not automatically remove worktrees or branches after completion.
