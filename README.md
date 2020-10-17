# Note-Mgr (aka nom)

`nom` is a CLI for managing notes written in markdown. Designed with publishing and searching in mind.

## Features

1. Organization: A `.index.md` file separates drafts from published notes - making it easier to hop into an unfinished draft. `.index` is also organized A->Z for both lists.
1. Draft Generation: Use the interactive command line to quickly populate the frontmatter for new notes or directly via the command options
1. Publication: A single command will move a note from draft to published. By default the note's frontmatter will be confirmed prior to publication.

## Getting Started

To use the CLI, install it globally:

```shell
$ yarn global add note-mgr-cli
# or
$ npm install note-mgr-cli --global
```

At this point, `nom` will be installed. You can confirm by seeing the help menu

```shell
$ nom --help
```

Before using `nom`, it must be initialized with `nom init`

![nom init gif](https://res.cloudinary.com/scweiss1/image/upload/v1599344327/code-comments/nom-init-min_bgytqy.gif)

## Usage

-   `-i --init` initialize `nom`
-   `-n --new` will create a new note and add it to the `.contents` list
-   `-u --update` will update the frontmatter for the selected note
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

![nom new](https://res.cloudinary.com/scweiss1/image/upload/v1599344326/code-comments/nom-new-min_ouv32q.gif)

To create a new note, at a minimum `nom` requires _either_ a title (`-t --title`) _or_ to create the note interactively (`-i --interactive`).

![nom new interactive](https://res.cloudinary.com/scweiss1/image/upload/v1599344326/code-comments/nom-new-interactive-min_nxqo6g.gif)
All options are available for setting declaratively with the following options:

-   "-c --category <category...>", "The frontmatter for category"

    ```shell
    $ nom new -c "note category"
    ```

-   "-d --date <date>", "The frontmatter for publish"

    ```shell
    $ nom new -d 2020-02-20
    ```

-   "-i --interactive", "Interactively publish a note"

    ```shell
    $ nom new -i
    ```

-   "-p --publish <date>", "The frontmatter for publish"

    ```shell
    $ nom new -p 2020-02-20
    ```

-   "-t --title \<title>", "The frontmatter for the title"

    ```shell
    $ nom new --title "the note's title"
    ```

-   "--private", "Mark the note private"

    ```shell
    $ nom new --private
    ```

-   "--tags <tag...>", "The frontmatter for the tags"

    ```shell
    $ nom new --tag "tag one" --tag second --tag "a third"
    ```

### Update Options

![nom update --interactive](https://res.cloudinary.com/scweiss1/image/upload/v1599344327/code-comments/nom-update-min_e4ymdu.gif)

The `nom update` command _begins_ by finding a note interactively using a fuzzy search of all files within the notes directory. The search is based on the _file name_, which is tied to the [slug of the note](https://github.com/stephencweiss/note-mgr/issues/38).

**Nota Bene**: If a note is _not_ updated interactively, _only_ the options passed in from the command line will be updated. So, if no options are passed, nothing will get updated, even after the note is selected.

To update a new note, at a minimum `nom` requires _either_ a title (`-t --title`) _or_ to create the note interactively (`-i --interactive`). All options are available for setting declaratively with the following options:

-   "-c --category <category...>", "The frontmatter for category"

    ```shell
    $ nom update -c "note category"
    ```

-   "-d --date <date>", "The frontmatter for publish"

    ```shell
    $ nom update -d 2020-02-20
    ```

-   "-i --interactive", "Interactively publish a note"

    ```shell
    $ nom update --interactive
    ```

-   "-p --publish <date>", "The frontmatter for publish"

    ```shell
    $ nom update -p 2020-02-20
    ```

-   "-t --title \<title>", "The frontmatter for the title"

    ```shell
    $ nom update --title "the note's title"
    ```

-   "--private", "Mark the note private"

    ```shell
    $ nom update --private
    ```

-   "--tag <tag...>", "The frontmatter for the tags"

    ```shell
    $ nom update --tag "tag one" --tag second --tag "a third"
    ```

### Remove Options

`nom` has a built in `remove` method for deleting notes that are no longer desired. The process is interactive by default.

**Nota Bene**: Use caution as this is a _destructive_ action. It cannot currently be undone. There's an open issue to make [remove a soft delete](https://github.com/stephencweiss/note-mgr/issues/39).

### Date Options

The `date` command for `nom` is intended to identify certain relevant dates quickly.

-   "-f --first", "Return the earliest published note"

    ```shell
    $ nom date --first
    ```

-   "-l --latest", "(Default) Return the latest published note"

    ```shell
    $ nom date --latest
    ```

-   "-r --recent", "Return the most recent published note in the past"

    ```shell
    $ nom date --recent
    ```

-   [WIP](https://github.com/stephencweiss/note-mgr/issues/23) "-p --private", "Filters only for private notes" and "-np --no-private", "Filters only for public notes"
    These options are intended to be used in conjunction with other date filters.

    ```
    $ nom date --recent --private
    # or
    $ nom date --latest --no-private
    ```

### Count Options

Similar to dates, the `count` command in `nom` is intended to aid simply querying of your notes. It does _not_ currently support stacking of counters (e.g., `nom count --stage --category` will list the counts by stage and category independently).

## Local Development

This project uses `yarn` to manage dependencies.

`yarn build && yarn start` will launch the application locally.

If you want the experience of a globally installed CLI, create a link using `yarn link` from the root of the project. When done, clean up the link with `yarn unlink`.

### Troubleshooting

If you run into a `permission denied` error, make sure the script is executable:

```shell
zsh: permission denied: note-mgr
$ chmod +x index.js
```

## Commit Log Standards

This project follows [SemVer](https://semver.org/) and an adaptation of the [conventional commit](https://www.conventionalcommits.org/en/v1.0.0/#specification) standard.

Commits are prefixed with the following emoji to indicate their purpose.

| Symbol | code                      | Interpretation           |
| ------ | ------------------------- | ------------------------ |
| ✨     | `:sparkles:`              | feature                  |
| 🐛     | `:bug:`                   | fix                      |
| 💅     | `:nail-polish:`           | style                    |
| 🧼     | `:soap:`                  | chore                    |
| 📝     | `:memo:`                  | docs                     |
| 🐎     | `:racehorse:`             | perf                     |
| 🧪     | `:lab:`                   | test                     |
| 🏗️     | `:building-construction:` | refactor                 |
| 🧰     | `:toolbox:`               | tooling / infrastructure |
| 🚀     | `:rocket:`                | major version bump       |
| 📦     | `:package:`               | minor version bump       |
