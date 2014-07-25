<?php namespace Adamgoose\ForgeCli\Console;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Finder\Finder;

class DaemonsCommand extends Command {

  /**
   * Configure the command
   */
  protected function configure()
  {
    $this
      ->setName('daemons')
      ->setDescription('List the daemons configured by Forge');
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
    $path = '/etc/supervisor/conf.d';

    $finder->files()->in($path)->sortByName();

    foreach($finder as $file)
    {
      $output->writeln('<info>=== Daemon '.str_replace(['daemon-', '.conf'], '', $file->getFilename()).' ===');
      $output->write('<comment>' . $file->getContents() . '</comment>');
    }

    $output->writeln('<info>=== End of Output ===</info>');
  }
}