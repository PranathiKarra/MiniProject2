from flask import Flask, render_template, request, jsonify
import os
from site_html import get_answer_from_html
from temple_vision import describe_image

app = Flask(__name__)
UPLOAD_FOLDER = 'static/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Create the upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/")
def home():
    return render_template("chatbot.html")

@app.route("/ask", methods=["POST"])
def ask():
    try:
        data = request.get_json()
        question = data.get("question", "").strip()
        print("📥 Question received:", question)

        if not question:
            return jsonify({"response": "❗ Please enter a valid question."})

        answer = get_answer_from_html(question)
        print("📤 Answer:", answer)
        return jsonify({"response": answer})

    except Exception as e:
        print("❌ Error in /ask:", e)
        return jsonify({"response": "Something went wrong. Try again."})

    

@app.route("/upload", methods=["POST"])
def upload():
    file = request.files["image"]
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(filepath)
    caption = describe_image(filepath)
    return jsonify({
        "response": caption,
        "image_url": "/" + filepath
    })

if __name__ == "__main__":
    app.run(debug=True)
