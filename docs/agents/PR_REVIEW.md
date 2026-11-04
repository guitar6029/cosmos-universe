# Pull request review checklist

Read this checklist before creating or updating a PR.

- [ ] Complete all source modifications, then run the required validation in [VALIDATION.md](VALIDATION.md), including task-relevant E2E, build, Studio, or Worker checks.
- [ ] Review the complete working diff with `git diff`; confirm only intended files changed and inspect every newly created file.
- [ ] Look for accidental command output, shell errors, stack traces, merge-conflict markers, malformed source, generated files, and unrelated formatting changes.
- [ ] Recheck the worktree root, branch, and `git status --short --branch`; preserve all unrelated changes.
- [ ] Stage only intended changes, then inspect `git diff --cached --check` and `git diff --cached` before committing.
- [ ] Commit normally with the existing Husky pre-commit hook enabled. If it modifies files or fails, address the result and rerun affected checks and staged-diff review.
- [ ] Verify the final commit contains the intended files with `git show --stat` and `git show --check`.
- [ ] Push the reviewed, agent-owned branch and verify the remote branch contains that final commit.
- [ ] Open or update a focused PR targeting `main`, without merging it.
- [ ] Verify required GitHub Actions results before considering the PR ready to merge.
- [ ] Report actual validation and CI outcomes, including failures, skipped checks, and limitations. Never state an unrun check passed.
