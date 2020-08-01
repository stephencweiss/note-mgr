# Note-Mgr (nom for short)

A CLI for managing drafts, ideas, and notes.

`note-mgr`, aka `nom`, is hungry to help you stay organized by managing your notes for you.

## Features

1. Organization: A `.index.md` file separates drafts from published notes - making it easier to hop into an unfinished draft. `.index` is also organized A->Z for both lists.
1. Draft Generation: Use the interactive command line to quickly populate the frontmatter for new notes or directly via the command options
1. Publication: A single command will move a note from draft to published. By default the note's frontmatter will be confirmed prior to publication.

## Usage

-   `-i --init` initialize `nom`
-   **WIP** `-c --create-draft <note-title>` will create a new draft and add it to the `.ideas` list
-   **WIP** `-p --publish <note-title>` will publish the draft, remove it from the `.ideas` list, prompt for frontmatter
-   **WIP** `-l --last-published` will interrogate the notes folder to find the latest `publish` date among the notes

## Installation

To use the CLI, install it globally:

```shell
$ yarn global add note-mgr
```

Then use it from the command line:

```shell
$ nom --help
```

## Local Development

`yarn build && yarn start` will launch the application locally.

If you want the experience of a globally installed CLI, create a link using `yarn link` from the root of the project. When done, clean up the link with `yarn unlink`.

### Troubleshooting

If you run into a `permission denied` error, make sure the script is executable:

```shell
zsh: permission denied: note-mgr
$ chmod +x index.js
```

## Reading Commit Logs

This project follows [SemVer](https://semver.org/) and an adaptation of the [conventional commit](https://www.conventionalcommits.org/en/v1.0.0/#specification) standard.

Commits are prefixed with the following emoji to indicate their purpose.

| Symbol | Interpretation           |
| ------ | ------------------------ |
| ✨     | feature                  |
| 🐛     | fix                      |
| 💅     | style                    |
| 🧼     | chore                    |
| 📝     | docs                     |
| 🐎     | perf                     |
| 🧪     | test                     |
| 🏗️     | refactor                 |
| 🧰     | tooling / infrastructure |
| 🚀     | major version bump       |
| 📦     | minor version bump       |
