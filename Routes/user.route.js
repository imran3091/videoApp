const express = require("express");
const router = express.Router();

const upload = require("../upload/upload");

router.get("/upload", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Upload</title>
        </head>

        <body>

            <h1>Video Upload</h1>

            <form action="/upload" method="POST" enctype="multipart/form-data">

                <input 
                    type="file" 
                    name="video" 
                    accept="video/*"
                    required
                >

                <br><br>

                <button type="submit">
                    Upload Video
                </button>

            </form>

        </body>
        </html>
    `);
});

router.post("/upload", upload);

module.exports = router;