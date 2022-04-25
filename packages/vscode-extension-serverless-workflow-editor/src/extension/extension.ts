/*
 * Copyright 2021 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { backendI18nDefaults, backendI18nDictionaries } from "@kie-tools-core/backend/dist/i18n";
import { VsCodeBackendProxy } from "@kie-tools-core/backend/dist/vscode/VsCodeBackendProxy";
import { EditorEnvelopeLocator, EnvelopeMapping } from "@kie-tools-core/editor/dist/api";
import { I18n } from "@kie-tools-core/i18n/dist/core";
import * as KogitoVsCode from "@kie-tools-core/vscode-extension";
import * as vscode from "vscode";
import { ServerlessWorkflowEditorChannelApiProducer } from "./ServerlessWorkflowEditorChannelApiProducer";
import { CONFIGURATION_SECTIONS, SwfVsCodeExtensionConfiguration } from "./configuration";
import { RhhccAuthenticationStore } from "./rhhcc/RhhccAuthenticationStore";
import { askForServiceRegistryUrl } from "./serviceCatalog/rhhccServiceRegistry";
import { COMMAND_IDS, setupCommands } from "./commands";
import { SwfLanguageServiceChannelApiImpl } from "./languageService/SwfLanguageServiceChannelApiImpl";
import { SwfServiceCatalogStore } from "./serviceCatalog/SwfServiceCatalogStore";
import { RhhccServiceRegistryServiceCatalogStore } from "./serviceCatalog/rhhccServiceRegistry/RhhccServiceRegistryServiceCatalogStore";
import { setupBuiltInVsCodeEditorSwfContributions } from "./builtInVsCodeEditorSwfContributions";
import { SwfServiceCatalogSupportActions } from "./serviceCatalog/SwfServiceCatalogSupportActions";

export async function activate(context: vscode.ExtensionContext) {
  console.info("Extension is alive.");

  const backendI18n = new I18n(backendI18nDefaults, backendI18nDictionaries, vscode.env.language);
  const backendProxy = new VsCodeBackendProxy(context, backendI18n);
  const configuration = new SwfVsCodeExtensionConfiguration();
  const rhhccAuthenticationStore = new RhhccAuthenticationStore();

  context.subscriptions.push(
    vscode.authentication.onDidChangeSessions(async (e) => {
      if (e.provider.id === "redhat-mas-account-auth") {
        await updateRhhccAuthenticationSession(rhhccAuthenticationStore);
      }
    })
  );

  context.subscriptions.push(
    rhhccAuthenticationStore.subscribeToSessionChange(async (session) => {
      if (!session) {
        return rhhccServiceRegistryServiceCatalogStore.refresh();
      }

      const configuredServiceRegistryUrl = configuration.getConfiguredServiceRegistryUrl();
      if (configuredServiceRegistryUrl) {
        return rhhccServiceRegistryServiceCatalogStore.refresh();
      }

      const serviceRegistryUrl = await askForServiceRegistryUrl({ currentValue: configuredServiceRegistryUrl });
      vscode.workspace.getConfiguration().update(CONFIGURATION_SECTIONS.serviceRegistryUrl, serviceRegistryUrl);
      vscode.window.setStatusBarMessage("Serverless Workflow: Service Registry URL saved.", 3000);

      return rhhccServiceRegistryServiceCatalogStore.refresh();
    })
  );

  const rhhccServiceRegistryServiceCatalogStore = new RhhccServiceRegistryServiceCatalogStore({
    rhhccAuthenticationStore,
    configuration,
  });

  await updateRhhccAuthenticationSession(rhhccAuthenticationStore);

  const swfServiceCatalogGlobalStore = new SwfServiceCatalogStore({ rhhccServiceRegistryServiceCatalogStore });

  await swfServiceCatalogGlobalStore.init();
  console.info(
    `SWF Service Catalog global store successfully initialized with ${swfServiceCatalogGlobalStore.storedServices.length} services.`
  );

  const swfLanguageService = new SwfLanguageServiceChannelApiImpl({
    configuration,
    rhhccAuthenticationStore,
    swfServiceCatalogGlobalStore,
  });

  const swfServiceCatalogSupportActions = new SwfServiceCatalogSupportActions({
    configuration,
    swfServiceCatalogGlobalStore,
  });

  context.subscriptions.push(swfLanguageService);

  KogitoVsCode.startExtension({
    editorDocumentType: "text",
    extensionName: "kie-group.vscode-extension-serverless-workflow-editor",
    context: context,
    viewType: "kieKogitoWebviewEditorsServerlessWorkflow",
    generateSvgCommandId: COMMAND_IDS.getPreviewSvg,
    silentlyGenerateSvgCommandId: COMMAND_IDS.silentlyGetPreviewSvg,
    editorEnvelopeLocator: new EditorEnvelopeLocator("vscode", [
      new EnvelopeMapping(
        "sw",
        "**/*.sw.+(json|yml|yaml)",
        "dist/webview/ServerlessWorkflowEditorEnvelopeApp.js",
        "dist/webview/editors/serverless-workflow"
      ),
    ]),
    channelApiProducer: new ServerlessWorkflowEditorChannelApiProducer({
      configuration,
      rhhccAuthenticationStore,
      swfLanguageService,
      swfServiceCatalogSupportActions,
    }),
    backendProxy,
  });

  setupBuiltInVsCodeEditorSwfContributions({
    context,
    swfLanguageService,
    configuration,
    swfServiceCatalogGlobalStore,
    swfServiceCatalogSupportActions,
  });

  setupCommands({ context, configuration });

  context.subscriptions.push(
    new vscode.Disposable(() => {
      return backendProxy.stopServices();
    })
  );

  console.info("Extension is successfully setup.");
}

async function updateRhhccAuthenticationSession(rhhccAuthenticationStore: RhhccAuthenticationStore) {
  rhhccAuthenticationStore.setSession(await vscode.authentication.getSession("redhat-mas-account-auth", ["openid"]));
}
