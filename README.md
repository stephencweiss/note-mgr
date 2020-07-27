# Note-Mgr

A CLI for managing drafts, ideas, and notes.

`note-mgr` helps you stay organized by managing your notes for you. Notes are stored collectively in a directory of your choosing. The main features of `note-mgr` are:

1. Organization: A `.index.md` file separates drafts from published notes - making it easier to hop into an unfinished draft. `.index` is also organized A->Z for both lists.
1. Draft Generation: Use the interactive command line to quickly populate the frontmatter for new notes or directly via the command options
1. Publication: A single command will move a note from draft to published. By default the note's frontmatter will be confirmed prior to publication.

## Usage

-   `-s --setup` set the destination directory for your notes
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
$ note-mgr --help
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
