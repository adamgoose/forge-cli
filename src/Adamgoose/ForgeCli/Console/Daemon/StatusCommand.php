<?php namespace Adamgoose\ForgeCli\Console\Daemon;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class StatusCommand extends Command {

  /**
   * Configure the command
   */
  protected function configure()
  {
    $this
      ->setName('daemon:status')
      ->setDescription('Get the status of a daemon')
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
    exec('sudo supervisorctl status daemon-'.$input->getArgument('id'), $results);

    $output->writeln('<info>=== Daemon '.$input->getArgument('id').' Status ===</info>');

    foreach($results as $line)
      $output->writeln('<comment>'.$line.'</comment>');

    $output->writeln('<info>=== End of Output ===</info>');
  }
}