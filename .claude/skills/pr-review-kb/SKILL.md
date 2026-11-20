---
name: pr-review-kb
description: WebBee's pull request review checklist and knowledge base article style. Use this skill for every pull request review in this repository, whenever comparing new code against the base branch, sending review feedback to a developer on Zoho Cliq, or writing a Zoho Desk knowledge base article about a new feature.
---

# PR review and KB article guide

This repository is reviewed automatically on every pull request. The goal is
simple: catch real problems before they reach `main`, tell the developer
clearly how to fix them, and when the code is good, explain the new feature
to customers in plain language.

## 1. Compare the changes

- Run `git diff origin/<base>...HEAD` to see only what this PR changes.
- Summarise in 2–3 lines what is new and what existing behaviour changed.
- Read the surrounding code too, not just the diff, so you understand the impact.

## 2. Review checklist

Only report **real problems** that would cause bugs, security risks or broken
behaviour. Do not report style preferences or personal taste, because noisy
reviews make developers ignore the important ones.

Check for:

- **Bugs**: wrong logic, missing edge cases (empty input, null values, zero items).
- **Security**: hard-coded passwords or API keys, unvalidated user input,
  files or data exposed that should be private.
- **Error handling**: network/API/file calls with no failure handling.
- **Broken existing features**: the change breaks something that worked before.
- **Tests**: new logic with no test, or existing tests now failing.
- **Secrets in commits**: `.env` files, tokens, `data.json` with real data.

If a project has its own test command (for example `npm test`), run it and
include any failures.

## 3. If problems are found → message the developer

1. Find the PR author's GitHub username, then their Zoho Cliq email in
   `.claude/team.json`. If they are not listed, use `fallback_reviewer`.
2. Send **one** Cliq message in this format:

```
Hi <name>, review for your PR "<PR title>" (<PR link>):

1. <file>:<line> – <what is wrong>
   Why it matters: <one line>
   Suggested fix: <one line>

2. ...

Please fix these and push again; the review will run automatically.
```

3. Post the same review as a comment on the PR.
4. **Stop. Do not write a KB article** when there are problems.

Keep the tone friendly and specific. The developer should be able to fix
everything without asking follow-up questions.

## 4. If no problems → write the KB article

Write for customers who are **not technical**.

- No code, file names, commit IDs, API names or developer words.
- Title: what the user can now do, e.g. "How to view all your tasks in one list".
- Sections: short intro (what it is and why it helps), step-by-step "How to use it"
  with the exact button names from the screen, then 3–4 FAQs.
- Short sentences. Use "you". Bold only button names.

Then:

1. Run the app, take 2–3 screenshots of the new feature, and record a short
   screen video (under 30 seconds, under 20 MB).
2. Save in Zoho Desk Knowledge Base as a **draft**, in the `kb_category` from
   `.claude/team.json`, with screenshots in the article and the video attached.
3. Fill SEO title, meta description (under 160 characters) and 2–4 tags.
4. **Never publish.** The KB team reviews and publishes drafts.
5. Comment on the PR: "Review passed ✅ KB draft created: <link>".
