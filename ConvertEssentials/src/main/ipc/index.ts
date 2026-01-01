import { ipcMain, dialog, shell, BrowserWindow } from 'electron'
import { IpcChannels } from '../../shared/types/IpcChannels'
import { ConversionRequest, ConversionResult, ConversionProgress } from '../../shared/types/Conversion'
import { convertPdf } from '../services/pdf/PdfConverter'
import * as os from 'os'

export function registerIpcHandlers(): void {
  // File selection dialog
  ipcMain.handle(IpcChannels.FILE_SELECT, async (_, options?: { filters?: Electron.FileFilter[] }) => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: options?.filters || [
        { name: 'PDF Files', extensions: ['pdf'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    })
    return result.canceled ? null : result.filePaths[0]
  })

  // Save dialog
  ipcMain.handle(IpcChannels.FILE_SAVE_DIALOG, async (_, options: { defaultPath?: string; filters?: Electron.FileFilter[] }) => {
    const result = await dialog.showSaveDialog({
      defaultPath: options.defaultPath,
      filters: options.filters
    })
    return result.canceled ? null : result.filePath
  })

  // Start conversion
  ipcMain.handle(IpcChannels.CONVERSION_START, async (event, request: ConversionRequest): Promise<ConversionResult> => {
    const window = BrowserWindow.fromWebContents(event.sender)

    const onProgress = (progress: ConversionProgress) => {
      window?.webContents.send(IpcChannels.CONVERSION_PROGRESS, progress)
    }

    try {
      const result = await convertPdf(request, onProgress)
      return result
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  })

  // System info
  ipcMain.handle(IpcChannels.GET_SYSTEM_INFO, () => {
    return {
      cpuCores: os.cpus().length,
      platform: process.platform,
      arch: process.arch,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem()
    }
  })

  // Open file in default application
  ipcMain.handle(IpcChannels.OPEN_FILE, async (_, filePath: string) => {
    await shell.openPath(filePath)
  })

  // Open folder containing file
  ipcMain.handle(IpcChannels.OPEN_FOLDER, async (_, filePath: string) => {
    shell.showItemInFolder(filePath)
  })
}
