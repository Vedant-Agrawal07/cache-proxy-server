import fs from "fs";
import path from "path";

export const fileExists = (filePath) => {
  return fs.existsSync(path.resolve(filePath));
};

export const readFileBuffer = (filePath) => {
  return fs.readFileSync(path.resolve(filePath));
};

export const writeCacheFile = (filePath, buffer) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, buffer);
};

export const deleteCacheFile = (filePath) => {
  fs.rmSync(path.resolve(filePath), {
    force: true,
    recursive: true,
  });
};
