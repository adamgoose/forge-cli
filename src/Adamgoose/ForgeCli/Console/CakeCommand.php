<?php namespace Adamgoose\ForgeCli\Console;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class CakeCommand extends Command {

  /**
   * Configure the command
   */
  protected function configure()
  {
    $this
      ->setName('cake')
      ->setDescription('??');
  }

  /**
   * @param InputInterface  $input
   * @param OutputInterface $output
   *
   * @return void
   */
  protected function execute(InputInterface $input, OutputInterface $output)
  {
    $output->writeln('<comment>            The Cake is a Lie           </comment>');
    $output->writeln('<info>            ,:/+/-                      </info>');
    $output->writeln('<info>            /M/              .,-=;//;-  </info>');
    $output->writeln('<info>       .:/= ;MH/,    ,=/+%$XH@MM#@:     </info>');
    $output->writeln('<info>      -$##@+$###@H@MMM#######H:.    -/H#</info>');
    $output->writeln('<info> .,H@H@ X######@ -H#####@+-     -+H###@X</info>');
    $output->writeln('<info>  .,@##H;      +XM##M/,     =%@###@X;-  </info>');
    $output->writeln('<info>X%-  :M##########$.    .:%M###@%:       </info>');
    $output->writeln('<info>M##H,   +H@@@$/-.  ,;$M###@%,          -</info>');
    $output->writeln('<info>M####M=,,---,.-%%H####M$:          ,+@##</info>');
    $output->writeln('<info>@##################@/.         :%H##@$- </info>');
    $output->writeln('<info>M###############H,         ;HM##M$=     </info>');
    $output->writeln('<info>#################.    .=$M##M$=         </info>');
    $output->writeln('<info>################H..;XM##M$=          .:+</info>');
    $output->writeln('<info>M###################@%=           =+@MH%</info>');
    $output->writeln('<info>@################M/.          =+H#X%=   </info>');
    $output->writeln('<info>=+M##############M,       -/X#X+;.      </info>');
    $output->writeln('<info>  .;XM##########H=    ,/X#H+:,          </info>');
    $output->writeln('<info>     .=+HM######M+/+HM@+=.              </info>');
    $output->writeln('<info>         ,:/%XM####H/.                  </info>');
    $output->writeln('<info>              ,.:=-.                    </info>');
  }
}