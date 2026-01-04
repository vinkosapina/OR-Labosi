const express = require('express');
const app = express();
const PORT = 3000;

const apiRoute = require("./routes/api");
const downloadRoute = require("./routes/download");
app.use("/api", apiRoute);
app.use("/download", downloadRoute);

app.use(express.static('public'));

app.listen(PORT, () => {
  console.log(`Server pokrenut na vratima: ${PORT}`);
});
