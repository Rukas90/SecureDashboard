import path from "path"

const isCompiledBuild = (dirname: string) =>
  dirname.includes(`${path.sep}dist${path.sep}`) ||
  dirname.endsWith(`${path.sep}dist`)

export const FeaturesDirectory = (dirname: string) =>
  path.resolve(dirname, "feature")

export const FileExtension = (dirname: string) =>
  isCompiledBuild(dirname) ? ".js" : ".ts"

export type LoadOptions = {
  pattern: string
  path?: string
}
