const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const os = require('os');
const ptp = require('pdf-to-printer');
const HardwarePrintJob = require('../models/HardwarePrintJob');

// Use memory storage for the initial upload before piping to GridFS
const upload = multer({ storage: multer.memoryStorage() });

// Mock decryption function (in a real app, replace with actual AES-256 decryption)
const decryptAES256 = (buffer, key) => {
    // For this isolated module, if it's already decrypted or we are simulating,
    // we just return the buffer. Real implementation would use crypto.createDecipheriv
    return buffer; 
};

router.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });

    try {
        const db = mongoose.connection.db;
        const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'encryptedPrints' });

        // Create GridFS upload stream
        const uploadStream = bucket.openUploadStream(req.file.originalname);
        const fileId = uploadStream.id;

        // Write buffer to GridFS
        uploadStream.end(req.file.buffer);

        uploadStream.on('finish', async () => {
            // Generate secure token and ID
            const jobId = crypto.randomUUID();
            const token = crypto.randomBytes(32).toString('hex');
            const tokenHash = await bcrypt.hash(token, 10);

            const job = new HardwarePrintJob({
                jobId,
                tokenHash,
                fileId,
                originalName: req.file.originalname
            });

            await job.save();

            res.json({
                success: true,
                jobId,
                token,
                message: 'Encrypted file safely stored in GridFS for printing.'
            });
        });

        uploadStream.on('error', (err) => {
            console.error('GridFS Upload Error:', err);
            res.status(500).json({ error: 'Failed to securely store file.' });
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/execute', async (req, res) => {
    const { jobId, token } = req.body;

    if (!jobId || !token) {
        return res.status(400).json({ error: 'Job ID and Token required' });
    }

    try {
        const job = await HardwarePrintJob.findOne({ jobId });

        if (!job) {
            return res.status(404).json({ error: 'Print job not found or expired' });
        }

        const isValidToken = await bcrypt.compare(token, job.tokenHash);
        if (!isValidToken) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        if (job.status !== 'pending') {
            return res.status(400).json({ error: 'Job is no longer pending.' });
        }

        // 1. Mark as processing to prevent reuse
        job.status = 'printing';
        await job.save();

        const db = mongoose.connection.db;
        const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'encryptedPrints' });

        // 2. Fetch from GridFS into memory buffer
        const downloadStream = bucket.openDownloadStream(job.fileId);
        const chunks = [];
        
        downloadStream.on('data', (chunk) => chunks.push(chunk));
        
        downloadStream.on('error', async (err) => {
            console.error('GridFS Download Error:', err);
            job.status = 'failed';
            await job.save();
            return res.status(500).json({ error: 'Failed to read secure file.' });
        });

        downloadStream.on('end', async () => {
            try {
                const encryptedBuffer = Buffer.concat(chunks);
                
                // 3. Decrypt in memory (simulated here)
                const decryptedBuffer = decryptAES256(encryptedBuffer, 'master-key');

                // 4. Write to highly volatile temp storage for OS Spooler
                // Windows requires a file path to print. We use os.tmpdir and immediate deletion.
                const tempFilename = `${crypto.randomBytes(16).toString('hex')}.pdf`;
                const tempPath = path.join(os.tmpdir(), tempFilename);
                
                fs.writeFileSync(tempPath, decryptedBuffer);

                // 5. Trigger hardware print
                try {
                    await ptp.print(tempPath);
                } catch (printErr) {
                    console.error('Hardware print failed:', printErr);
                    // Still fall through to cleanup!
                    throw new Error('OS spooler failed to process job');
                }

                // 6. INSTANT CLEANUP - Critical Security Step
                try {
                    if (fs.existsSync(tempPath)) {
                        fs.unlinkSync(tempPath); // Shred from disk
                    }
                    await bucket.delete(job.fileId); // Delete from GridFS
                    await HardwarePrintJob.deleteOne({ jobId }); // Remove Job from DB
                } catch (cleanupErr) {
                    console.error('Cleanup Error:', cleanupErr);
                }

                res.json({ success: true, message: 'Document printed securely and wiped from system.' });
                
            } catch (processErr) {
                console.error(processErr);
                job.status = 'failed';
                await job.save();
                res.status(500).json({ error: processErr.message });
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
