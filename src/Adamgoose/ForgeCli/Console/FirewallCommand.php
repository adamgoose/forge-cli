<?php namespace Adamgoose\ForgeCli\Console;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class FirewallCommand extends Command {

  /**
   * Configure the command
   */
  protected function configure()
  {
    $this
      ->setName('firewall')
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
    exec('sudo iptables -L -n', $results);

    $iptables = implode("\n", $results);

    $regex = '/Chain ufw-user-input \([0-9] references\)([\s\S]+)\nChain ufw-user-limit \([0-9] references\)/';
    preg_match($regex, $iptables, $matches);

    $output->writeln('<info>=== Beginning of Rules ===</info>');

    foreach(explode("\n", $matches[1]) as $line)
    {
      $regex = '/ACCEPT[ ]+[tcudp]{3}[ ]+--[ ]+([0-9.\/]+)[ ]+[0-9.\/]+[ ]+([tcudp]{3}) dpt:([0-9]+)/';
      if(preg_match($regex, $line, $matches))
      {
        $ip = $matches[1] == '0.0.0.0/0' ? 'any IP' : 'IP ' . $matches[1];
        $port = $matches[3];
        if($matches[2] != 'udp') // Only show every other rule
          $output->writeln('<comment>Allow port '.$port.' on '.$ip.'</comment>');
      }
    }

    $output->writeln('<info>=== End of Output ===</info>');
  }
}