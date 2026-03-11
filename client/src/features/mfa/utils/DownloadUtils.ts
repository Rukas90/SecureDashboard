import { FileService } from "@src/lib"

export const formatBackupCode = (code: string): string =>
  `${code.slice(0, 5)}-${code.slice(5)}`

export const downloadBackupCodes = (codes: string[]): void => {
  const content = [
    "Recovery Codes",
    `Generated: ${new Date().toLocaleDateString()}`,
    "",
    "Keep these codes in a safe place. Each code can only be used once.",
    "",
    ...codes.map(formatBackupCode),
  ].join("\n")

  FileService.downloadTextFile("recovery-codes.txt", content)
}
