# Forge-CLI for Laravel Forge

This Command Line Interface allows Laravel Forge users to review the Forge Configuration on their server.

## Installation

To install Forge-CLI, execute the following commands:

    $ wget https://raw.githubusercontent.com/adamgoose/forge-cli/master/dist/forge-cli.phar
    $ sudo mv forge-cli.phar /usr/local/bin/forge
    $ sudo chmod +x /usr/local/bin/forge

## Usage

Once installed, you can retreive a list of available commands by executing `forge list`.

For help on a specific command, execute `forge help [command_name]`.

## Contributing

To contribute to this repository, please follow PSR-4 autoloading standards. Follow these steps to get started:

1. Clone the repository.
2. Install `phar-composer.phar` by following instructions [here](https://github.com/clue/phar-composer).
3. Makge changes to the code.
4. Build your changes by running `./build.sh`.

You can add custom post-build hooks by creating executable `*.sh` files in the `post-build-hooks` directory. For example, you could create a `deploy.sh` file that looks something like this:

    scp dist/forge-cli.phar forge@my-forge-server.com:/home/forge