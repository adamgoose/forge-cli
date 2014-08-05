<?php namespace Adamgoose\ForgeCli\Console;

use Exception;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\Filesystem;

class SelfUpdateCommand extends Command {

  /**
   * Source URL
   * @var string
   */
  const SRC = 'https://raw.githubusercontent.com/adamgoose/forge-cli/master/dist/forge-cli.phar';

  /**
   * @var ProgressBar|null
   */
  protected $progress = null;

  /**
   * Configure the command
   */
  protected function configure()
  {
    $this
      ->setName('self-update')
      ->setDescription('Update Forge CLI');
  }

  /**
   * @param InputInterface  $input
   * @param OutputInterface $output
   *
   * @throws Exception
   * @return void
   */
  protected function execute(InputInterface $input, OutputInterface $output)
  {
    $fs = new Filesystem();
    $localFilename = realpath($_SERVER['argv'][0]) ?: $_SERVER['argv'][0];
    $tmpDir = dirname($localFilename);
    $tmpFilename = 'forge-cli-tmp.phar';
    $tmpFilepath = $tmpDir . '/' . $tmpFilename;

    if(!is_writable($tmpDir))
      throw new Exception('Forge update failed: "'.$tmpDir.'" is not writable. Try `sudo !!`.');
    if(!is_writable($localFilename))
      throw new Exception('Forge update failed: "'.$localFilename.'" is not writable. Try `sudo !!`.');

    $output->writeln('<info>Updating '.$localFilename.'...</info>');

    $file = file_get_contents(self::SRC, false, $this->createStreamContext($output));

    $fs->dumpFile($tmpFilepath, $file, true);

    if($fs->exists($tmpFilepath))
    {
      $fs->rename($tmpFilepath, $localFilename, true);
      $fs->remove($tmpFilepath);
      $fs->chmod($localFilename, 0777);
      $output->writeln('<info>Update completed!</info>');
    }
    else
    {
      throw new Exception('Update Failed...');
    }
  }

  /**
   * @param OutputInterface $output
   *
   * @return resource
   */
  protected function createStreamContext(OutputInterface $output)
  {
    $ctx = stream_context_create([], [
      'notification' => function ($code, $severity, $message, $message_code, $bytesTransferred, $bytesMax) use ($output)
      {
        switch($code)
        {
          case STREAM_NOTIFY_FILE_SIZE_IS:
            $this->progress = new ProgressBar($output, $bytesMax);
            $this->progress->setBarWidth(75);
            $this->progress->start();
            break;
          case STREAM_NOTIFY_PROGRESS:
            $this->progress->setCurrent($bytesTransferred);

            if($bytesTransferred == $bytesMax)
            {
              $this->progress->finish();
              $output->writeln('');
            }
            break;
          case STREAM_NOTIFY_COMPLETED:
            $this->progress->finish();
            break;
        }
      }
    ]);

    return $ctx;
}
}