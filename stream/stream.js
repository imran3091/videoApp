const fs = require("fs");
const path = require("path");
const pool = require("../dbConfig/db");

async function vidStream(req, res) {

    try {

        const videoId = req.params.id;

        const [rows] = await pool.execute(
            "SELECT title FROM videos WHERE id = ?",
            [videoId]
        );

        if (rows.length === 0) {
            return res.status(404).send("Video not found");
        }

        const title = rows[0].title;

        const filePath = path.join(
            __dirname,
            "..",
            "videos",
            `${title}.mp4`
        );

        if (!fs.existsSync(filePath)) {
            return res.status(404).send("Video file not found");
        }

        const stat = fs.statSync(filePath);
        const fileSize = stat.size;

        const range = req.headers.range;

        // Range না থাকলে পুরো video
        if (!range) {

            res.writeHead(200, {
                "Content-Length": fileSize,
                "Content-Type": "video/mp4",
                "Accept-Ranges": "bytes"
            });

            return fs.createReadStream(filePath).pipe(res);
        }

        // Range থাকলে
        const parts = range.replace(/bytes=/, "").split("-");

        const start = parseInt(parts[0], 10);

        const end = parts[1]
            ? parseInt(parts[1], 10)
            : fileSize - 1;

        if (start >= fileSize || end >= fileSize) {
            res.writeHead(416, {
                "Content-Range": `bytes */${fileSize}`
            });

            return res.end();
        }

        const chunkSize = end - start + 1;

        res.writeHead(206, {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunkSize,
            "Content-Type": "video/mp4"
        });

        fs.createReadStream(filePath, {
            start: start,
            end: end
        }).pipe(res);

    } catch (error) {

        console.error(error);

        if (!res.headersSent) {
            res.status(500).send("Server error");
        }
    }
}

module.exports = vidStream;