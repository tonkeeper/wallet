const fs = require('fs');
const path = require('path');

const pathExp = __dirname.split('/');
pathExp.pop();

// Specify the directory of your JSON files here
const directoryPath = `${pathExp.join('/')}/i18n/locales/tonkeeper`;

// Function to recursively traverse and fix values in an object or array
function traverseAndFix(obj) {
  for (let key in obj) {
    if (typeof obj[key] === 'string') {
      // Replace '{{'value'}}' with {{value}}
      obj[key] = obj[key].replace(/'\{\{\s*'([^}]+)'\s*\}\}'/g, '{{$1}}');

      // Replace {value} with %{value}, excluding already existing %{value} or {{value}}
      obj[key] = obj[key].replace(/(?<!\{)(?<!%)({([^{}]+)})(?!\})/g, '%{$2}');
    } else if (typeof obj[key] === 'object') {
      traverseAndFix(obj[key]);
    }
  }
}

// Function to fix the translations in a file
function fixTranslations(filePath) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading file from disk: ${err}`);
    } else {
      // Parse the JSON data
      let jsonData = JSON.parse(data);

      // Recursively fix the translations
      traverseAndFix(jsonData);

      // Write the modified JSON back to the file
      fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
        if (err) return console.log(err);
        console.log(`File has been saved: ${filePath}`);
      });
    }
  });
}

// Read the directory and apply the fix to each JSON file
fs.readdir(directoryPath, (err, files) => {
  if (err) {
    console.error(`Could not list the directory: ${err}`);
    return;
  }

  files.forEach((file) => {
    if (path.extname(file) === '.json') {
      fixTranslations(path.join(directoryPath, file));
    }
  });
});
