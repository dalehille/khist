# khist

khist is a project that wraps the kubectl command and captures its output. It stores the timestamp, command, output, and output size in a SQLite database. This tool is especially useful for debugging and auditing purposes in a Kubernetes environment.

You can interact with the history in three ways:

1. Via the built-in web interface which provides a user-friendly way to view the history.

![khist first](khist-intro-ui.png)

![khist UI](khist-ui.png)

2. Using getData.sh with `fzf` for a fuzzy search through the history.

![shell](khist-cli.png)

3. Directly via the SQLite database with your own code


## Getting Started

- clone this repo
- edit your .zshrc , .bashrc or equivalent for your shell and add an alist to the khist.sh script or to the khist binary

ex:
```shell
cp go/khist_mac_m1 /usr/local/bin/khist
alias k=khist
# or
# alias k=/Users/you/kubecapture/khist.sh

alias kd='k get deploy'
alias kp='k get pods'

# or without an alias:
./khist get pods -A

```
- connect to your clusters and use kubectl as you normally would. Your commands and their output are stored in db files in your home directory in a `.khist` directory.

## start the backend
```shell
cd node
npm install
npm run dev
```

## start the ui
```shell
cd ui
npm install
npm run dev

open http://localhost:5173
```

### Prerequisites

- [sqlite3](https://www.sqlite.org/index.html) if you're using khist.sh

- npm and nodejs if you want to run the web interface

## Compatibility

This project has been tested on an M1 Mac. However, Go binaries are provided for both Intel Mac and Linux platforms. While these binaries are available, they may not have been tested. Your feedback and contributions to improve compatibility are welcome.

For Windows users, the project might work if you're using the Windows Subsystem for Linux (WSL). In this case, you should use the `khist.sh` script instead of the `khist` binary. Please note that this has not been tested and feedback is appreciated.

## Why

While the `history` command in a shell provides a list of commands that have been entered, it doesn't provide any of the output from those commands. This can make it difficult to recall exactly what was returned from a specific command, especially when debugging or auditing. khist addresses this issue by not only capturing the commands entered but also their output.

khist also maintains a separate history for each k8s context. This means that you can have a distinct record of commands for each cluster you interact with. This feature enhances the tool's utility in multi-cluster environments, allowing for precise tracking and auditing of actions on a per-cluster basis.

