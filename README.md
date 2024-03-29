# khist

khist wraps the kubectl command and captures its output. It stores the timestamp, command, output, and output size in a SQLite database. This tool is especially useful for debugging and auditing purposes in a Kubernetes environment.

You can interact with the history in three ways:

1. Via the built-in web interface which provides a user-friendly way to view the history.

![khist first](khist-intro-ui.png)

![khist UI](khist-ui.png)

2. Using getData.sh with `fzf` for a fuzzy search through the history.

![shell](khist-cli.png)

3. Directly via the SQLite database with your own code


## Getting Started

- Download the [latest releaese](https://github.com/dalehille/khist/releases) for your platform to get the khist binary
- Edit your .zshrc , .bashrc or equivalent and add an alias to khist 
- Clone this repo to run the ui

example:
```shell
# get the latest release 
wget https://github.com/dalehille/khist/releases/download/v0.1.0/khist_mac_m1.tar.gz
tar -xvf khist_mac_m1.tar.gz

# connect to a k8s cluster and run a command to make sure it works
./khist_mac_m1 get pods

# copy to a bin directory on your PATH
cp khist_mac_m1 /usr/local/bin/khist

# set whatever alias you want
alias k=khist
k get pods
```

- Now your commands and their output are stored in `.db` files in your home directory in a `.khist` directory.

## start the backend and ui
```shell
./start.sh
```

### Prerequisites

- npm and nodejs if you want to run the web interface


## Compatibility

This project has been tested on an M1 and Intel Mac. 

## Why

While the `history` command in a shell provides a list of commands that have been entered, it doesn't provide any of the output from those commands. This can make it difficult to recall exactly what was returned from a specific command, especially when debugging or auditing. khist addresses this issue by not only capturing the commands entered but also their output.

khist also maintains a separate history for each k8s context. This means that you can have a distinct record of commands for each cluster you interact with. This feature enhances the tool's utility in multi-cluster environments, allowing for precise tracking and auditing of actions on a per-cluster basis.

