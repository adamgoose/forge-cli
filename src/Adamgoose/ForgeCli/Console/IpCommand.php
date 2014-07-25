<?php namespace Adamgoose\ForgeCli\Console;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class IpCommand extends Command {

  /**
   * Configure the command
   */
  protected function configure()
  {
    $this
      ->setName('ip')
      ->setDescription('Get the public and private IPs for this server');
  }

  /**
   * @param InputInterface  $input
   * @param OutputInterface $output
   *
   * @return void
   */
  protected function execute(InputInterface $input, OutputInterface $output)
  {
    exec('ifconfig', $results);

    $ifconfig = implode("\n", $results);
    $regex = '/eth[0-1][\sA-z:0-9]+inet addr:([0-9.]+)/';
    preg_match_all($regex, $ifconfig, $ips);

    $output->writeln('<info>=== Begin IPs ===</info>');
    $output->writeln('<comment>Public IP:  '.$ips[1][0].'</comment>');
    $output->writeln('<comment>Private IP: '.$ips[1][1].'</comment>');
    $output->writeln('<info>=== End of Output ===</info>');
  }
}