import torch
import torchvision
from torchvision.models import resnet18, ResNet18_Weights

# Define your model and inputs here
model = resnet18(weights=ResNet18_Weights.DEFAULT)
model = model.to(torch.bfloat16)

# Create example inputs
inputs = torch.rand((1, 3, 224, 224), dtype=torch.bfloat16)