import os
import json
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types
from pydantic import BaseModel

# ==========================================
# CONFIGURATION
# ==========================================
AWS_API_GATEWAY_URL = os.environ.get("AWS_API_GATEWAY_URL", "https://your-api-gateway-url.amazonaws.com/prod/inventory")
S3_BASE_URL = os.environ.get("S3_BASE_URL", "https://your-s3-bucket.s3.amazonaws.com/")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY")

app = Flask(__name__)
CORS(app)

# Initialize Gemini Client
client = genai.Client(api_key=GEMINI_API_KEY)

class OutfitItem(BaseModel):
    slot: str
    title: str
    vibe: str
    image: str

def fetch_and_filter_inventory(mode):
    try:
        response = requests.get(AWS_API_GATEWAY_URL)
        response.raise_for_status()
        inventory = response.json()
        
        # Filter based on mode
        if mode == "in-closet":
            # Assuming the inventory is a list of dicts with an 'in_closet' boolean
            inventory = [item for item in inventory if item.get('in_closet') == True]
            
        return inventory
    except Exception as e:
        print(f"Error fetching inventory from AWS: {e}")
        # Fallback to an empty list or mock data
        return []

@app.route('/generate', methods=['POST'])
def generate_outfit():
    data = request.json
    if not data:
        return jsonify({"error": "Invalid JSON request"}), 400
        
    user_prompt = data.get('prompt', '')
    mode = data.get('mode', 'global-wardrobe')
    
    # 1. Fetch from AWS and convert to JSON string
    inventory = fetch_and_filter_inventory(mode)
    wardrobe_registry = json.dumps(inventory)
    
    # 2. Construct Gemini Prompt EXACTLY as requested
    prompt_content = f"""
You are an elite algorithmic fashion stylist.
The user wants an outfit based on this specific request/vibe: "{user_prompt}".

AVAILABLE WARDROBE REGISTRY (JSON):
{wardrobe_registry}

INSTRUCTIONS:

Search through the WARDROBE REGISTRY to construct a complete, cohesive outfit matching the user's request.

You must select 4 items: One Top, One Bottom, One Footwear, and One Accessory.

You must select items that exist strictly inside the provided JSON dataset. Do not hallucinate.
"""

    try:
        # 3. Call Gemini API enforcing JSON Schema
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=prompt_content,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=list[OutfitItem],
            ),
        )
        
        outfit_items = json.loads(response.text)
        
        # 4. Prepend S3_BASE_URL to images
        for item in outfit_items:
            image_filename = item.get('image', '')
            if image_filename and not image_filename.startswith('http'):
                item['image'] = S3_BASE_URL + image_filename
                
        return jsonify({"outfit": outfit_items})
        
    except Exception as e:
        print(f"Error during Gemini API generation: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Running on 0.0.0.0 to be accessible on the network (e.g. from Raspberry Pi)
    app.run(host='0.0.0.0', port=5000, debug=True)
