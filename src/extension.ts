import * as vscode from 'vscode'
import { Optimizer } from './Optimizer'

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'ImageOptim.optimizeImages',
      (_, uris: vscode.Uri[]) => {
        const optimizer = new Optimizer()
        optimizer.optimize(uris)
      },
    ),
  )
}
