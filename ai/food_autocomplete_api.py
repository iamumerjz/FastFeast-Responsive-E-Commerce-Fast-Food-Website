from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)
DATA_FILE = "food_freq.json"

# Initialize or load frequency data
if os.path.exists(DATA_FILE):
    with open(DATA_FILE, "r") as f:
        food_freq = json.load(f)
else:
    food_freq = {
    "burger": 80,
    "cheeseburger": 65,
    "chicken burger": 70,
    "veggie burger": 40,
    "fries": 90,
    "onion rings": 30,
    "pizza": 85,
    "pepperoni pizza": 60,
    "margherita pizza": 50,
    "bbq chicken pizza": 45,
    "fried chicken": 75,
    "chicken nuggets": 80,
    "hot dog": 55,
    "tacos": 60,
    "burrito": 50,
    "nachos": 40,
    "sandwich": 65,
    "club sandwich": 50,
    "sub sandwich": 45,
    "milkshake": 70,
    "cola": 85,
    "soft drink": 60,
    "ice cream": 55,
    "chicken wings": 65,
    "popcorn chicken": 50,
    "fish and chips": 45,
    "corn dog": 35,
    "pretzel": 25,
    "fried shrimp": 40,
}


def save_data():
    with open(DATA_FILE, "w") as f:
        json.dump(food_freq, f, indent=2)

@app.route("/autocomplete")
def autocomplete():
    prefix = request.args.get("prefix", "").lower()
    limit = int(request.args.get("limit", 5))
    results = [item for item in food_freq if item.startswith(prefix)]
    results.sort(key=lambda x: food_freq[x], reverse=True)
    return jsonify(results[:limit])

@app.route("/increment-frequency", methods=["POST"])
def increment_frequency():
    data = request.json
    food_name = data.get("foodName", "").lower()
    if not food_name:
        return jsonify({"error": "foodName is required"}), 400
    food_freq[food_name] = food_freq.get(food_name, 0) + 1
    save_data()
    return jsonify({"foodName": food_name, "frequency": food_freq[food_name]})

if __name__ == "__main__":
    print("Starting Food Autocomplete API on http://localhost:8000")
    app.run(port=8000)
