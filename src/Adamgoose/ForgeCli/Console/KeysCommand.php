<?php namespace Adamgoose\ForgeCli\Console;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class KeysCommand extends Command {

  /**
   * Configure the command
   */
  protected function configure()
  {
    $this
      ->setName('keys')
      ->setDescription('List the SSH Keys configured by Forge');
  }

  /**
   * @param InputInterface  $input
   * @param OutputInterface $output
   *
   * @return void
   */
  protected function execute(InputInterface $input, OutputInterface $output)
  {
    $file = '/home/forge/.ssh/authorized_keys';

    $authorized = file_get_contents($file);

    $regex = '/# (.+)\n(.+)/';
    preg_match_all($regex, $authorized, $keys);

    foreach($keys[0] as $index => $match)
    {
      if($keys[1][$index] != 'Laravel Forge')
      {
        $output->writeln('<info>=== Key Name: ' . $keys[1][$index] . ' ===');
        $output->writeln('<comment>' . $keys[2][$index] . '</comment>');
      }
    }

    $output->writeln('<info>=== End of Output ===</info>');
  }
}