const fs = require("fs-extra");
const path = require("path");
const prettier = require('prettier')

const srcDir = path.resolve(__dirname, "../../docs");
const srcDirReg = new RegExp(path.resolve(__dirname, "../../docs"));
console.log("🚀-  -> srcDir:", srcDir);

const blackList = [".vitepress"];
async function fileRecursion(path) {
  return new Promise((resolve) => {
    fs.readdir(path, async (err, files) => {
      const configs = (
        await Promise.all(
          files.map(async (file) => {
            if (blackList.includes(file)) {
              return null;
            }

            const filePath = `${path}/${file}`;
            const fileName = `${file.replace(/.md/, "")}`;

            const stats = await fs.stat(filePath);
            if (!stats.isDirectory()) {
              return {
                text: fileName,
                link: `${path}/${fileName}`.replace(srcDirReg, ""),
              };
            } else {
              const items = await fileRecursion(filePath);
              return {
                text: fileName,
                items,
              };
            }
          })
        )
      ).filter(Boolean);

      resolve(configs);
    });
  });
}

async function main() {
  try {
    const configs = await fileRecursion(srcDir);
    console.log("🚀-  -> configs:", JSON.stringify(configs));
    const content = await prettier.format(`export default ${JSON.stringify(configs)}`, { parser: 'typescript' })
    fs.writeFileSync(
      path.resolve(__dirname, "./sidebarConfig.js"),
      content
    );
  } catch (e) {
    console.log("🚀-  -> main  -> e:", e);
  }
}

main();
