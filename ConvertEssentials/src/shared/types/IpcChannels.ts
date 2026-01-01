export const IpcChannels = {
  // File operations
  FILE_SELECT: 'file:select',
  FILE_SAVE_DIALOG: 'file:save-dialog',

  // Conversion operations
  CONVERSION_START: 'conversion:start',
  CONVERSION_PROGRESS: 'conversion:progress',
  CONVERSION_COMPLETE: 'conversion:complete',
  CONVERSION_CANCEL: 'conversion:cancel',

  // System
  GET_SYSTEM_INFO: 'system:info',
  OPEN_FILE: 'system:open-file',
  OPEN_FOLDER: 'system:open-folder'
} as const

export type IpcChannel = typeof IpcChannels[keyof typeof IpcChannels]
