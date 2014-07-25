<?php namespace Adamgoose\ForgeCli\Console;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class JobsCommand extends Command {

  /**
   * Configure the command
   */
  protected function configure()
  {
    $this
      ->setName('jobs')
      ->setDescription('List the scheduled jobs configured by Forge');
  }

  /**
   * @param InputInterface  $input
   * @param OutputInterface $output
   *
   * @return void
   */
  protected function execute(InputInterface $input, OutputInterface $output)
  {
    $file = '/etc/crontab';

    $crontab = file_get_contents($file);

    $regex = '/# Laravel Forge Scheduler ([1-9]+)\n(.+)/';
    preg_match_all($regex, $crontab, $jobs);

    foreach($jobs[0] as $index => $match)
    {
      $output->writeln('<info>=== Job ID '.$jobs[1][$index].' ===');
      $output->writeln('<comment>' . $jobs[2][$index] . '</comment>');
    }

    $output->writeln('<info>=== End of Output ===</info>');
  }
}