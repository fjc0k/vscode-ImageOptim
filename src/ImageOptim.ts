import exec from 'execa'

export interface ImageOptimOptions {
  cliPath: string
}

export class ImageOptim {
  constructor(private readonly options: ImageOptimOptions) {}

  async optimize(files: string[]) {
    try {
      await exec(this.options.cliPath, [...files])
    } catch {}
  }
}
