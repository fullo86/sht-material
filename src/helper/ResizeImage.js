const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const resizeImage = async (filepath, width = 300, height = 300) => {
  try {
    const ext = path.extname(filepath);
    const tempPath = filepath.replace(ext, `-resized${ext}`);

    await sharp(filepath)
      .resize(width, height)
      .toFile(tempPath);

    fs.unlinkSync(filepath);
    fs.renameSync(tempPath, filepath);

    return true;
  } catch (err) {
    console.error('Resize error:', err);
    return false;
  }
};

module.exports = { resizeImage };
