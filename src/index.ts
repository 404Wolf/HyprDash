import { ArgumentParser } from "argparse";
import {
  activeWorkspace,
  hyprctlDispatch,
  launchTaggedClient,
  getClientByTag,
} from "./utils";
import { version } from "../package.json";

const parser = new ArgumentParser({
  description: "Hyprctl implementation of Gnome's dashtodock extension.",
});

parser.add_argument("-v", "--version", { action: "version", version });
parser.add_argument("-appID", {
  help: "The ID to use for naming for the application to make dash-to-dock'd",
  required: true,
});
parser.add_argument("-launchCommand", {
  help: "The command to launch the application",
  required: true,
});
parser.add_argument("-matcher", {
  help: "Regex to use to ensure the correct PID is found",
  default: /\w/,
  required: false,
});

const args = parser.parse_args();
args.matcher = new RegExp(args.matcher);

(async () => {
  const tag = `ephemeral${args.appID}`;
  const workspace = `ephemeral${args.appID}`;

  // General scheme:
  //
  // App is running
  //   App in scratchpad workspace
  //     Move App to current workspace
  //   Else
  //     Move App to scratchpad workspace
  // Else
  //   Launch App

  const ephemeralApp = await getClientByTag(tag);
  if (ephemeralApp) {
    if (ephemeralApp.workspace.name === workspace) {
      const activeWorkspaceID = (await activeWorkspace()).id;
      await hyprctlDispatch(`pin pid:${ephemeralApp.pid}`);
      await hyprctlDispatch(
        `movetoworkspacesilent ${activeWorkspaceID},pid:${ephemeralApp.pid}`,
      );
      await hyprctlDispatch(`focuswindow pid:${ephemeralApp.pid}`);
    } else {
      await hyprctlDispatch(`pin pid:${ephemeralApp.pid}`);
      await hyprctlDispatch(
        `movetoworkspacesilent special:${workspace},pid:${ephemeralApp.pid}`,
      );
    }
  } else {
    await launchTaggedClient(
      args.launchCommand,
      tag,
      ["pin", "size 65% 60%", "float", "focus"],
      args.matcher,
    );
  }
})();
