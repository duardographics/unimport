# Unimport 

This extension run on your workspace and find all your unused imports in your js|jsx|ts|tsx files all at once.

## Usage

To find all unused imports just open the **Command Palette** on your vscode (usually **Ctrl/Command + Shift + P**) and **type "Unimport" or "Find"**

![Unimport usage](https://s13.gifyu.com/images/S0jME.png "Unimport usage")

If you have **any unused import**, you'll see the **path** of the file that contains it on the **output panel**. 

## Features

Right now it only shows the unused imports and the path to the files right on the output panel.

Eventually features will be added for automatically remove them, and show you the changes made.  

## Extension Settings

### (optional) Config file:
You can use a configuration file in the root of your workspace.
Create a file called ".unimp.json" with the following structure:
```
{
  rootFolder: '',
  ignoreFolders: ["node_modules", ".vscode"],
  ignoreFiles: [".eslint.js"]
}
```
where you can specify the **path** from where the imports should start to be found (rootFolder) as well as the **folders and files you want to be ommited**

## Known Issues

Right now it only shows the unused imports and the path to the files right on the output panel.

