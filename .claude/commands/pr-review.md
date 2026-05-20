---
name: pr-review
description: Review a pull request — analyze the diff and post a structured code review via gh CLI
---

Review pull request **#$ARGUMENTS** and post a detailed code review.

## Your workflow

Run each step using the Bash tool:

1. **Get PR details**
   ```
   gh pr view $ARGUMENTS --json title,body,author,baseRefName,headRefName,state,url
   ```

2. **Get changed files**
   ```
   gh pr view $ARGUMENTS --json files
   ```

3. **Get the full diff**
   ```
   gh pr diff $ARGUMENTS
   ```

4. **Read files for context** (if needed)
   Use the Read tool to open specific files when you need surrounding code not visible in the diff.

5. **Post the review**
   ```
   gh pr review $ARGUMENTS --approve --body "<review>"
   gh pr review $ARGUMENTS --request-changes --body "<review>"
   gh pr review $ARGUMENTS --comment --body "<review>"
   ```

## What to look for

- **Correctness** — logic errors, edge cases, null/undefined handling
- **Security** — unvalidated inputs at API boundaries, exposed secrets
- **TypeScript** — unsafe casts, missing types, unhandled nulls
- **React/Next.js** — correct client vs server component usage, hooks rules, missing `"use client"`, unnecessary re-renders
- **Data fetching** — loading/error states, cache invalidation
- **Consistency** — follows existing patterns: `cn()` for classes, Zod validation on API routes, shadcn/ui primitives

## Review body format

```markdown
## Overview
One paragraph: what this PR does and overall quality assessment.

## Issues

### 🔴 Critical (must fix before merge)
- `path/to/file.ts` — description of the issue

### 🟡 Suggestions (worth addressing)
- `path/to/file.ts` — description

### ✅ What's working well
- Specific things done well

## Verdict
One sentence explaining the decision.
```

## Posting guidance

- **APPROVE** — code is correct and ready to merge
- **REQUEST_CHANGES** — there are critical issues that must be fixed
- **COMMENT** — informational feedback, no blocking issues

## Project context

- **Stack:** Next.js (App Router) + React + TypeScript, Tailwind CSS + shadcn/ui, Supabase
- **Main branch:** `wordpress-plugin`
- **API routes** validate inputs and return typed JSON
- **Client components** use `"use client"`
- **UI primitives** live in `components/ui/` — prefer extending shadcn/ui over writing new components
