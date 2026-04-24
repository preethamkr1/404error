const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const os = require('os');
const mime = require('mime-types');
const ptp = require('pdf-to-printer');
const muhammara = require('muhammara');
const shopRoutes = require('./shopRoutes');

const router = express.Router();

const uploadDir = process.env.VERCEL 
  ? path.join('/tmp', 'uploads') 
  : path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const fileStore = {};

const storage = multer.memoryStorage();
const upload = multer({ storage });

const writeToFileSystem = (filename, buffer) => {
  return new Promise((resolve, reject) => {
    try {
      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, buffer);
      resolve(filename);
    } catch (e) {
      reject(e);
    }
  });
};

const readFromFileSystem = (fileId) => {
  return new Promise((resolve, reject) => {
    try {
      const filePath = path.join(uploadDir, fileId);
      const buffer = fs.readFileSync(filePath);
      resolve(buffer);
    } catch (e) {
      reject(e);
    }
  });
};

const deleteFromFileSystem = (fileId) => {
  return new Promise((resolve, reject) => {
    try {
      const filePath = path.join(uploadDir, fileId);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

// Upload & Encrypt Multiple Files
router.post('/upload', upload.array('files', 20), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const code = crypto.randomBytes(4).toString('hex');

  // Parse metadata sent as JSON string from frontend
  let metadata = {};
  try {
    metadata = JSON.parse(req.body.metadata || '{}');
  } catch (e) {
    return res.status(400).json({ error: 'Invalid metadata format' });
  }

  const encryptionPrefs = metadata.encryptionPrefs || []; // [{ encrypt: bool, isPasswordProtected: bool, password: string }]
  const comment = metadata.comment || '';

  const filesData = [];

  try {
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const prefs = encryptionPrefs[i] || {};
      const shouldEncrypt = prefs.encrypt !== false; // Default to true for safety
      const pdfPassword = prefs.isPasswordProtected ? (prefs.password || null) : null;

      const diskFilename = `${code}-${crypto.randomBytes(8).toString('hex')}${path.extname(file.originalname)}`;
      let fileId;

      if (shouldEncrypt) {
        const key = crypto.randomBytes(32);
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        const encrypted = Buffer.concat([cipher.update(file.buffer), cipher.final()]);
        
        fileId = await writeToFileSystem(diskFilename, encrypted);

        filesData.push({
          fileId,
          diskFilename,
          originalName: file.originalname,
          key: key.toString('hex'),
          iv: iv.toString('hex'),
          pdfPassword,
          encrypted: true,
        });
      } else {
        // Store file as-is (no AES encryption)
        fileId = await writeToFileSystem(diskFilename, file.buffer);

        filesData.push({
          fileId,
          diskFilename,
          originalName: file.originalname,
          key: null,
          iv: null,
          pdfPassword,
          encrypted: false,
        });
      }
    }
  } catch (err) {
    console.error('File Upload Error:', err);
    return res.status(500).json({ error: err.message || 'Failed to process and store files.' });
  }

  fileStore[code] = {
    comment,
    files: filesData,
  };

  // --- 10 MINUTE AUTO-DELETE TIMER ---
  setTimeout(() => {
    if (fileStore[code]) {
      console.log(`[Auto-Delete] 10 minutes passed. Deleting files for code: ${code}`);
      const batchData = fileStore[code];
      
      // Delete all files from temporary storage
      batchData.files.forEach(async (f) => {
        try {
          await deleteFromFileSystem(f.fileId);
          console.log(`  -> Deleted from temporary storage: ${f.diskFilename}`);
        } catch (e) {
          console.error(`  -> Failed to delete from temporary storage: ${f.diskFilename}`);
        }
      });

      // Remove from memory
      delete fileStore[code];
    }
  }, 10 * 60 * 1000); // 10 minutes

  res.json({ code });
});

// Get batch info (file list + comment)
router.get('/info/:code', (req, res) => {
  const code = req.params.code.toLowerCase();
  const batch = fileStore[code];

  if (!batch) {
    return res.status(404).json({ error: 'Invalid code. Files may have been printed already.' });
  }

  const fileList = batch.files.map((f, i) => ({
    index: i,
    name: f.originalName,
    encrypted: f.encrypted,
  }));

  res.json({
    comment: batch.comment,
    files: fileList,
  });
});

// Stream & Decrypt individual file for Viewing
router.get('/download/:code/:index', async (req, res) => {
  const code = req.params.code.toLowerCase();
  const index = parseInt(req.params.index, 10);
  const batch = fileStore[code];

  if (!batch) {
    return res.status(404).json({ error: 'Invalid code. Files may have been printed already.' });
  }

  if (isNaN(index) || index < 0 || index >= batch.files.length) {
    return res.status(400).json({ error: 'Invalid file index.' });
  }

  const fileData = batch.files[index];

  let fileBuffer;
  try {
    fileBuffer = await readFromFileSystem(fileData.fileId);
  } catch (err) {
    return res.status(404).json({ error: 'File not found in storage.' });
  }

  const mimeType = mime.lookup(fileData.originalName) || 'application/octet-stream';
  res.set({
    'Content-Type': mimeType,
    'Content-Disposition': `inline; filename="${fileData.originalName}"`,
    'Cache-Control': 'no-store, no-cache, must-revalidate, private'
  });

  if (fileData.encrypted) {
    // Decrypt AES first
    const encryptedBuf = fileBuffer;
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(fileData.key, 'hex'), Buffer.from(fileData.iv, 'hex'));
    const decrypted = Buffer.concat([decipher.update(encryptedBuf), decipher.final()]);

    if (fileData.pdfPassword && mimeType === 'application/pdf') {
      const tmpFile = path.join(os.tmpdir(), `safeprint_prev_${code}_${index}.pdf`);
      const unencryptedFile = path.join(os.tmpdir(), `safeprint_prev_open_${code}_${index}.pdf`);
      fs.writeFileSync(tmpFile, decrypted);

      try {
        muhammara.recrypt(tmpFile, unencryptedFile, { password: fileData.pdfPassword });
        fs.unlinkSync(tmpFile);

        const readStream = fs.createReadStream(unencryptedFile);
        readStream.on('error', (err) => {
          console.error('File read stream error:', err);
          if (!res.headersSent) res.status(500).send('Error reading file.');
        });
        readStream.on('close', () => {
          if (fs.existsSync(unencryptedFile)) fs.unlinkSync(unencryptedFile);
        });
        readStream.pipe(res);
        return;
      } catch (err) {
        console.error('Failed to decrypt PDF preview with provided password:', err);
        if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
        if (fs.existsSync(unencryptedFile)) fs.unlinkSync(unencryptedFile);
        if (!res.headersSent) res.status(500).send('Error decrypting PDF preview. Incorrect password?');
        return;
      }
    }

    // Return decrypted buffer
    res.send(decrypted);
  } else {
    // Not AES-encrypted — handle PDF password if present
    if (fileData.pdfPassword && mimeType === 'application/pdf') {
      const tmpFile = path.join(os.tmpdir(), `safeprint_prev_${code}_${index}.pdf`);
      const unencryptedFile = path.join(os.tmpdir(), `safeprint_prev_open_${code}_${index}.pdf`);
      
      fs.writeFileSync(tmpFile, fileBuffer);

      try {
        muhammara.recrypt(tmpFile, unencryptedFile, { password: fileData.pdfPassword });
        fs.unlinkSync(tmpFile);

        const readStream = fs.createReadStream(unencryptedFile);
        readStream.on('error', (err) => {
          console.error('File read stream error:', err);
          if (!res.headersSent) res.status(500).send('Error reading file.');
        });
        readStream.on('close', () => {
          if (fs.existsSync(unencryptedFile)) fs.unlinkSync(unencryptedFile);
        });
        readStream.pipe(res);
        return;
      } catch (err) {
        console.error('Failed to decrypt PDF preview with provided password:', err);
        if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
        if (fs.existsSync(unencryptedFile)) fs.unlinkSync(unencryptedFile);
        if (!res.headersSent) res.status(500).send('Error decrypting PDF preview. Incorrect password?');
        return;
      }
    }

    // Normal stream (no encryption, no pdf password)
    res.send(fileBuffer);
  }
});

// Keep backward compat: /download/:code redirects to first file
router.get('/download/:code', (req, res) => {
  const code = req.params.code.toLowerCase();
  const batch = fileStore[code];

  if (!batch) {
    return res.status(404).json({ error: 'Invalid code. Files may have been printed already.' });
  }

  // Redirect to first file
  res.redirect(`/api/files/download/${code}/0`);
});

// Check hardware printers
router.get('/check-printers', async (req, res) => {
  try {
    const printers = await ptp.getPrinters();
    // Filter out default software printers if possible, or just check if any exist
    const hardwarePrinters = printers.filter(p => 
      !p.name.toLowerCase().includes('pdf') && 
      !p.name.toLowerCase().includes('xps') && 
      !p.name.toLowerCase().includes('onenote') &&
      !p.name.toLowerCase().includes('fax')
    );
    
    if (hardwarePrinters.length > 0) {
      res.json({ available: true, printers: hardwarePrinters });
    } else {
      res.json({ available: false, error: 'No hardware printer is available or connected.' });
    }
  } catch (err) {
    res.json({ available: false, error: 'Failed to detect printers: ' + err.message });
  }
});

// Print all files in batch
router.post('/print/:code', async (req, res) => {
  try {
    const code = req.params.code.toLowerCase();
    const { shopId, printerName, settings } = req.body || {};
    const batch = fileStore[code];

    if (!batch) return res.status(404).json({ error: 'Invalid code' });

    // 1. CRITICAL SECURITY CHECK: Verify a physical hardware printer is actually connected
    // If no physical printer exists, the OS will default to "Print to PDF", triggering a Save dialog!
    const allPrinters = await ptp.getPrinters();
    
    // Some versions of getPrinters return an array of strings, or array of objects.
    const hardwarePrinters = allPrinters.filter(p => {
        const pName = (typeof p === 'string' ? p : p.name).toLowerCase();
        return !pName.includes('pdf') && 
               !pName.includes('xps') && 
               !pName.includes('onenote') &&
               !pName.includes('fax') &&
               !pName.includes('webex');
    });

    if (hardwarePrinters.length === 0) {
       return res.status(403).json({ 
           error: 'SECURITY BLOCK: No physical printer connected. OS default virtual printers (like Print to PDF) are blocked to prevent unauthorized file saving.' 
       });
    }

    let targetPrinter;
    if (printerName) {
        // Validate that requested printer is an actual hardware printer
        const isValid = hardwarePrinters.some(p => {
            const pName = typeof p === 'string' ? p : p.name;
            return pName === printerName;
        });
        if (!isValid) {
            return res.status(400).json({ error: 'Selected printer is invalid or virtual.' });
        }
        targetPrinter = printerName;
    } else {
        targetPrinter = typeof hardwarePrinters[0] === 'string' ? hardwarePrinters[0] : hardwarePrinters[0].name;
    }

    let checkoutData = null;
    if (shopId) {
      const shop = shopRoutes.getShop(shopId);
      if (shop) {
        const baseRate = 2.0;
        let surgeMultiplier = 1.0;
        let surgeInfo = '';
        
        switch(shop.status) {
          case 'free': surgeMultiplier = 0.9; surgeInfo = "-10% Discount Applied"; break;
          case 'moderate': surgeMultiplier = 1.0; surgeInfo = "Base Demand Pricing"; break;
          case 'busy': surgeMultiplier = 1.25; surgeInfo = "+25% Surge Pricing Active"; break;
          default: surgeMultiplier = 1.0; surgeInfo = "Base Rate Active"; break;
        }
        
        const assumedPages = batch.files.length * 4;
        const totalAmount = (assumedPages * baseRate * surgeMultiplier).toFixed(2);
        const upiId = shop.upiId || 'partner@upi';
        const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(shop.name)}&am=${totalAmount}&cu=INR`;
        
        checkoutData = {
          amount: totalAmount,
          upiLink,
          pages: assumedPages,
          surgeInfo
        };
      }
    }

    const tmpFiles = [];

    for (let i = 0; i < batch.files.length; i++) {
        const fileData = batch.files[i];
        let fileBuffer;
        try {
          fileBuffer = await readFromFileSystem(fileData.fileId);
        } catch (e) {
          continue;
        }

        if (fileData.encrypted) {
          const encryptedBuf = fileBuffer;
          const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(fileData.key, 'hex'), Buffer.from(fileData.iv, 'hex'));
          fileBuffer = Buffer.concat([decipher.update(encryptedBuf), decipher.final()]);
        }

        const ext = path.extname(fileData.originalName) || '.pdf';
        let tmpFile = path.join(os.tmpdir(), `safeprint_${code}_${i}${ext}`);
        fs.writeFileSync(tmpFile, fileBuffer);

        if (fileData.pdfPassword && ext.toLowerCase() === '.pdf') {
          const unencryptedFile = path.join(os.tmpdir(), `safeprint_open_${code}_${i}${ext}`);
          try {
            muhammara.recrypt(tmpFile, unencryptedFile, { password: fileData.pdfPassword });
            fs.unlinkSync(tmpFile);
            tmpFile = unencryptedFile;
          } catch (err) {
            console.error(`Failed to decrypt PDF ${i} with provided password:`, err);
            if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
            continue;
          }
        }

        tmpFiles.push({ tmpFile });
    }

    // HARDWARE PRINT EXECUTION
    let printSuccessCount = 0;
    for (const { tmpFile } of tmpFiles) {
        if (fs.existsSync(tmpFile)) {
            try {
                const printOptions = { 
                    printer: targetPrinter,
                    silent: true,
                    monochrome: settings?.monochrome || false,
                    copies: parseInt(settings?.copies) || 1
                };
                // Send directly to the target physical printer!
                await ptp.print(tmpFile, printOptions);
                console.log(`Successfully sent to hardware printer: ${targetPrinter} (B&W: ${printOptions.monochrome}, Copies: ${printOptions.copies})`);
                printSuccessCount++;
            } catch (printErr) {
                console.error(`Hardware Print Error on ${targetPrinter}:`, printErr);
                // Even if it fails, we continue to cleanup to ensure security
            }
        }
    }

    // Cleanup: delete temporary decrypted buffers from OS, and delete encrypted files from MongoDB
    for (const { tmpFile } of tmpFiles) {
        if (fs.existsSync(tmpFile)) {
          fs.unlinkSync(tmpFile);
        }
    }
    
    // Auto-Delete from temp storage completely!
    for (const f of batch.files) {
        try {
            await deleteFromFileSystem(f.fileId);
            console.log(`Successfully purged ${f.diskFilename} from temporary storage`);
        } catch(e) {
            console.error(`Failed to purge ${f.diskFilename} from temporary storage`);
        }
    }

    delete fileStore[code];
    console.log(`Job completed for code: ${code}. Files and batch metadata deleted.`);
      
    if (printSuccessCount === 0) {
        return res.status(500).json({ 
            error: `Printer hardware error. Failed to spool documents to "${targetPrinter}". The printer might be turned off or disconnected.`
        });
    }

    return res.json({ 
        success: true, 
        message: `${printSuccessCount} document(s) securely spooled to ${targetPrinter}.`,
        checkoutData
    });
  } catch (err) {
    console.error('Fatal Catch 500 Trap:', err.message);
    return res.status(500).json({ error: `Server crash: ${err.message}` });
  }
});

module.exports = router; 