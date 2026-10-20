const express = require("express");
const app = express();
const userRouter = require("./Routes/user.route");


const port = 3000;

app.use(userRouter);

app.use((req, res) => {
    res.status(404).send("404 Page Not Found");
});

app.listen(port, () => {
    console.log(`The server is running at http://localhost:${port}`);
}); 