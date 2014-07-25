<?php namespace Adamgoose\ForgeCli\Console;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class MonitoringCommand extends Command {

  /**
   * Configure the command
   */
  protected function configure()
  {
    $this
      ->setName('monitoring')
      ->setDescription('Describe Monitoring Services configured by Forge');
  }

  /**
   * @param InputInterface  $input
   * @param OutputInterface $output
   *
   * @return void
   */
  protected function execute(InputInterface $input, OutputInterface $output)
  {
    try
    {
      $config = file_get_contents('/etc/php5/fpm/conf.d/newrelic.ini');
    } catch(\Exception $e)
    {
      $output->writeln('<comment>NewRelic not installed.</comment>');
      die();
    }

    $output->writeln('<info>=== NewRelic Config ===');

    if(preg_match('/newrelic.license = "(.+)"/', $config, $results))
    {
      $output->writeln('<comment>Licence: ' . $results[1] . '</comment>');
    }
    else
      $output->writeln('<comment>Cannot determine NewRelic License</comment>');

    $output->writeln('<info>=== End of Output ===</info>');
  }
}