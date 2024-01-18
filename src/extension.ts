import * as vscode from 'vscode';
import * as fs from 'node:fs';
import * as path from 'node:path';

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('unimport.findImports', () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    
    const outputChannel = vscode.window.createOutputChannel('Unimport');

    if (workspaceFolders && workspaceFolders.length > 0) {
      const workspaceRoot = workspaceFolders[0].uri.fsPath;
      interface ImportsResult {
        imports: string[];
        line: string;
      }
      
      let config:any = {};
      
      const getJsFiles = (path: string) => {
        fs.readdir(path,{ withFileTypes: true }, (err:NodeJS.ErrnoException | null, res: fs.Dirent[])=>{
          if(!err){
            for(const f of res){
              if(f.isDirectory()){
                if(!config.ignoreFolders.includes(f.name)){
                  getJsFiles(`${path}${f.name}\\`);
                  continue;
                }
              }
              if(/\.(js|jsx|ts|tsx)$/.test(f.name) && !config.ignoreFiles.includes(f.name)){
                readJsImports(`${path}${f.name}`);
              }
            }
          };
        });
      };
      
      const readJsImports = (file:string) => {
        
        fs.readFile(file, 'utf-8', async (err:NodeJS.ErrnoException | null, f:string)=>{
          if(err) {console.log(err); return;};
          const imports : ImportsResult[] = await readFile(f);
          const unused : string[] = [];
          
          for(const i of imports){
            const tempFile = f.replace(i.line, '');
            if(i.imports.length === 1){
              const regx = new RegExp("[\\s{@\\[\\]<>.,;\\(\\)\\!]+(" + i.imports[0] +")[\\(\\)<>.,;{\\s\\[\\]]+", 'g');
              const matches = tempFile.match(regx);
              if(!matches){
                unused.push(i.imports[0]);
              }
            }else{
              for(const x of i.imports){
                const regx = new RegExp("[\\s{@\\[\\]<>.,;\\(\\)\\!]+(" + x +")[\\(\\)<>.,;{\\s\\[\\]]+", 'g');
                const matches = tempFile.match(regx);
                if(!matches){
                  unused.push(x);
                }
              }
            }
          }
      
          vscode.languages.getLanguages();
          if(unused.length>0){
            outputChannel.appendLine(`${unused.length} unused imports at ${file}`);
            outputChannel.show();
          }
        });
      };
      
      
      
      const rgx = /import[\s{]*([_\w\s,*]+)[\s}]*from(?:['"\s]+)[@/-_.\w]+['"\s;]/;
      const checkForFinalName = (name: string):string => {
        if(!name.includes(' as ')){
          return name.trim();
        };
        return name.split(' as ')[1].trim();
      };
      
      const getImports = (line:string):string[] => {
        const match = line.match(rgx);
        const names : string[] = [];
        if(match){
          if(match[1].includes(',')){
            names.push(... match[1].split(',').map(x=>checkForFinalName(x)));
          }else{
            names.push(checkForFinalName(match[1]));
          }
        }  
      
        return names;
      };
      
      const readFile = (file:string): Promise<ImportsResult[]> => new Promise((resolve)=>{
        const lines = file.split('\r');
        const allResults : ImportsResult[] = [];
        for(const l of lines){
          if(l.includes('import ')){
            const imports = l.split(';');
            for(const i of imports){
              if(i !== ''){
                const result = getImports(i);
                
                if(result.length>0){
                  allResults.push({imports: result, line: l});
                }
              }
            }
          }
        }
        resolve(allResults);
      });
      
      const start = async () =>{
        try{
      
            const configFile = fs.readFileSync(path.join(workspaceRoot, '.unimp.json'), 'utf8');
              
            config = JSON.parse(configFile);
          } catch {
            vscode.window.showWarningMessage('No config file found for Unimport Extension.');
            config = {
              rootFolder: '',
              ignoreFolders: ['node_modules'],
              ignoreFiles: []
            };
          }
      
        const sourceDir = path.join(workspaceRoot, config.rootFolder ?? '');
        getJsFiles(sourceDir+'\\');

      };
      
      start();
    } else {
      vscode.window.showWarningMessage('No workspace opened. Cannot create file.');
    }
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
