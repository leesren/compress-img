/**
 * 压缩图片
 */
const fs = require('fs');
const path = require('path');
const tinify = require('tinify');
tinify.key = '6YF3nRN93XWXs4xdWKYKVQbmghzJS4q8';

export class FileSystemManager {
  readDir(filePath) {
    return new Promise((resolve, reject) => {
      fs.readdir(filePath, (error, files) => {
        if (error) {
          reject(error);
        } else {
          resolve(files);
        }
      });
    });
  }
  stat(fileDirection) {
    return new Promise((resolve, reject) => {
      fs.stat(fileDirection, function(error, stats) {
        if (error) {
          reject(error);
        } else {
          resolve(stats);
        }
      });
    });
  }
  mkDir(dirPath) {
    return new Promise((resolve, reject) => {
      // path.sep 文件路径分隔符（mac 与 window 不同）
      // 转变成数组，如 ['a', 'b', 'c']
      let parts = dirPath.split(path.sep);
      for (let i = 1; i <= parts.length; i++) {
        // 重新拼接成 a a/b a/b/c
        let current = parts.slice(0, i).join(path.sep);
        // accessSync 路径不存在则抛出错误在 catch 中创建文件夹
        try {
          fs.accessSync(current);
        } catch (e) {
          fs.mkdirSync(current);
        }
      }
      resolve();
    });
  }
  copyFile(source, dest) {
    let rs = fs.createReadStream(source);
    //创建一个可写流
    let ws = fs.createWriteStream(dest);
    //将可读流中的数据写入到可写流中
    rs.pipe(ws);
  }
  exists(dirName, flag) {
    if (!dirName) {
      throw new Error('路径为空', dirName);
    }
    return new Promise((resolve, reject) => {
      try {
        fs.exists(dirName, exists => {
          if (exists) {
            resolve(true);
          } else {
            if (flag) {
              this.mkDir(dirName)
                .then(res => {
                  resolve(true);
                })
                .catch(error => {
                  reject(false);
                });
            } else {
              reject(false);
            }
          }
        });
      } catch (error) {
        console.error(error);
        reject(false);
      }
    });
  }
  async copyByDirection(filePath, destPath) {
    // 显示文件夹下的所有文件
    try {
      await this.exists(destPath, true);
      const files = await this.readDir(filePath);
      for (const filename of files) {
        let fileDir = path.join(filePath, filename);
        const stats = await this.stat(fileDir);
        const isFile = stats.isFile(); //是文件
        const isDir = stats.isDirectory(); //是文件夹
        const destDir = path.join(destPath, filename);

        let subDir = path.join(destPath, filename);
        if (isFile) {
          // console.log('文件 ', fileDir); // 读取文件内容
          this.copyFile(fileDir, subDir);
        }
        if (isDir) {
          await this.exists(subDir, true);
          // console.log('目录 ', fileDir); // 读取文件内容
          this.copyByDirection(fileDir, subDir);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
  tinyPngHandle(filePath, destPath, option) {
    if (/.(png|jpg|jpeg)$/i.test(filePath)) {
      const source = tinify.fromFile(filePath);
      source.toFile(destPath);
    } else {
      this.copyFile(filePath, destPath);
    }
  }
  async compressImg(filePath, destPath, isCompress = false) {
    // 显示文件夹下的所有文件
    try {
      await this.exists(destPath, true);
      const files = await this.readDir(filePath);
      for (const filename of files) {
        let fileDir = path.join(filePath, filename);
        const stats = await this.stat(fileDir);
        const isFile = stats.isFile(); //是文件
        const isDir = stats.isDirectory(); //是文件夹
        const destDir = path.join(destPath, filename);

        let subDir = path.join(destPath, filename);

        if (isFile) {
          // console.log('文件 ', fileDir); // 读取文件内容
          this.tinyPngHandle(fileDir, subDir, {});
        }
        if (isDir) {
          await this.exists(subDir, true);
          // console.log('目录 ', fileDir); // 读取文件内容
          this.compressImg(fileDir, subDir);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
}

const fsm = new FileSystemManager();
// node  index.js ../dist ../dest
const args = process.argv.splice(2);
// fsm.compressImg('../dist', '../dest', true);
fsm.compressImg(args[0], args[1], true);
