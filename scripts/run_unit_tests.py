import unittest
import re
import sys
class TestDynamicTranslation(unittest.TestCase):
    def test_translation_rules(self):
        """
        Dynamically tests if the AI translator correctly applied the translation rules
        defined in a mapping dictionary.
        """
        # STEP 1: Define the "Rulebook" of translations.
        # This mapping is your source of truth.
        pytorch_to_ttnn_mapping = {
    # --- Tensor Creation ---
    "torch.ops.aten.empty.memory_format": "ttnn.empty",
    "torch.ops.aten.zeros.default": "ttnn.zeros",
    "torch.ops.aten.ones.default": "ttnn.ones",
    "torch.ops.aten.full.default": "ttnn.full",
    "torch.ops.aten.zeros_like.default": "ttnn.zeros_like",
    "torch.ops.aten.ones_like.default": "ttnn.ones_like",
    "torch.ops.aten.full_like.default": "ttnn.full_like",
    "torch.ops.aten.arange.default": "ttnn.arange",
    "torch.ops.aten.linspace.default": "ttnn.linspace",
    "torch.ops.aten.eye.default": "ttnn.eye",
    # Note: Tensor creation from data is handled by ttnn.from_torch
    # --- Pointwise Mathematical Operations ---
    "torch.ops.aten.add.Tensor": "ttnn.add",
    "torch.ops.aten.sub.Tensor": "ttnn.sub",
    "torch.ops.aten.mul.Tensor": "ttnn.mul",
    "torch.ops.aten.div.Tensor": "ttnn.div",
    "torch.ops.aten.pow.Tensor_Scalar": "ttnn.pow",
    "torch.ops.aten.abs.default": "ttnn.abs",
    "torch.ops.aten.exp.default": "ttnn.exp",
    "torch.ops.aten.log.default": "ttnn.log",
    "torch.ops.aten.log1p.default": "ttnn.log1p",
    "torch.ops.aten.log2.default": "ttnn.log2",
    "torch.ops.aten.log10.default": "ttnn.log10",
    "torch.ops.aten.sqrt.default": "ttnn.sqrt",
    "torch.ops.aten.rsqrt.default": "ttnn.rsqrt",
    "torch.ops.aten.reciprocal.default": "ttnn.reciprocal",
    "torch.ops.aten.neg.default": "ttnn.neg",
    "torch.ops.aten.sin.default": "ttnn.sin",
    "torch.ops.aten.cos.default": "ttnn.cos",
    "torch.ops.aten.tan.default": "ttnn.tan",
    "torch.ops.aten.asin.default": "ttnn.asin",
    "torch.ops.aten.acos.default": "ttnn.acos",
    "torch.ops.aten.atan.default": "ttnn.atan",
    "torch.ops.aten.sinh.default": "ttnn.sinh",
    "torch.ops.aten.cosh.default": "ttnn.cosh",
    "torch.ops.aten.tanh.default": "ttnn.tanh",
    "torch.ops.aten.atanh.default": "ttnn.atanh",
    "torch.ops.aten.sigmoid.default": "ttnn.sigmoid",
    "torch.ops.aten.round.default": "ttnn.round",
    "torch.ops.aten.clamp.default": "ttnn.clamp",
    "torch.ops.aten.lerp.Tensor": "ttnn.lerp",
    # --- Activation Functions ---
    "torch.ops.aten.relu_.default": "ttnn.relu",
    "torch.ops.aten.relu.default": "ttnn.relu",
    "torch.ops.aten.gelu.default": "ttnn.gelu",
    "torch.ops.aten.silu.default": "ttnn.silu",
    "torch.ops.aten.elu.default": "ttnn.elu",
    "torch.ops.aten.leaky_relu.default": "ttnn.leaky_relu",
    "torch.ops.aten.hardsigmoid.default": "ttnn.hardsigmoid",
    "torch.ops.aten.hardswish.default": "ttnn.hardswish",
    "torch.ops.aten.softplus.default": "ttnn.softplus",
    "torch.ops.aten.softsign.default": "ttnn.softsign",
    "torch.ops.aten.log_softmax.int": "ttnn.log_softmax",
    "torch.ops.aten.softmax.int": "ttnn.softmax",
    # --- Reduction Operations ---
    "torch.ops.aten.sum.dim_IntList": "ttnn.sum",
    "torch.ops.aten.mean.dim": "ttnn.mean",
    "torch.ops.aten.max.dim": "ttnn.max",
    "torch.ops.aten.min.dim": "ttnn.min",
    "torch.ops.aten.prod.dim_int": "ttnn.prod",
    "torch.ops.aten.var.dim": "ttnn.var",
    "torch.ops.aten.std.dim": "ttnn.std",
    "torch.ops.aten.argmax.default": "ttnn.argmax",
    "torch.ops.aten.argmin.default": "ttnn.argmin",
    # --- Comparison Operations ---
    "torch.ops.aten.eq.Scalar": "ttnn.eq",
    "torch.ops.aten.ne.Scalar": "ttnn.ne",
    "torch.ops.aten.gt.Scalar": "ttnn.gt",
    "torch.ops.aten.ge.Scalar": "ttnn.ge",
    "torch.ops.aten.lt.Scalar": "ttnn.lt",
    "torch.ops.aten.le.Scalar": "ttnn.le",
    "torch.ops.aten.logical_not.default": "ttnn.logical_not",
    "torch.ops.aten.logical_and.default": "ttnn.logical_and",
    "torch.ops.aten.logical_or.default": "ttnn.logical_or",
    "torch.ops.aten.logical_xor.default": "ttnn.logical_xor",
    # --- Linear Algebra ---
    "torch.ops.aten.matmul.default": "ttnn.matmul",
    "torch.ops.aten.linear.default": "ttnn.linear",
    "torch.ops.aten.bmm.default": "ttnn.bmm",
    "torch.ops.aten.transpose.int": "ttnn.transpose",
    "torch.ops.aten.permute.default": "ttnn.permute",
    # --- Tensor Manipulation ---
    "torch.ops.aten.reshape.default": "ttnn.reshape",
    "torch.ops.aten.cat.default": "ttnn.concat",
    "torch.ops.aten.stack.default": "ttnn.stack",
    "torch.ops.aten.split.Tensor": "ttnn.split",
    "torch.ops.aten.chunk.default": "ttnn.chunk",
    "torch.ops.aten.gather.default": "ttnn.gather",
    "torch.ops.aten.where.self": "ttnn.where",
    "torch.ops.aten.embedding.default": "ttnn.embedding",
    "torch.ops.aten.reflection_pad2d.default": "ttnn.pad",
    "torch.ops.aten.repeat.default": "ttnn.repeat",
    "torch.ops.aten.clone.default": "ttnn.clone",
    "torch.ops.aten.squeeze.dim": "ttnn.squeeze",
    "torch.ops.aten.unsqueeze.default": "ttnn.unsqueeze",
    "torch.ops.aten.flatten.using_ints": "ttnn.flatten",
    "torch.ops.aten.tril.default": "ttnn.tril",
    "torch.ops.aten.triu.default": "ttnn.triu",
    "torch.ops.aten.flip.default": "ttnn.flip",
    "torch.ops.aten.roll.default": "ttnn.roll",
    "torch.ops.aten.tile.default": "ttnn.tile",
    # --- Neural Network Layers ---
    "torch.ops.aten.layer_norm.default": "ttnn.layer_norm",
    "torch.ops.aten.group_norm.default": "ttnn.group_norm",
    "torch.ops.aten.native_batch_norm.default": "ttnn.batch_norm", # Maps to ttnn.batch_norm
    "torch.ops.aten.conv2d.default": "ttnn.conv2d",
    "torch.ops.aten.max_pool2d_with_indices.default": "ttnn.max_pool2d", # Maps to base ttnn.max_pool2d
    "torch.ops.aten.avg_pool2d.default": "ttnn.avg_pool2d",
    "torch.ops.aten.adaptive_avg_pool2d.default": "ttnn.global_avg_pool2d",
    "torch.ops.aten.adaptive_max_pool2d.default": "ttnn.adaptive_max_pool2d",
    "torch.ops.aten.dropout.default": "ttnn.dropout",
    "torch.ops.aten.upsample_nearest2d.default": "ttnn.upsample",
    "torch.ops.aten._scaled_dot_product_flash_attention.default": "ttnn.attention.scaled_dot_product_attention"
}
        # --- Load the original and translated graphs ---
        # Replace with your actual file paths
        # --- Get file paths from command-line arguments ---
        if len(sys.argv) != 3:
            print("Usage: python test_dynamic_translation.py <path_to_pytorch_graph> <path_to_ttnn_graph>")
            sys.exit(1) # Exit if the number of arguments is incorrect
        pytorch_graph_path = sys.argv[1]
        ttnn_graph_path = sys.argv[2]
        # --- Load the original and translated graphs ---
        try:
            with open(pytorch_graph_path, "r", encoding="utf-8") as f:
                pytorch_graph_str = f.read()
            with open(ttnn_graph_path, "r", encoding="utf-8") as f:
                ttnn_graph_str = f.read()
        except FileNotFoundError as e:
            print(f"Error: {e}")
            sys.exit(1)
        print("\n--- Verifying Translation Rules ---")
        # STEP 2: Find all 'call_function' operations in the original PyTorch graph.
        # This regex finds lines like: %conv2d : [...] = call_function[target=torch.ops...](...)
        pytorch_ops_found = re.findall(r"call_function\[target=([\w\._]+)\]", pytorch_graph_str)
        # Ensure we actually found operations to test
        self.assertGreater(len(pytorch_ops_found), 0, "Could not find any 'call_function' nodes in the PyTorch graph.")
        # STEP 3: For each found PyTorch op, check if the rule was applied correctly.
        for torch_op in set(pytorch_ops_found): # Use set() to check each op type only once
            # Check if this operation is in our rulebook
            if torch_op in pytorch_to_ttnn_mapping:
                expected_ttnn_op = pytorch_to_ttnn_mapping[torch_op]
                # Test 1: The original torch_op should NOT be in the new graph.
                self.assertNotIn(
                    torch_op,
                    ttnn_graph_str,
                    f"\n[FAIL] Rule broken: Original op '{torch_op}' was found in the translated graph."
                )
                # Test 2: The expected ttnn_op SHOULD be in the new graph.
                self.assertIn(
                    expected_ttnn_op,
                    ttnn_graph_str,
                    f"\n[FAIL] Rule broken: Expected op '{expected_ttnn_op}' was NOT found for original op '{torch_op}'."
                )
                print(f"[PASS] Rule applied: '{torch_op}' -> '{expected_ttnn_op}'")
            else:
                # This handles ops that are NOT supposed to be translated.
                # It checks if they were correctly left as-is.
                print(f"[INFO] Op '{torch_op}' not in rulebook, assuming it should remain unchanged.")
                self.assertIn(
                    torch_op,
                    ttnn_graph_str,
                    f"\n[FAIL] Untranslatable op '{torch_op}' was incorrectly removed from the graph."
                )
        print("\nSUCCESS: AI-generated graph correctly follows all specified translation rules. :white_check_mark:")
if __name__ == '__main__':
    unittest.main(argv=['first-arg-is-ignored'], exit=False)