# Workflow

How changes reach `main`, and how versions are cut.

## Branches

`main` is always deployable: every push to it publishes the site. Work happens on short-lived branches named after the kind of change:

| Prefix | For | Example |
|---|---|---|
| `post/` | a new post or a series of posts | `post/apache-ossie-open-semantic-stack` |
| `feat/` | a new capability of the site | `feat/series-pdf-download` |
| `fix/` | a bug | `fix/hero-contrast-dark-mode` |
| `perf/` | speed or size | `perf/lazy-mermaid` |
| `docs/` | documentation only | `docs/authoring-math-rules` |
| `ci/` | workflows and repository tooling | `ci/pages-actions` |
| `chore/` | maintenance with no visible effect | `chore/upgrade-tailwind` |

```bash
git switch main && git pull
git switch -c post/my-new-post
# ...commit...
git push -u origin post/my-new-post
gh pr create --fill
```

Branches are deleted automatically when their PR merges. Work that is set aside without merging is kept as an `archive/<name>` tag rather than a stale branch:

```bash
git tag -a archive/projects-redesign feat/projects-redesign -m "Why it was set aside"
git switch -c feat/projects-redesign archive/projects-redesign   # to resume it
```

## Pull requests

`main` accepts changes only through pull requests, merged by squash.

- **CI must pass.** The `CI` workflow runs the same checks as a deploy (content consistency, unit tests, link check, production build) without publishing.
- **The PR title becomes the commit.** Write it as a [Conventional Commit](https://www.conventionalcommits.org/): `type(scope): summary`, under 72 characters, e.g. `fix(seo): serve all routes with 200`.
- **No reviewer is required.** This is a solo project; the PR exists for the CI gate and the record.

Force-pushing and deleting `main` are blocked. As repository admin you can bypass the rules for an emergency fix; use it rarely.

## Versions

The site is versioned with [Semantic Versioning](https://semver.org/) on annotated `vX.Y.Z` tags, each with a GitHub Release.

| Bump | When | Past examples |
|---|---|---|
| **Major** | Something existing readers notice breaking or changing everywhere: the URL scheme, the visual identity | `v2.0.0` clean URLs, `v3.0.0` editorial redesign |
| **Minor** | A new capability of the site | `v3.1.0` books and papers, `v3.3.0` print editions |
| **Patch** | Fixes and performance work with no new capability | |

New posts do not need a version on their own. A release covers the site's code, and posts ship continuously.

To cut a release from `main`:

```bash
git switch main && git pull
git tag -a v3.5.0 -m "v3.5.0: Short title"
git push origin v3.5.0
gh release create v3.5.0 --title "v3.5.0 · Short title" --generate-notes
```

Edit the generated notes into a few lines in the house style: what changed for a reader, with numbers where they exist. See existing releases for the tone.

## Deployments

Merging to `main` runs the `Deploy` workflow, which builds the site and publishes it through GitHub Pages' Actions deployment. There is no deploy branch. The workflow summary shows the post count and site size of each build.
