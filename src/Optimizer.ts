import * as vscode from 'vscode'
import prettyBytes from 'pretty-bytes'
import { ImageOptim } from './ImageOptim'
import { join as joinPath } from 'path'
import { readdirSync, statSync } from 'fs'

export interface OptimizerConfig {
  cliPath: string
}

export class Optimizer {
  private getConfig(): OptimizerConfig {
    const workbenchConfig = vscode.workspace.getConfiguration('ImageOptim')
    const cliPath = workbenchConfig.get<string>('cliPath')!
    return { cliPath }
  }

  async optimize(uris: vscode.Uri[]) {
    const imageFiles = uris
      .map(uri => {
        if (statSync(uri.fsPath).isDirectory()) {
          return readdirSync(uri.fsPath)
            .map(file => joinPath(uri.fsPath, file))
            .filter(file => statSync(file).isFile())
        }
        return [uri.fsPath]
      })
      .flat()
      .filter(file => /\.(png|jpe?g|gif|svg)$/i.test(file))
    if (!imageFiles.length) {
      vscode.window.setStatusBarMessage(`No images.`, 3000)
      return
    }
    const getTotalImageFileSize = () => {
      let size = 0
      for (const file of imageFiles) {
        size += statSync(file).size
      }
      return size
    }

    const beforeSize = getTotalImageFileSize()
    const beforeSizeHuman = prettyBytes(beforeSize, { space: false })

    const optimizingMessage = vscode.window.setStatusBarMessage(
      `${imageFiles.length} images optimizing...`,
    )
    const config = this.getConfig()
    const imageOptim = new ImageOptim({ cliPath: config.cliPath })
    await imageOptim.optimize(imageFiles)
    optimizingMessage.dispose()

    const afterSize = getTotalImageFileSize()
    const afterSizeHuman = prettyBytes(afterSize, { space: false })
    const savedSize = beforeSize - afterSize
    const savedSizeHuman = prettyBytes(savedSize, { space: false })
    const savedSizePercent = `${+((savedSize / beforeSize) * 100).toFixed(1)}%`

    vscode.window.setStatusBarMessage(
      `${imageFiles.length} images optimized (${beforeSizeHuman}->${afterSizeHuman}, saved ${savedSizePercent}/${savedSizeHuman}).`,
      5000,
    )
  }
}
