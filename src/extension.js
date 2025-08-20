"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
function activate(context) {
    const outputChannel = vscode.window.createOutputChannel('PyTorch to Graph');
    let runPythonScript = vscode.commands.registerCommand('extension.runPythonScript', async () => {
        try {
            // Get the current workspace folder
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                vscode.window.showErrorMessage('No workspace folder found');
                return;
            }
            // Example: Run a Python script from your extension's directory
            const scriptPath = path.join(context.extensionPath, 'scripts', 'hello.py');
            outputChannel.clear();
            outputChannel.show();
            outputChannel.appendLine('Running Python script...');
            outputChannel.appendLine('='.repeat(50));
            (0, child_process_1.exec)(`python3 "${scriptPath}"`, (error, stdout, stderr) => {
                if (error) {
                    outputChannel.appendLine(`Error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    outputChannel.appendLine(`Warning: ${stderr}`);
                }
                outputChannel.appendLine(stdout);
                outputChannel.appendLine('='.repeat(50));
                outputChannel.appendLine('Script completed!');
            });
        }
        catch (error) {
            outputChannel.appendLine(`Failed to run Python script: ${error}`);
        }
    });
    let runPytorchExport = vscode.commands.registerCommand('extension.runPytorchExport', async () => {
        try {
            const activeEditor = vscode.window.activeTextEditor;
            if (!activeEditor) {
                vscode.window.showErrorMessage('No active file. Please open a Python file with model and inputs defined.');
                return;
            }
            const filePath = activeEditor.document.fileName;
            if (!filePath.endsWith('.py')) {
                vscode.window.showErrorMessage('Current file is not a Python file');
                return;
            }
            // Save the file first
            await activeEditor.document.save();
            const scriptPath = path.join(context.extensionPath, 'scripts', 'pytorch_to_graph.py');
            outputChannel.clear();
            outputChannel.show();
            outputChannel.appendLine('Running PyTorch Export...');
            outputChannel.appendLine(`Input file: ${filePath}`);
            outputChannel.appendLine('='.repeat(60));
            const venvPython = path.join(path.dirname(filePath), '.venv', 'bin', 'python');
            const pythonCmd = require('fs').existsSync(venvPython) ? venvPython : 'python3';
            (0, child_process_1.exec)(`"${pythonCmd}" "${scriptPath}" "${filePath}"`, { cwd: path.dirname(filePath) }, (error, stdout, stderr) => {
                if (stderr) {
                    outputChannel.appendLine(`Warnings/Errors:\n${stderr}`);
                }
                if (stdout) {
                    outputChannel.appendLine(stdout);
                }
                if (error) {
                    outputChannel.appendLine(`Error: ${error.message}`);
                }
                outputChannel.appendLine('='.repeat(60));
                outputChannel.appendLine('PyTorch export completed!');
            });
        }
        catch (error) {
            outputChannel.appendLine(`Failed to run PyTorch export: ${error}`);
        }
    });
    let convertGraphWithGemini = vscode.commands.registerCommand('extension.convertGraphWithGemini', async (uri) => {
        try {
            let inputPath;
            if (uri && uri.fsPath.endsWith('.txt')) {
                inputPath = uri.fsPath;
            }
            else {
                const file = await vscode.window.showOpenDialog({
                    filters: { 'Text Files': ['txt'] },
                    openLabel: 'Select PyTorch Graph'
                });
                inputPath = file?.[0].fsPath;
            }
            if (!inputPath) {
                vscode.window.showErrorMessage('Please select a Python file containing a PyTorch graph!');
                return;
            }
            await vscode.workspace.fs.stat(vscode.Uri.file(inputPath)); // Ensure file exists
            const outputPath = inputPath.replace('.txt', '_ttnn.txt');
            const scriptPath = path.join(context.extensionPath, 'scripts', 'gemini_convert.py');
            const apiDocsPath = path.join(vscode.workspace.workspaceFolders?.[0].uri.fsPath || '.', 'api_docs.json');
            if (!fs.existsSync(scriptPath)) {
                vscode.window.showErrorMessage('Gemini convert script not found at scripts/gemini_convert.py');
                return;
            }
            if (!fs.existsSync(apiDocsPath)) {
                vscode.window.showErrorMessage('TTNN API docs not found at api_docs.json');
                return;
            }
            outputChannel.clear();
            outputChannel.show();
            outputChannel.appendLine('Running Gemini Graph Conversion...');
            outputChannel.appendLine(`Input file: ${inputPath}`);
            outputChannel.appendLine(`Output file: ${outputPath}`);
            outputChannel.appendLine('='.repeat(60));
            const venvPython = path.join(vscode.workspace.workspaceFolders?.[0].uri.fsPath || '.', '.venv', 'venv', 'bin', 'python');
            const pythonCmd = fs.existsSync(venvPython) ? venvPython : 'python3';
            const workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath || '.';
            (0, child_process_1.exec)(`"${pythonCmd}" "${scriptPath}" "${inputPath}" "${outputPath}"`, {
                cwd: workspaceRoot,
            }, (error, stdout, stderr) => {
                if (stderr) {
                    outputChannel.appendLine(`Warnings/Errors:\n${stderr}`);
                    if (stderr.includes('GEMINI_API_KEY')) {
                        outputChannel.appendLine('Please set GEMINI_API_KEY in .env file');
                    }
                }
                if (stdout) {
                    outputChannel.appendLine(stdout);
                }
                if (error) {
                    outputChannel.appendLine(`Error: ${error.message}`);
                }
                outputChannel.appendLine('='.repeat(60));
                outputChannel.appendLine('Gemini graph conversion completed!');
            });
        }
        catch (error) {
            outputChannel.appendLine(`Failed to run Gemini conversion: ${error}`);
        }
    });
    let exportAndConvertGraphWithGemini = vscode.commands.registerCommand('extension.exportAndConvertGraphWithGemini', async () => {
        try {
            const activeEditor = vscode.window.activeTextEditor;
            if (!activeEditor || !activeEditor.document.fileName.endsWith('.py')) {
                vscode.window.showErrorMessage('Please open a Python file with your model.');
                return;
            }
            const inputPyPath = activeEditor.document.fileName;
            await activeEditor.document.save();
            const workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath || '.';
            const scriptExport = path.join(context.extensionPath, 'scripts', 'pytorch_to_graph.py');
            const scriptConvert = path.join(context.extensionPath, 'scripts', 'gemini_convert.py');
            const apiDocsPath = path.join(workspaceRoot, 'api_docs.json');
            const savedGraphsDir = path.join(path.dirname(inputPyPath), 'saved_graphs');
            const exportedGraphPath = path.join(savedGraphsDir, 'exported_graph.txt');
            const ttnnGraphPath = path.join(savedGraphsDir, 'exported_graph_ttnn.txt');
            if (!fs.existsSync(scriptExport) || !fs.existsSync(scriptConvert)) {
                vscode.window.showErrorMessage('Required scripts not found in scripts/ directory.');
                return;
            }
            if (!fs.existsSync(apiDocsPath)) {
                vscode.window.showErrorMessage('TTNN API docs not found at api_docs.json');
                return;
            }
            outputChannel.clear();
            outputChannel.show();
            outputChannel.appendLine('Exporting PyTorch graph and converting to TTNN...');
            outputChannel.appendLine(`Input model file: ${inputPyPath}`);
            outputChannel.appendLine('='.repeat(60));
            const venvPython = path.join(workspaceRoot, '.venv', 'bin', 'python');
            const pythonCmd = fs.existsSync(venvPython) ? venvPython : 'python3';
            // Step 1: Export PyTorch graph
            outputChannel.appendLine('Step 1: Exporting PyTorch graph...');
            await new Promise((resolve, reject) => {
                (0, child_process_1.exec)(`"${pythonCmd}" "${scriptExport}" "${inputPyPath}"`, { cwd: path.dirname(inputPyPath) }, (error, stdout, stderr) => {
                    if (stderr)
                        outputChannel.appendLine(`Warnings/Errors:\n${stderr}`);
                    if (stdout)
                        outputChannel.appendLine(stdout);
                    if (error) {
                        outputChannel.appendLine(`Error: ${error.message}`);
                        reject(error);
                    }
                    else {
                        resolve();
                    }
                });
            });
            // Step 2: Convert to TTNN
            outputChannel.appendLine('='.repeat(60));
            outputChannel.appendLine('Step 2: Converting graph to TTNN...');
            await new Promise((resolve, reject) => {
                (0, child_process_1.exec)(`"${pythonCmd}" "${scriptConvert}" "${exportedGraphPath}" "${ttnnGraphPath}"`, {
                    cwd: workspaceRoot,
                    env: { ...process.env, TT_METAL_DEVICE: 'emulate' }
                }, (error, stdout, stderr) => {
                    if (stderr) {
                        outputChannel.appendLine(`Warnings/Errors:\n${stderr}`);
                        if (stderr.includes('GEMINI_API_KEY')) {
                            outputChannel.appendLine('Please set GEMINI_API_KEY in .env file');
                        }
                    }
                    if (stdout)
                        outputChannel.appendLine(stdout);
                    if (error) {
                        outputChannel.appendLine(`Error: ${error.message}`);
                        reject(error);
                    }
                    else {
                        resolve();
                    }
                });
            });
            outputChannel.appendLine('='.repeat(60));
            outputChannel.appendLine('Export and conversion completed!');
        }
        catch (error) {
            outputChannel.appendLine(`Failed to export and convert: ${error}`);
        }
    });
    let testOriginalModel = vscode.commands.registerCommand('extension.testOriginalModel', async (uri) => {
        try {
            let inputPath;
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor && activeEditor.document.fileName.endsWith('.py')) {
                inputPath = activeEditor.document.fileName;
                await activeEditor.document.save(); // Ensure latest changes are saved
            }
            else if (uri && uri.fsPath.endsWith('.py')) {
                inputPath = uri.fsPath;
            }
            else {
                vscode.window.showErrorMessage('No active Python file. Please open a Python file with your model.');
                return;
            }
            const scriptPath = path.join(context.extensionPath, 'scripts', 'test_original_model.py');
            if (!fs.existsSync(scriptPath)) {
                vscode.window.showErrorMessage('test_original_model.py not found at scripts/test_original_model.py');
                return;
            }
            outputChannel.clear();
            outputChannel.show();
            outputChannel.appendLine('Testing Original Model...');
            outputChannel.appendLine(`Input file: ${inputPath}`);
            outputChannel.appendLine('='.repeat(60));
            const venvPython = path.join(vscode.workspace.workspaceFolders?.[0].uri.fsPath || '.', '.venv', 'bin', 'python');
            const pythonCmd = fs.existsSync(venvPython) ? venvPython : 'python3';
            (0, child_process_1.exec)(`"${pythonCmd}" "${scriptPath}" "${inputPath}"`, {
                cwd: path.dirname(inputPath),
                env: { ...process.env, TT_METAL_DEVICE: 'emulate' }
            }, (error, stdout, stderr) => {
                if (stderr) {
                    outputChannel.appendLine(`Warnings/Errors:\n${stderr}`);
                }
                if (stdout) {
                    outputChannel.appendLine(stdout);
                }
                if (error) {
                    outputChannel.appendLine(`Error: ${error.message}`);
                }
                outputChannel.appendLine('='.repeat(60));
                outputChannel.appendLine('Original model test completed!');
            });
        }
        catch (error) {
            outputChannel.appendLine(`Failed to test original model: ${error}`);
        }
    });
    let runUnitTest = vscode.commands.registerCommand('extension.runUnitTest', async () => {
        try {
            const scriptPath = path.join(context.extensionPath, 'scripts', 'run_unit_tests.py');
            if (!fs.existsSync(scriptPath)) {
                vscode.window.showErrorMessage('run_unit_tests.py not found at scripts/run_unit_tests.py');
                return;
            }
            outputChannel.clear();
            outputChannel.show();
            outputChannel.appendLine('Running Unit Tests...');
            outputChannel.appendLine(`Script file: ${scriptPath}`);
            outputChannel.appendLine('='.repeat(60));
            const venvPython = path.join(vscode.workspace.workspaceFolders?.[0].uri.fsPath || '.', '.venv', 'bin', 'python');
            const pythonCmd = fs.existsSync(venvPython) ? venvPython : 'python3';
            (0, child_process_1.exec)(`"${pythonCmd}" "${scriptPath}"`, {
                cwd: path.dirname(scriptPath),
            }, (error, stdout, stderr) => {
                if (stderr) {
                    outputChannel.appendLine(`Warnings/Errors:\n${stderr}`);
                }
                if (stdout) {
                    outputChannel.appendLine(stdout);
                }
                if (error) {
                    outputChannel.appendLine(`Error: ${error.message}`);
                }
                outputChannel.appendLine('='.repeat(60));
                outputChannel.appendLine('Unit tests completed!');
            });
        }
        catch (error) {
            outputChannel.appendLine(`Failed to run unit tests: ${error}`);
        }
    });
    // Command to run Python script with user input
    let runPythonWithInput = vscode.commands.registerCommand('extension.runPythonWithInput', async () => {
        try {
            const pythonCode = await vscode.window.showInputBox({
                prompt: 'Enter Python code to execute',
                placeHolder: 'print("Hello from Python!")'
            });
            if (!pythonCode)
                return;
            // Method 2: Using spawn (better for real-time output)
            const python = (0, child_process_1.spawn)('python3', ['-c', pythonCode]);
            let output = '';
            python.stdout.on('data', (data) => {
                output += data.toString();
            });
            python.stderr.on('data', (data) => {
                vscode.window.showErrorMessage(`Python Error: ${data.toString()}`);
            });
            python.on('close', (code) => {
                if (code === 0) {
                    vscode.window.showInformationMessage(`Python output: ${output}`);
                }
                else {
                    vscode.window.showErrorMessage(`Python exited with code ${code}`);
                }
            });
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to run Python: ${error}`);
        }
    });
    // Command to run currently open Python file
    let runCurrentPythonFile = vscode.commands.registerCommand('extension.runCurrentPythonFile', async () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            vscode.window.showErrorMessage('No active file');
            return;
        }
        const filePath = activeEditor.document.fileName;
        if (!filePath.endsWith('.py')) {
            vscode.window.showErrorMessage('Current file is not a Python file');
            return;
        }
        // Save the file first
        await activeEditor.document.save();
        (0, child_process_1.exec)(`python3 "${filePath}"`, (error, stdout, stderr) => {
            if (error) {
                vscode.window.showErrorMessage(`Error: ${error.message}`);
                return;
            }
            if (stderr) {
                vscode.window.showWarningMessage(`Warning: ${stderr}`);
            }
            // Show output in a new document
            vscode.workspace.openTextDocument({
                content: stdout,
                language: 'plaintext'
            }).then(doc => {
                vscode.window.showTextDocument(doc);
            });
        });
    });
    context.subscriptions.push(runPythonScript, runPytorchExport, convertGraphWithGemini, exportAndConvertGraphWithGemini, testOriginalModel, runUnitTest, runPythonWithInput, runCurrentPythonFile, outputChannel);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map