<?php namespace Adamgoose\ForgeCli\Console\Daemon;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class RestartCommand extends Command {

  /**
   * Configure the command
   */
  protected function configure()
  {
    $this
      ->setName('daemon:restart')
      ->setDescription('Restart a daemon')
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
    $output->writeln('<info>=== Restart Daemon '.$input->getArgument('id').' ===</info>');

    exec('sudo supervisorctl restart daemon-'.$input->getArgument('id'), $results);

    foreach($results as $line)
      $output->writeln('<comment>'.$line.'</comment>');

    $output->writeln('<info>=== End of Output ===</info>');
  }
}