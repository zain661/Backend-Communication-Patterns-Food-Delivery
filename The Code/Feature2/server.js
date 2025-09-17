import express from 'express';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

const jobs = {};

app.post('/track-order', (req,res)=> {
    const {order_number} = req.body;
    const jobId = uuidv4();
    jobs[jobId] = {
        order_number,
        status: "pending",
        created_at: Date.now()
    };
    console.log(`Job ${jobId} started for order ${order_number}.`);
    setTimeout(() => {
        if (jobs[jobId]) {
            jobs[jobId].status = "shipped";
            console.log(`Job ${jobId} status updated to 'shipped'.`);
        }
    }, 90000);
    res.json({ job_id: jobId});
})
 app.get("/track-order-status", (req, res) => {
    const { job_id } = req.query;
    const job = jobs[job_id];

    if (!job) {
        return res.status(404).json({ error: "Job ID not found" });
    }
    res.json({ job_id, status: job.status });
});
app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});