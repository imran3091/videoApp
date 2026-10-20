const express = require("express");
const router = express.Router();
const pool = require("../dbConfig/db");
const upload = require("../upload/upload");
const vidStream = require("../stream/stream");

router.get("/videos", async (req, res) => {
        console.log("GET /videos");

    try {
       const [result] = await pool.execute(
    `SELECT * FROM videos
     WHERE visibility = 'public'
     AND status = 'ready'`
);
res.json(result);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Database error"
        });
    }
        

});

router.get("/api/videos/:id", vidStream);


router.get("/", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>File Upload</title>
        </head>
        <body>
            <h2>Upload a Video</h2>
            
            <form action="/upload" method="POST" enctype="multipart/form-data">
                <div>
                    <label for="video">Select Video File:</label> <br><br>
                    <input type="file" id="video" name="video" accept="video/*" required>
                </div>
                <br>
                <button type="submit">Upload Now</button>
            </form>
        </body>
        </html>
    `);
});

router.post("/upload", upload);

module.exports = router;