# Note-Mgr (nom for short)

A CLI for managing drafts, ideas, and notes for publishing on the web.

`note-mgr`, aka `nom`, is hungry to help you stay organized by managing your notes for you.

## Features

1. Organization: A `.index.md` file separates drafts from published notes - making it easier to hop into an unfinished draft. `.index` is also organized A->Z for both lists.
1. Draft Generation: Use the interactive command line to quickly populate the frontmatter for new notes or directly via the command options
1. Publication: A single command will move a note from draft to published. By default the note's frontmatter will be confirmed prior to publication.

## Usage

-   `-i --init` initialize `nom`
-   `-n --new <note-title>` will create a new draft and add it to the `.contents` list
-   `-p --publish <note-title>` will publish the draft, prompt for frontmatter
-   `-r --remove` will prompt for a note to remove
-   `-d --date` will interrogate the notes to understand dates of the notes (e.g., publish date)
-   `-c --count` will count the notes based on flags provided

### Initialization Options

-   "-t --target-dir <directoryPath>", "The relative path to the target directory for notes"
    ```shell
    % nom init -t path/to/target
    ```

If no target directory is passed, you will be prompted to provide one in an interactive session.

### New Note Options

-   "-c --category <category...>", "The frontmatter for category"
    ```shell
    $ nom new "the note's title" -c "note category"
    ```
-   "-d --date <date>", "The frontmatter for publish"
    ```shell
    $ nom new "the note's title" -d 2020-02-20
    ```
-   "-f --file-extension <file-extension>", "The file type for the note"
    ```shell
    $ nom new "the note's title" -f md
    ```
    **NB**: Only supports `md` currently
-   "-i --interactive", "Interactively publish a note"
    ```shell
    $ nom new -i
    # or
    $ nom new "the note's title" -i
    ```
-   "-p --publish <date>", "The frontmatter for publish"
    ```shell
    $ nom new "the note's title" -p 2020-02-20
    ```
-   "--title <title>", "The frontmatter for the title"
    ```shell
    $ nom new --title "the note's title"
    ```
-   "--custom [key:value...]", "Custom frontmatter"
    ```shell
    $ nom new "the note's title" --custom "my custom key":"my custom value" --custom "secondKey":"secondValue"
    ```
-   "--private", "The frontmatter for private", false
    ```shell
    $ nom new "the note's title" --private
    ```
-   "-t --tags <tag...>", "The frontmatter for the tags"
    ```shell
    $ nom new "the note's title" -t "tag one" -t second -t "a third"
    ```

### Publish Options

### Remove Options

### Date Options

### Count Options

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
