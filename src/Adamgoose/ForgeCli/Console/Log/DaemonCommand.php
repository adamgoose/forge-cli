<?php namespace Adamgoose\ForgeCli\Console\Log;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class DaemonCommand extends Command {

  /**
   * Configure the command
   */
  protected function configure()
  {
    $this
      ->setName('log:daemon')
      ->setDescription('Get the latest log for a daemon')
      ->addArgument(
        'id',
        InputArgument::REQUIRED,
        'The ID of the daemon.'
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
    $path = '/home/forge/.forge/';
    $name = 'daemon-' . $input->getArgument('id') . '.log';

    if( ! file_exists($path . $name)):

      $output->writeln('<error>A log for the daemon cannot be found</error>');

    else:

      $output->writeln('<info>=== ' . $name . ' ===</info>');

      $output->write('<comment>' . file_get_contents($path . $name) . '</comment>');

      $output->writeln('<info>=== End of Log ===</info>');

    endif;
  }
}