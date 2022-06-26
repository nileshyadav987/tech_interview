const fs = require("fs");


module.exports.upload = function (
  fileobj = null,
  targetpath = null,
  oldfile = null
) {
  return new Promise(async function (resolve, reject) {
    var photofile = fileobj;

    var result = Math.round(Math.random() * Math.pow(36, 12)).toString(36);

    var generatefilename = (
      result +
      "-" +
      Math.floor(new Date() / 1000) +
      photofile.name.substr(photofile.name.length - 50)
    ).replace(/\s/g, "");
    photofile.mv(targetpath + generatefilename, function (err) {
      //console.log(err);
      if (err) {
        console.log("rt45", err);
        reject("Photo upload error #3");
      }
      console.log(targetpath + oldfile, "jfjoo");

      if (oldfile && fs.existsSync(targetpath + oldfile)) {
        fs.unlinkSync(targetpath + oldfile);
      }
      //newcontact.photo = generatefilename;
      resolve(generatefilename);
    });
  });
};

module.exports.remove = function (targetpath = null, oldfile = null) {
  console.log("kfhfuu", targetpath + oldfile);
  return new Promise(async function (resolve, reject) {
    if (oldfile && fs.existsSync(targetpath + oldfile)) {
      fs.unlinkSync(targetpath + oldfile);
    }
    resolve(true);
  });
};