const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const fs = require("fs");
let duration;
let part;

function getDuration(filepath){
    return new Promise((resolve,reject)=>{
        ffmpeg.ffprobe(filepath,(err,data)=>{
            if(err){
                reject(err);
                return;
            }
            resolve(data.format.duration)
        })
    })
}




async function preview(filepath,prevName) {
      const duration = await getDuration(filepath);
      const totalParts = 7;

      const part = duration / totalParts;

    const prevTimes = [];
    const vidPart = [ `[0:v]trim=start=${prevTimes+5}:duration=1,setpts=PTS-STARTPTS,scale=740:-2[V${0}]`];

    for (let i = 0; i < totalParts; i++) {
        prevTimes.push(part * i);
    }

    for (let j = 1; j < prevTimes.length; j++) {
        vidPart.push(
            `[0:v]trim=start=${prevTimes[j]}:duration=1,setpts=PTS-STARTPTS,scale=740:-2[V${j}]`
        );
    }

    // [V0][V1][V2]...[V6] automatically তৈরি
    const concatInputs = [];

    for (let i = 0; i < totalParts; i++) {
        concatInputs.push(`[V${i}]`);
    }

    // সবগুলো clip একসাথে জোড়া লাগাবে
    vidPart.push(
        `${concatInputs.join("")}concat=n=${totalParts}:v=1:a=0[outv]`
    );

    console.log(vidPart);
    console.log("FFMPEG INPUT =", filepath);
console.log("FFMPEG OUTPUT =", prevName);

    ffmpeg(filepath)
        .complexFilter(vidPart)
        .map("[outv]")
         .outputOptions([
        "-preset veryfast",
        "-crf 25",
        "-pix_fmt yuv420p"
    ])
        .output(prevName)
        
.on("end", () => {

        console.log("Preview তৈরি হয়েছে");

        const size = fs.statSync(prevName).size;

        console.log(
            "Preview size:",
            (size / (1024 * 1024)).toFixed(2),
            "MB"
        );
    })
    .on("error", (err) => {
        console.log("FFmpeg error:", err);
    })
    .run();

}
module.exports = {
    getDuration,
    preview
};