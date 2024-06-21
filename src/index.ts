import {ArgumentParser} from 'argparse';
import {runCommand, hyprctlDispatch, launchTaggedClient, getClientByTag} from './utils';
import {version} from '../package.json';

const parser = new ArgumentParser({
  description: 'Hyprctl implementation of Gnome\'s dashtodock extension.',
});

parser.add_argument('-v', '--version', {action: 'version', version});
parser.add_argument('-appID', {help: 'The ID to use for naming for the application to make dash-to-dock\'d', required: true});
parser.add_argument('-launchCommand', {help: 'The command to launch the application', required: true});

const args = parser.parse_args();

(async () => {
  const tag = `ephemeral${args.appID}`
  const workspace = `ephemeral${args.appID}`

  // General scheme:
  //
  // Kitty is running
  //   Kitty in scratchpad workspace
  //     Move Kitty to current workspace
  //   Else
  //     Move kitty to scratchpad workspace
  // Else
  //   Launch Kitty

  const ephemeralApp = await getClientByTag(tag)
  if (ephemeralApp) {
    if (ephemeralApp.workspace.name === workspace) {
      await hyprctlDispatch(`pin pid:${ephemeralApp.pid}`)
      await hyprctlDispatch(`focuswindow pid:${ephemeralApp.pid}`)
      await hyprctlDispatch(`movetoworkspacesilent +0,pid:${ephemeralApp.pid}`)
    }
    else {
      await hyprctlDispatch(`pin pid:${ephemeralApp.pid}`)
      await hyprctlDispatch(`movetoworkspacesilent special:${workspace},pid:${ephemeralApp.pid}`)
    }
  }
  else {
    await launchTaggedClient(args.launchCommand, tag, ["pin", "size 65% 60%", "float"])
  }
})()

