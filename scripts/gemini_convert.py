import os
import sys
import requests
from dotenv import load_dotenv

def split_lines(text, n):
    lines = text.splitlines(keepends=True)
    for i in range(0, len(lines), n):
        yield ''.join(lines[i:i+n])

def convert_pytorch_to_ttnn(input_file: str, output_file: str, api_docs_file: str = "api_docs.json"):
    workspace_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    load_dotenv(os.path.join(workspace_root, '.env'))
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in .env file")

    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
    headers = {
        "Content-Type": "application/json",
        "X-goog-api-key": api_key,
    }

    # Read PyTorch graph
    if not os.path.exists(input_file):
        raise FileNotFoundError(f"Input file {input_file} not found")
    with open(input_file, "r", encoding="utf-8") as f:
        pytorch_graph = f.read()

    # Read TTNN API docs
    if not os.path.exists(api_docs_file):
        raise FileNotFoundError(f"TTNN API file {api_docs_file} not found")
    with open(api_docs_file, "r", encoding="utf-8") as f:
        ttnn_api = f.read()

    chunks = list(split_lines(pytorch_graph, 50))
    converted_graph = ""

    for idx, chunk in enumerate(chunks):
        print(f"Processing chunk {idx+1}/{len(chunks)}...")
        data = {
            "contents": [
                {
                    "parts": [
                        {"text": (
                            "Start a new chat. Edit the nodes in the following pytorch graph chunk to use Tenstorrent's TTNN ops instead, "
                            "and output the new graph chunk without any additional text. "
                            "If the conversion for any node is not one-to-one, come up with a new translation for that node."
                        )},
                        {"text": "\npytorch graph chunk:\n" + chunk},
                        {"text": "\nTTNN ops:\n" + ttnn_api}
                    ]
                }
            ]
        }
        try:
            response = requests.post(url, headers=headers, json=data)
            response.raise_for_status()
            text_output = response.json()["candidates"][0]["content"]["parts"][0]["text"]
            text_output = "\n".join(
                line for line in text_output.splitlines()
                if line.strip() not in ("```python", "```")
            )
        except Exception as e:
            raise RuntimeError(f"Gemini API request failed on chunk {idx+1}: {e}")

        converted_graph += text_output + "\n"

    # Save output
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(converted_graph)
    print(f"Converted graph saved to {output_file}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python gemini_convert.py <input_file> <output_file>")
        sys.exit(1)
    convert_pytorch_to_ttnn(sys.argv[1], sys.argv[2])