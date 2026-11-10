# commit-as

A small Node script that makes a git commit under a fixed author identity, without changing your git config.

Use it only with the consent of the person whose name and email you set. Commits made this way show that person as the author on GitHub.

## Requirements

- Node.js 16 or newer
- Git

No packages to install.

## Setup (once per project)

1. Copy `commit-as.mjs` into the project at `scripts/commit-as.mjs`.
2. Open it and set the two values at the top:

   ```js
   const AUTHOR_NAME = "His Name";
   const AUTHOR_EMAIL = "email-verified-on-his-github-account@example.com";
   ```

   The email must be one listed under GitHub → Settings → Emails on his account, or his GitHub noreply address from that page.

3. Optional: keep the script out of the repo by adding this line to `.gitignore`:

   ```
   scripts/commit-as.mjs
   ```

   Otherwise the script, with his email in it, is committed along with everything else the first time you use `--all`.

## Usage

Run from anywhere inside the project:

```bash
node scripts/commit-as.mjs "Fix header" --all --push
```

| Command | What it does |
| --- | --- |
| `node scripts/commit-as.mjs "message"` | Commits what is already staged |
| `node scripts/commit-as.mjs "message" --all` | Stages every change, then commits |
| `node scripts/commit-as.mjs "message" --push` | Commits, then pushes |
| `node scripts/commit-as.mjs --empty --push` | Makes an empty commit and pushes, to re-trigger a deploy |

Flags can be combined. After each commit the script prints the author it used:

```
Committed as: His Name <his-email>
```

### Optional npm shortcut

Add this to the project's `package.json`:

```json
"scripts": {
  "commit:as": "node scripts/commit-as.mjs"
}
```

Then:

```bash
npm run commit:as -- "Fix header" --all --push
```

## How it works

The script runs `git -c user.name=... -c user.email=... commit`, which applies the identity to that single command. Both the author and the committer are set to the configured identity. Your repo and global git config are not modified.

## Things to know

- **Only commits made through the script carry the configured name.** Commits made the normal way, including from the VS Code Source Control panel, use your own identity.
- **Pushing uses your own GitHub login.** Your account needs push access to the repo.
- **This is not a cryptographic signature.** The commits will not get GitHub's "Verified" badge, and they show as "Unverified" if his account has vigilant mode on.
- **Vercel may block it.** On the Hobby plan, Vercel only deploys commits from the project owner on private repos and treats working around its limits as a fair-use violation. This approach may stop working without notice.

## Errors

| Message | Fix |
| --- | --- |
| `set AUTHOR_NAME and AUTHOR_EMAIL at the top of this script first.` | Replace the placeholder values |
| `not inside a git repository.` | Run it from inside the project folder |
| `nothing is staged. Stage files first, or pass --all.` | Run `git add` on the files, or add `--all` |
| `give a commit message` | Pass a message in quotes, or use `--empty` |
| `git push failed` | The commit was made; fix the push problem and run `git push` |
