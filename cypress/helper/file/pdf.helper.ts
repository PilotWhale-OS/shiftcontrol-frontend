/*!
 * Copyright notice: This software is protected by copyright. Copyright is held by
 * manubu gmbh, unless otherwise indicated below.
 */

import { APP_CONFIG } from '@config/index';

/**
 * Deletes all files in the configured Cypress downloads folder.
 */
export function clearDownloads(): void {
  const downloadDir = Cypress.config('downloadsFolder');
  cy.task('clearDownloads', downloadDir, { log: false });
}

/**
 * Verifies that a PDF with the expected file name has been downloaded
 * and contains binary data of sufficient size.
 *
 * @param expectedFileName - The exact name of the downloaded PDF file to verify.
 */
export function verifyPdfDownloaded(expectedFileName: string): void {
  const downloadDir = Cypress.config('downloadsFolder');
  const downloadPath = `${downloadDir}/${expectedFileName}`;
  cy.readFile(downloadPath, { timeout: APP_CONFIG.TIMEOUT_M, encoding: null }).then((pdfBinary: Buffer) => {
    if (!pdfBinary) {
      throw new Error('PDF file not found or empty');
    }
    expect(pdfBinary.byteLength).to.be.greaterThan(100);
  });
}
