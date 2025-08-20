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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
function activate(context) {
    const outputChannel = vscode.window.createOutputChannel('PyTorch to Graph');
    let runPythonScript = vscode.commands.registerCommand('extension.runPythonScript', () => __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            // Get the current workspace folder
            const workspaceFolder = (_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0];
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
    }));
    let runPytorchExport = vscode.commands.registerCommand('extension.runPytorchExport', () => __awaiter(this, void 0, void 0, function* () {
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
            yield activeEditor.document.save();
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
    }));
    let convertGraphWithGemini = vscode.commands.registerCommand('extension.convertGraphWithGemini', (uri) => __awaiter(this, void 0, void 0, function* () {
        var _b, _c, _d;
        try {
            let inputPath;
            if (uri && uri.fsPath.endsWith('.txt')) {
                inputPath = uri.fsPath;
            }
            else {
                const file = yield vscode.window.showOpenDialog({
                    filters: { 'Text Files': ['txt'] },
                    openLabel: 'Select PyTorch Graph'
                });
                inputPath = file === null || file === void 0 ? void 0 : file[0].fsPath;
            }
            if (!inputPath) {
                vscode.window.showErrorMessage('Please select a Python file containing a PyTorch graph!');
                return;
            }
            yield vscode.workspace.fs.stat(vscode.Uri.file(inputPath)); // Ensure file exists
            const outputPath = inputPath.replace('.txt', '_ttnn.txt');
            const scriptPath = path.join(context.extensionPath, 'scripts', 'gemini_convert.py');
            const apiDocsPath = path.join(((_b = vscode.workspace.workspaceFolders) === null || _b === void 0 ? void 0 : _b[0].uri.fsPath) || '.', 'api_docs.json');
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
            const venvPython = path.join(((_c = vscode.workspace.workspaceFolders) === null || _c === void 0 ? void 0 : _c[0].uri.fsPath) || '.', '.venv', 'venv', 'bin', 'python');
            const pythonCmd = fs.existsSync(venvPython) ? venvPython : 'python3';
            (0, child_process_1.exec)(`"${pythonCmd}" "${scriptPath}" "${inputPath}" "${outputPath}"`, {
                cwd: (_d = vscode.workspace.workspaceFolders) === null || _d === void 0 ? void 0 : _d[0].uri.fsPath,
                env: Object.assign(Object.assign({}, process.env), { TT_METAL_DEVICE: 'emulate' })
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
    }));
    let exportAndConvertGraphWithGemini = vscode.commands.registerCommand('extension.exportAndConvertGraphWithGemini', () => __awaiter(this, void 0, void 0, function* () {
        var _e;
        try {
            const activeEditor = vscode.window.activeTextEditor;
            if (!activeEditor || !activeEditor.document.fileName.endsWith('.py')) {
                vscode.window.showErrorMessage('Please open a Python file with your model.');
                return;
            }
            const inputPyPath = activeEditor.document.fileName;
            yield activeEditor.document.save();
            const workspaceRoot = ((_e = vscode.workspace.workspaceFolders) === null || _e === void 0 ? void 0 : _e[0].uri.fsPath) || '.';
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
            yield new Promise((resolve, reject) => {
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
            yield new Promise((resolve, reject) => {
                (0, child_process_1.exec)(`"${pythonCmd}" "${scriptConvert}" "${exportedGraphPath}" "${ttnnGraphPath}"`, {
                    cwd: workspaceRoot,
                    env: Object.assign(Object.assign({}, process.env), { TT_METAL_DEVICE: 'emulate' })
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
    }));
    let testOriginalModel = vscode.commands.registerCommand('extension.testOriginalModel', (uri) => __awaiter(this, void 0, void 0, function* () {
        var _f;
        try {
            let inputPath;
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor && activeEditor.document.fileName.endsWith('.py')) {
                inputPath = activeEditor.document.fileName;
                yield activeEditor.document.save(); // Ensure latest changes are saved
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
            const venvPython = path.join(((_f = vscode.workspace.workspaceFolders) === null || _f === void 0 ? void 0 : _f[0].uri.fsPath) || '.', '.venv', 'bin', 'python');
            const pythonCmd = fs.existsSync(venvPython) ? venvPython : 'python3';
            (0, child_process_1.exec)(`"${pythonCmd}" "${scriptPath}" "${inputPath}"`, {
                cwd: path.dirname(inputPath),
                env: Object.assign(Object.assign({}, process.env), { TT_METAL_DEVICE: 'emulate' })
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
    }));
    // Command to run Python script with user input
    let runPythonWithInput = vscode.commands.registerCommand('extension.runPythonWithInput', () => __awaiter(this, void 0, void 0, function* () {
        try {
            const pythonCode = yield vscode.window.showInputBox({
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
    }));
    // Command to run currently open Python file
    let runCurrentPythonFile = vscode.commands.registerCommand('extension.runCurrentPythonFile', () => __awaiter(this, void 0, void 0, function* () {
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
        yield activeEditor.document.save();
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
    }));
    context.subscriptions.push(runPythonScript, runPytorchExport, convertGraphWithGemini, exportAndConvertGraphWithGemini, testOriginalModel, runPythonWithInput, runCurrentPythonFile, outputChannel);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
