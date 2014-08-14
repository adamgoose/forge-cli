<?php namespace Adamgoose\ForgeCli\Console;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class GitCommand extends Command {

  /**
   * Configure the command
   */
  protected function configure()
  {
    $this
      ->setName('git')
      ->setDescription('Displays details about a site\'s git repository.')
      ->addArgument(
        'site',
        InputArgument::OPTIONAL,
        'Which site would you like to check for? i.e. test.com',
        'default'
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
    $site = $input->getArgument('site');
    $path = "/home/forge/" . $site;

    exec('(cd ' . $path . ' && git remote show origin)', $results);

    $isInstalled = preg_match('/Fetch URL: (.+)/', implode("\n", $results), $matches);
    unset($results);

    if( ! $isInstalled)
    {
      $output->writeln("<error>No git repository installed in $path</error>");
      die();
    }

    $gitUrl = $matches[1];
    unset($matches);
    preg_match('/@([\w.]+)/', $gitUrl, $matches);
    $host = $matches[1];
    unset($matches);

    exec('(cd ' . $path . ' && git branch)', $results);
    preg_match('/\* (\w+)/', implode("\n", $results), $matches);
    $branch = $matches[1];
    unset($matches);

    $output->writeln('<info>=== Git Repository Details for Site ' . $site . ' ===</info>');
    $output->writeln('Git URL: ' . $gitUrl);
    switch($host)
    {
      case 'github.com':
        $output->writeln('Repository Hosting: GitHub');
        break;
      case 'bitbucket.com':
        $output->writeln('Repository Hosting: Bitbucket');
        break;
      default:
        $output->writeln('Repository Hosting: Custom');
        break;
    }
    $output->writeln('Current Branch: '.$branch);
    $output->write('Latest Commit: ' . `(cd $path && git log --oneline -1)`);

    $output->writeln('<info>=== End of Output ===');
  }
}