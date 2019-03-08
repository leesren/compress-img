# 压缩图片

给一个指定目录，压缩该目录下的所有图片，然后输出到给定的目录。非压缩的图片不压缩，直接复制到输出目录（或者过滤不输出）

```bash

# clone
git clone https://github.com/leesren/compress-img.git

# install
npm instal

# compress

node index.js ./src/images ./dist/images
# 过滤非图片输出
node index.js ./src/images ./dist/images filter

```

> 图片类型只能是 png | jpg | jpeg
> 压缩算法是 tinypng 的官方库
