from flask import Flask, render_template, jsonify
import random

app = Flask(__name__)

messages = [
    "Kamu adalah alasan aku tersenyum setiap pagi ☀️",
    "Setiap detik bersamamu adalah keajaiban 💫",
    "Aku bersyukur kamu ada di hidupku 🌸",
    "Kamu bukan hanya cinta, kamu adalah rumahku 🏡",
    "Dengan kamu, dunia terasa lebih indah 🌍",
    "Kamu selalu di hatiku, tak peduli seberapa jauh 💖",
    "Senyummu adalah favoritku di antara semua hal di dunia 😊",
    "Kamu adalah puisi terbaik yang pernah aku baca 📖",
    "Bersamamu, setiap hari adalah petualangan 🌟",
    "Aku mencintaimu lebih dari kata-kata bisa ungkapkan 💌",
]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/message')
def get_message():
    return jsonify({'message': random.choice(messages)})

if __name__ == '__main__':
    app.run(debug=True)
