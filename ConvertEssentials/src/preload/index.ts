import { contextBridge, ipcRenderer } from 'electron'
import { IpcChannels } from '../shared/types/IpcChannels'
import { ConversionRequest, ConversionResult, ConversionProgress } from '../shared/types/Conversion'

const electronApi = {
  // File operations
  selectFile: (options?: { filters?: { name: string; extensions: string[] }[] }) =>
    ipcRenderer.invoke(IpcChannels.FILE_SELECT, options) as Promise<string | null>,

  saveDialog: (options: { defaultPath?: string; filters?: { name: string; extensions: string[] }[] }) =>
    ipcRenderer.invoke(IpcChannels.FILE_SAVE_DIALOG, options) as Promise<string | null>,

  // Conversion
  startConversion: (request: ConversionRequest) =>
    ipcRenderer.invoke(IpcChannels.CONVERSION_START, request) as Promise<ConversionResult>,

  onConversionProgress: (callback: (progress: ConversionProgress) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, progress: ConversionProgress) => callback(progress)
    ipcRenderer.on(IpcChannels.CONVERSION_PROGRESS, listener)
    return () => ipcRenderer.removeListener(IpcChannels.CONVERSION_PROGRESS, listener)
  },

  // System
  getSystemInfo: () => ipcRenderer.invoke(IpcChannels.GET_SYSTEM_INFO) as Promise<{
    cpuCores: number
    platform: string
    arch: string
    totalMemory: number
    freeMemory: number
  }>,

  openFile: (filePath: string) => ipcRenderer.invoke(IpcChannels.OPEN_FILE, filePath),
  openFolder: (filePath: string) => ipcRenderer.invoke(IpcChannels.OPEN_FOLDER, filePath)
}

contextBridge.exposeInMainWorld('electronApi', electronApi)

export type ElectronApi = typeof electronApi
