# Torch to Tensix VS Code Extension

## Overview
Torch to Tensix is a Visual Studio Code extension that streamlines the process of converting PyTorch models—including Hugging Face models—into graph representations and TTNN (Tensix) format. It also provides tools for testing and validating both the original and converted models, all within the VS Code environment.

## Features
- Convert PyTorch models to their corresponding FX Graphs
- Convert PyTorch Graphs to TTNN (Tensix) Graphs using Gemini
- Test the original PyTorch model
- Test and validate the resulting TTNN model
- Supports Hugging Face models and custom user inputs

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/maishimozato/pytorch-to-ttnn-vscode-extension
   ```
2. Install Node dependencies:
   ```
   npm install
   ```
3. Build the extension (if developing):
   ```
   npm run compile
   ```
4. [Optional, for users] Install the packaged extension:
   - Download or build the `.vsix` file (e.g., `vscode-extension-0.0.1.vsix`).
   - In VS Code, open the Command Palette (`Cmd+Shift+P` or `Ctrl+Shift+P`), type `Extensions: Install from VSIX...`, and select your `.vsix` file.

5. Set up your Python environment:
   - Create and activate a virtual environment (recommended).
   - Install required Python packages:
     ```
     pip install torch torchvision requests python-dotenv transformers
     ```
6. Ensure you have the following in your workspace root:
   - `api_docs.json` (the TTNN API documentation file)
   - `.env` file containing your Gemini API key:
     ```
     GEMINI_API_KEY=your_actual_key_here
     ```
## Building the VSIX Extension Package

If you make changes to the extension and want to create a new `.vsix` file for distribution or installation:

1. Make sure all your changes are saved and the extension is compiled:
   ```
   npm run compile
   ```
2. Install the VSCE packaging tool if you haven't already:
   ```
   npm install -g @vscode/vsce
   ```
3. Build the `.vsix` package:
   ```
   vsce package
   ```
   This will generate a file like `vscode-extension-0.0.1.vsix` in your project directory.

4. You can now share or install this `.vsix` file using the instructions above.

## Usage

1. Open Visual Studio Code in your project directory.
2. Open (or create) a Python file (e.g., `test.py`) that defines a PyTorch model and its inputs (including Hugging Face models if desired). For testing purposes, use the test directory in this repo.
3. Make sure your Python environment is activated and all dependencies are installed.
4. Use the Command Palette (`Cmd+Shift+P` or `Ctrl+Shift+P`) and type:
   - `Export and Convert PyTorch Graph with Gemini`
   - Or any other command provided by the extension (e.g., `Test Original Model`)
5. Follow prompts and check the output channel for results.

**Note:**  
You must have your Python model file (e.g., `test.py`) open and selected in VS Code when running the export/convert commands.

## Contributing
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes and commit them (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a pull request.

## License
This project is licensed under the [Your License] License - see the [LICENSE](LICENSE) file for details.