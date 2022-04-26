import * as vscode from "vscode";
import { askForServiceRegistryUrl } from "./serviceCatalog/rhhccServiceRegistry";
import { CONFIGURATION_SECTIONS, SwfVsCodeExtensionConfiguration } from "./configuration";

export const COMMAND_IDS = {
  loginToRhhcc: "extension.kogito.swf.logInToRhhcc",
  setupServiceRegistryUrl: "extension.kogito.swf.setupServiceRegistryUrl",
  removeServiceRegistryUrl: "extension.kogito.swf.removeServiceRegistryUrl",
  getPreviewSvg: "extension.kogito.swf.getPreviewSvg",
  silentlyGetPreviewSvg: "extension.kogito.swf.silentlyGenerateSvg",
  openAsDiagram: "extension.kogito.swf.openAsDiagram",
  openAsSource: "extension.kogito.swf.openAsSource",
  swfLsCommand: "extension.kogito.swf.ls.command",
  setupAutomaticallyOpenDiagramEditorAlongsideTextEditor:
    "extension.kogito.swf.setupAutomaticallyOpenDiagramEditorAlongsideTextEditor",
};

export function setupCommands(args: {
  context: vscode.ExtensionContext;
  configuration: SwfVsCodeExtensionConfiguration;
}) {
  args.context.subscriptions.push(
    vscode.commands.registerCommand(COMMAND_IDS.loginToRhhcc, () => {
      vscode.authentication.getSession("redhat-mas-account-auth", ["openid"], { createIfNone: true });
    })
  );

  args.context.subscriptions.push(
    vscode.commands.registerCommand(COMMAND_IDS.setupServiceRegistryUrl, async () => {
      const serviceRegistryUrl = await askForServiceRegistryUrl({
        currentValue: args.configuration.getConfiguredServiceRegistryUrl(),
      });

      if (!serviceRegistryUrl) {
        return;
      }

      vscode.workspace.getConfiguration().update(CONFIGURATION_SECTIONS.serviceRegistryUrl, serviceRegistryUrl);
      vscode.window.setStatusBarMessage("Serverless Workflow: Service Registry URL saved.", 3000);
    })
  );

  args.context.subscriptions.push(
    vscode.commands.registerCommand(COMMAND_IDS.removeServiceRegistryUrl, () => {
      vscode.workspace.getConfiguration().update(CONFIGURATION_SECTIONS.serviceRegistryUrl, "");
      vscode.window.setStatusBarMessage("Serverless Workflow: Service Registry URL removed.", 3000);
    })
  );
}
