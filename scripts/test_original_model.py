import sys
import os
import torch

def test_original_model(input_file: str):
    if not os.path.exists(input_file):
        raise FileNotFoundError(f"Input file {input_file} not found")

    with open(input_file, "r", encoding="utf-8") as f:
        model_code = f.read()

    # Execute the model code in a local dictionary to capture 'model'
    locals_dict = {}
    exec(model_code, globals(), locals_dict)
    model = locals_dict.get('model')
    inputs = locals_dict.get('inputs') 
    if not isinstance(model, torch.nn.Module):
        raise ValueError("No valid PyTorch model found in the code (expected 'model = ...')")

    if inputs is not None:
        input_data = inputs
        print(f"Using user-defined input shape: {input_data.shape}")
    else:
        # Fallback: Generate sample input (assuming ImageNet-like model)
        input_data = torch.randn(1, 3, 224, 224)
        print(f"Sample input shape: {input_data.shape}")

    # Run inference
    model.eval()  # Set to evaluation mode
    with torch.no_grad():
        output = model(input_data)

    print(f"Original model output shape: {output.shape}")
    print(f"Original model output values: {output}")

    if output.ndim == 2 and output.shape[1] == 1000:
        # Download ImageNet class labels if not present
        import json, urllib.request
        LABELS_URL = "https://raw.githubusercontent.com/pytorch/hub/master/imagenet_classes.txt"
        labels_path = "imagenet_classes.txt"
        if not os.path.exists(labels_path):
            urllib.request.urlretrieve(LABELS_URL, labels_path)
        with open(labels_path, "r") as f:
            categories = [s.strip() for s in f.readlines()]
        probs = torch.nn.functional.softmax(output[0], dim=0)
        top5_prob, top5_catid = torch.topk(probs, 5)
        print("Top-5 predictions:")
        for i in range(top5_prob.size(0)):
            print(f"{categories[top5_catid[i]]}: {top5_prob[i].item():.4f}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python test_original_model.py <input_file.py>")
        sys.exit(1)
    test_original_model(sys.argv[1])
