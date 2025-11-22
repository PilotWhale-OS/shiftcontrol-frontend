/*!
 * Copyright notice: This software is protected by copyright. Copyright is held by
 * manubu gmbh, unless otherwise indicated below.
 */

import fs from 'fs';
import path from 'path';

export function clearDownloads(downloadDir: string): null {
  if (fs.existsSync(downloadDir)) {
    fs.readdirSync(downloadDir).forEach((file) => {
      const filePath = path.join(downloadDir, file);
      if (fs.lstatSync(filePath).isFile()) {
        fs.unlinkSync(filePath);
      }
    });
  }
  return null;
}
