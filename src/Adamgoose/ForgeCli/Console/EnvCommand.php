<?php namespace Adamgoose\ForgeCli\Console;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Finder\Finder;

class EnvCommand extends Command {

  /**
   * Configure the command
   */
  protected function configure()
  {
    $this
      ->setName('env')
      ->setDescription('Get a list of Environment Variables')
      ->addArgument(
        'site',
        InputArgument::REQUIRED,
        'Which site would you like to check for? i.e. test.com'
      )
      ->addArgument(
        'environment',
        InputArgument::OPTIONAL,
        'Which environment would you like to check for?'
      );
  }

  /**
   * @param InputInterface  $input
   * @param OutputInterface $output
   *
   * @return void
   */
  protected function execute(InputInterface $input, OutputInterface $output)
  {
    $path = '/home/forge/'.$input->getArgument('site').'/';
    $environmentString = $input->getArgument('environment') ? '.'.$input->getArgument('environment') : null;
    $file = '.env'.$environmentString.'.php';

    $vars = require $path.$file;

    $output->writeln('<info>=== '.$file.' ===</info>');

    foreach($vars as $key => $value)
      $output->writeln("<comment>$key => $value</comment>");

    $output->writeln('<info>=== End of Environment Variables ===</info>');
  }
}