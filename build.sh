(cd dist && php -d phar.readonly=off ../phar-composer.phar build ../)

## Execute Post-Deploy Hooks
./post-build-hooks/*.sh