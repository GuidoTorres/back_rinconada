const multer = require("multer");
const path = require("path")
const uploadFile = (req, res, next) => {
  const storage = multer.diskStorage({
    destination: "./images",

    filename: function (req, res, cb) {
      //poner nombres diferentes a cada imagen
      cb(null, Date.now() + path.extname(res.originalname));
    },
  });

  const upload = multer({ storage: storage, limits: { fieldSize: 10 * 1024 * 1024 } }).single("image");
  return upload;
};
module.exports = uploadFile;