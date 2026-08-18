const fs = require("fs")
const path=require("path")
const Busboy = require("busboy")
const ffmpeg = require("fluent-ffmpeg")
const { getDuration, preview } = require("../function/videoDuration");
const crypto = require("crypto");
const pool =





function upload(req,res){
    console.log("UPLOAD FUNCTION");
    console.log("METHOD:", req.method);
    console.log("CONTENT-TYPE:", req.headers["content-type"]);

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
    console.log("Finish");
    console.log("Received:", (Totalbyte/ (1024 * 1024)).toFixed(2), "MB");


 try {
        const duration = await getDuration(filePath);

        console.log("Duration:", duration, "seconds");

        if (duration > 30) {
            preview(filePath, prevName);
        } else {
            console.log("Video is 30 seconds or less");
        }

        res.send("Upload complete!");

    } catch (err) {
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