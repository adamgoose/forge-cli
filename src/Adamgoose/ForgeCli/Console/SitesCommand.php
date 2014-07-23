<?php namespace Adamgoose\ForgeCli\Console;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Finder\Finder;

class SitesCommand extends Command {

  /**
   * Configure the command
   */
  protected function configure()
  {
    $this
      ->setName('sites')
      ->setDescription('List the sites configured by Forge');
  }

  /**
   * @param InputInterface  $input
   * @param OutputInterface $output
   *
   * @return void
   */
  protected function execute(InputInterface $input, OutputInterface $output)
  {
    $finder = new Finder();
    $path = '/etc/nginx/sites-enabled';

    $finder->files()->in($path)->sortByName();

    $output->writeln('<info>=== /etc/nginx/sites-enabled ===');

    foreach($finder as $file)
      $output->writeln('<comment>'.$file->getFilename().'</comment>');

    $output->writeln('<info>=== End of Output ===</info>');
  }
}