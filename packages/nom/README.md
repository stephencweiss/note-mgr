note-mgr-cli
============

A markdown note management tool

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/note-mgr-cli.svg)](https://npmjs.org/package/note-mgr-cli)
[![Codecov](https://codecov.io/gh/stephencweiss/note-mgr-cli/branch/master/graph/badge.svg)](https://codecov.io/gh/stephencweiss/note-mgr-cli)
[![Downloads/week](https://img.shields.io/npm/dw/note-mgr-cli.svg)](https://npmjs.org/package/note-mgr-cli)
[![License](https://img.shields.io/npm/l/note-mgr-cli.svg)](https://github.com/stephencweiss/note-mgr-cli/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g note-mgr-cli
$ nom COMMAND
running command...
$ nom (-v|--version|version)
note-mgr-cli/0.0.5 darwin-x64 node-v12.18.3
$ nom --help [COMMAND]
USAGE
  $ nom COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`nom hello [FILE]`](#nom-hello-file)
* [`nom help [COMMAND]`](#nom-help-command)

## `nom hello [FILE]`

describe the command here

```
USAGE
  $ nom hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ nom hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/stephencweiss/note-mgr-cli/blob/v0.0.5/src/commands/hello.ts)_

## `nom help [COMMAND]`

display help for nom

```
USAGE
  $ nom help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.0/src/commands/help.ts)_
<!-- commandsstop -->
