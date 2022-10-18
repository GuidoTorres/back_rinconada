const multer = require("multer");
const uploadFile = (req, res, next) => {
  const storage = multer.diskStorage({
    destination: "./upload",

    filename: function (req, res, cb) {
      cb(null, res.originalname);
    },
  });

  const upload = multer({ storage: storage }).single("myFile");
  console.log("esto es upload");
  console.log(upload);

  return upload;
};
module.exports = uploadFile;
