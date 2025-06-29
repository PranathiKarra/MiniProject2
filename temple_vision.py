# temple_vision.py (upgraded)
from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image
import torch
from site_html import get_answer_from_html

# Load image captioning model
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")
device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)

# Function to describe an image with added temple info
def describe_image(image_path):
    raw_image = Image.open(image_path).convert('RGB')
    inputs = processor(raw_image, return_tensors="pt").to(device)
    out = model.generate(**inputs, max_new_tokens=50)
    caption = processor.decode(out[0], skip_special_tokens=True)

    # Add context using HTML-based vector search
    extra_info = get_answer_from_html(caption)

    # Combine caption + temple info
    full_description = f"This image appears to show: {caption}.\n\nMore about this site: {extra_info}"
    return full_description
