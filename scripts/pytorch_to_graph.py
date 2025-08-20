# SPDX-License-Identifier: Apache-2.0
import torch
import torchvision
import sys
import os

def capture_graph_backend(gm, example_inputs):
    # Create a directory for saved graphs if it doesn't exist
    save_dir = "saved_graphs"
    os.makedirs(save_dir, exist_ok=True)
    
    # Save the graph module code to a file
    graph_file = os.path.join(save_dir, "exported_graph.txt")
    with open(graph_file, "w") as graph_file_2:
        print(gm.graph, file=graph_file_2)
    
    print(f"Graph module saved to: {graph_file}")
    
    # Return the original graph module to continue compilation
    return gm

def test_resnet(model, inputs):
    # Export the model to get the FX graph module
    exported_program = torch.export.export(model, (inputs,), strict=False)
    gm = exported_program.module()
    
    # Save the graph module using our capture function
    capture_graph_backend(gm, (inputs,))
    
    # Optionally, you can still run the exported model
    output = exported_program.module()(inputs)
    
    return output

def main():
    try:
        if len(sys.argv) > 1:
            user_file = sys.argv[1]
            print(f"Executing user file: {user_file}")
            user_ns = {}
            exec(open(user_file).read(), user_ns)
            model = user_ns.get('model')
            inputs = user_ns.get('inputs')
            if model is not None and inputs is not None:
                print("Found model and inputs, running PyTorch export...")
                output = test_resnet(model, inputs)
                print(f"Export completed successfully! Output shape: {output.shape}")
            else:
                print("Error: 'model' and 'inputs' variables not found in the file")
        else:
            # Default example if no file provided
            print("No user file provided, running default ResNet18 example...")
            model = torchvision.models.get_model("resnet18", pretrained=True)
            model = model.to(torch.bfloat16)
            inputs = torch.rand((1, 3, 224, 224), dtype=torch.bfloat16)
            output = test_resnet(model, inputs)
            print(f"Default export completed! Output shape: {output.shape}")
            
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()