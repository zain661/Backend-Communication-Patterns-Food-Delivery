const express = require('express');
const multer = require('multer'); //Multer is a middleware for the Express framework, specifically designed to process data submitted via web forms in multipart/form-data format. This is the standard format used by browsers for uploading files.
const path = require('path');
const fs = require('fs'); // Import file handling library
const sharp = require('sharp');
const app = express();
const port = 3000;

// Setting up where to store uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => { // We specify the folder in which the files will be saved.
        cb(null, 'uploads/'); //cb() => In Node.js, callback functions are used to handle asynchronous operations. Multer uses them to tell you when a process has finished. cb is the communication bridge between you and Multer.
        //The cb (callback function) here is how you tell Multer the specific information it needs to complete its work.
        //Multer runs in the background, and when it reaches a point where it needs a decision from you, it calls the function you wrote (such as destination or filename) and passes it cb as a parameter.
    },
    filename: (req, file, cb) => {
        // We give the file a unique name to avoid conflicts.
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

// status the job
const processingJobs = {};

// Make sure the 'uploads' folder exists.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/processed', express.static(path.join(__dirname, 'processed')));
app.use(express.static('public'));

//Endpoint for file upload
app.post('/upload-file', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    const jobId = Math.random().toString(36).substring(2, 15);
    
    const originalFilePath = req.file.path;
    const processedFilePath = path.join(__dirname, 'processed', `processed-${jobId}.jpg`);

    processingJobs[jobId] = { status: 'processing', final_url: null };
    console.log(`Job ${jobId} started.`);

    // This is where the real healing begins
    // We use Sharp to reduce and compress the image size.
    sharp(originalFilePath)
        .resize({ width: 800, height: 600, fit: 'inside' }) 
        .jpeg({ quality: 80 }) 
        .toFile(processedFilePath) //save new file
        .then(() => {
            processingJobs[jobId].status = 'complete';
            processingJobs[jobId].final_url = `/processed/processed-${jobId}.jpg`;
            console.log(`Job ${jobId} is complete! File saved to ${processedFilePath}`);
        })
        .catch(err => {
            console.error(`Job ${jobId} failed!`, err);
            processingJobs[jobId].status = 'failed';
        });

    res.json({ jobId: jobId, message: 'File received, processing started.' });
});


app.get('/status/:jobId', (req, res) => {
    const jobId = req.params.jobId;

    const checkStatus = () => {
        const job = processingJobs[jobId];
        
        if (!job) {
            return res.status(404).json({ message: 'Job not found.' });
        }

        if (job.status === 'complete' || job.status === 'failed') {
            console.log(`Sending complete status for job ${jobId}`);
            const responseData = { 
                status: job.status,
                message: job.status === 'complete' ? 'Image processing is done!' : 'Image processing failed!',
                imageUrl: job.final_url
            };
            delete processingJobs[jobId];
            return res.json(responseData);
        }

        // If the task doesn't complete, we keep the connection open
        // and recheck after one second
        setTimeout(checkStatus, 1000); //setTimeout gives the server a short "rest period" between each check, ensuring that your system runs efficiently. If processing can take a long time (such as 30 seconds), it's fine to have a check every second.
    };

    checkStatus();
});

app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});