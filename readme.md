# Forge-CLI for Laravel Forge

This Command Line Interface allows Laravel Forge users to review the Forge Configuration on their server.

## Installation

To install Forge-CLI, execute the following command on your Forge server:

    wget https://raw.githubusercontent.com/adamgoose/forge-cli/master/install.sh | bash

## Usage

```
Console Tool

Usage:
  [options] command [arguments]

Options:
  --help           -h Display this help message.
  --quiet          -q Do not output any message.
  --verbose        -v|vv|vvv Increase the verbosity of messages: 1 for normal output, 2 for more verbose output and 3 for debug
  --version        -V Display this application version.
  --ansi              Force ANSI output.
  --no-ansi           Disable ANSI output.
  --no-interaction -n Do not ask any interactive question.

Available commands:
  cake             ??
  daemons          List the daemons configured by Forge
  env              Get a list of Environment Variables
  firewall         Get the public and private IPs for this server
  git              Displays details about a site's git repository.
  help             Displays help for a command
  ip               Get the public and private IPs for this server
  jobs             List the scheduled jobs configured by Forge
  keys             List the SSH Keys configured by Forge
  list             Lists commands
  monitoring       Describe Monitoring Services configured by Forge
  self-update      Update Forge CLI
  sites            List the sites configured by Forge
daemon
  daemon:restart   Restart a daemon
  daemon:status    Get the status of a daemon
log
  log:daemon       Get the latest log for a daemon
  log:deploy       Get the latest deploy log
  log:job          Get the latest log for a scheduled job 
```

## Contributing

To contribute to this repository, please follow PSR-4 autoloading standards. Follow these steps to get started:

1. Clone the repository.
2. Install `phar-composer.phar` by following instructions [here](https://github.com/clue/phar-composer).
3. Makge changes to the code.
4. Build your changes by running `./build.sh`.

You can add custom post-build hooks by creating executable `*.sh` files in the `post-build-hooks` directory. For example, you could create a `deploy.sh` file that looks something like this:

    scp dist/forge-cli.phar forge@my-forge-server.com:/home/forge
