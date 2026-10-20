const fs = require("fs")
const path=require("path")
const Busboy = require("busboy")
const { getDuration, preview } = require("../function/videoDuration");
const crypto = require("crypto");
const pool = require("../dbConfig/db");


async function upload(req,res){
 

const bb = Busboy({
    headers: req.headers

})

bb.on("file",(name,file,info)=>{

    const id = crypto.randomUUID();

    const filePath = path.join(
    __dirname,
    "..",
    "videos",
   `${info.filename}__preView_${id}.mp4`

    )
const fileName = path.basename(
    filePath,
    path.extname(filePath)
)

const prevName = path.join(
    __dirname,
    "..",
    "videos",
    "preview",
   `${fileName}__preView_${id}.mp4`
);

const writeStream=fs.createWriteStream(filePath)
let Totalbyte = 0;

        file.on("data", (chunk) => {
            Totalbyte += chunk.length;
        });


writeStream.on("finish",async()=>{

    const userId=1;
    const title= fileName;
    const description="RANdom video cheek in server please no hasistate"

    console.log("Finish");
    console.log("Received:", (Totalbyte/ (1024 * 1024)).toFixed(2), "MB");


 try {
    const[result]=await pool.execute(
        `INSERT INTO videos
        (user_id,title,description,video_url,visibility,status)
        VALUES(?,?,?,?,?,?)`,
        [
            userId,
            title,
            description,
            "/api/videos/temp",
            "public",
            "processing"


        ]
    );
    const videoId=result.insertId
        const duration = await getDuration(filePath);
        if (duration > 30) {
            await preview(filePath, prevName);
        } else {
            console.log("Video is 30 seconds or less");
        }
          await pool.execute(
            `UPDATE videos
             SET
                video_url = ?,
                preview_url = ?,
                status = ?
             WHERE id = ?`,
            [
                `/api/videos/${videoId}`,
                `/api/videos/${videoId}/preview`,
                "ready",
                videoId
            ]
        );


        res.send("Upload complete!");

    } catch (err) {
        await fs.promises.unlink(filePath);
        await fs.promises.unlink(prevName);
        console.log("Original video deleted");
        console.log("Duration error:", err);
        res.status(500).send("Video processing failed");
    }

});

file.on("error",(err)=>{
    console.log("err");
});

file.pipe(writeStream);
});
 req.pipe(bb);    

}

module.exports =upload;