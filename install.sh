if [ `/usr/bin/id -u` -ne 0 ]; then
    echo 'Please, run this script as root'
    exit 1
fi

wget https://raw.githubusercontent.com/adamgoose/forge-cli/master/dist/forge-cli.phar
sudo mv forge-cli.phar /usr/local/bin/forge
sudo chmod +x /usr/local/bin/forge
