const cp = require('child_process');
const fs = require('fs');
const path = require('path');
const handImportedIcons = require('../src/assets/icons/hand-imported.json');

const sourcePath = './src/assets/icons/svg';
const destinationPath = './src/assets/icons/png';
const iconsDestinationPath = './src/uikit/Icon';
const importMobilePath = '$assets/icons/png';

async function readdirAsync(path, options = {}) {
  return new Promise((resolve, reject) => {
    fs.readdir(path, options, async (error, entries) => {
      if (error) throw reject(error);
      resolve(entries);
    });
  });
}

async function getFiles(path = "./") {
  const entries = await readdirAsync(path, { withFileTypes: true });
  const error = null;
  // Get files within the current directory and add a path key to the file objects
  const files = entries
      .filter(file => !file.isDirectory() && file.name.endsWith('.svg'))
      .map(file => {
        const size = file.name.match(/\d+/g)[0];

        if (!size) {
          error = `Error detect size for ${file.name}`
        }

        return {  
          src: path + '/' + file.name,
          filename: file.name.replace('.svg', ''),
          size
        };
      });
  
  if (error) {
    throw new Error(error);
  }

  // // Get folders within the current directory
  const folders = entries.filter(folder => folder.isDirectory());

  for (const folder of folders) {
    files.push(...await getFiles(`${path}/${folder.name}`));
  }

  return files;
}

// brew install librsvg
(async function doConvert() {
  const svgs = await getFiles(sourcePath);
  
  try {
    console.log('______________________');

    console.log('[step 0]: clear directory');
    const directory = destinationPath;
    const skipFiles = handImportedIcons.map((icon) => icon.filename + '@4x.png');
    fs.readdir(directory, (err, files) => {
      if (err) throw err;
    
      for (const file of files) {
        if (skipFiles.includes(file)) {
          continue;
        }
        fs.unlink(path.join(directory, file), err => {
          if (err) throw err;
        });
      }
    });

    console.log('[step 1]: SVG to PNG');
    console.log('____ FILE LIST ____');
    for (let i of svgs) {
      console.log(i.src);
      let suffix = '.png';
      if (i.suffix) {
        suffix = '.' + i.suffix + '.png'
      }
      
      if (fs.existsSync(destinationPath + i.src + '-' + i.size + '@4x' + suffix)) {
        fs.unlinkSync(destinationPath + i.src + '-' + i.size + '@4x' + suffix);
      }

      let proc1 = cp.exec('rsvg-convert -w ' + (i.size * 4) + ` ${i.src}` + ` -o ${destinationPath}/` + i.filename + '@4x' + suffix);
      await new Promise((r) => proc1.on('exit', (code) => {
        // 127 - not found rsvg-convert, need install
        if (code !== 0) {
          console.log('!!! Error rsvg-convert');
        }
        r();
      }));
    }
    console.log('___________________');

    // //
    // // Generate Components
    // //

    console.log('[step 2]: Generate code');

    // Types
    const types = `
      export type IconNames = ${Array.from(
        [...svgs, ...handImportedIcons],
        (i) => `\'${i.filename}\'`,
      ).join(' | ')};

      export const AllIcons = ${JSON.stringify(
        Array.from([...svgs, ...handImportedIcons], (i) => i.filename),
      )};

      export const IconSizes = {
        ${[...svgs, ...handImportedIcons].map((icon) => {
          const size = icon.size
          return `'${icon.filename}': ${size},\n\t`
        }).join('')}
      }
    `;
    fs.writeFileSync(`${iconsDestinationPath}/generated.types.ts`, types);
    
    // // Web
    // const IconsWeb = `
    //   ${files.icons.map((icon) => {
    //     return `import ${camelize(icon.name)} from '../../../assets/svg/${icon.src}';\n`
    //   }).join('')}

    //   export const IconsWebList = {
    //     ${files.icons.map((icon) => {
    //       return `'${icon.name}': ${camelize(icon.name)},\n`
    //     }).join('')}
    //   };
    // `;
    
    // fs.writeFileSync('./packages/@shared/components/UI/Icon/IconsWebList.ts', IconsWeb);
    // const prettierWeb = cp.exec('npx prettier --write ./packages/@shared/components/UI/Icon/IconsWebList.ts');

    // Mobile
    const IconsMobile = `
      export const MobileIconsList = {
        ${[...svgs, ...handImportedIcons]
          .map((icon) => {
            return `'${icon.filename}': require('${importMobilePath}/${icon.filename}.png'),\n`;
          })
          .join('')}
      };
    `;

    fs.writeFileSync(`${iconsDestinationPath}/IconsMobileList.ts`, IconsMobile);
    
    
    const prettier = cp.exec(`npx prettier --write ${iconsDestinationPath}/**`);
    await new Promise((r) => prettier.on('exit', (code) => {
      if (code !== 0) {
        console.log('!!! Error icon mobile prettier');
      }
      
      r();
    }));
    console.log('___ END ___');
  } catch (e) {
    console.warn(e);
  }
})()

function camelize(str) {
  str = str.replace(/-/g, ' ');
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
    if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
    return match.toUpperCase();
  });
}