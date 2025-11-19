from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

# ======= PRODUCTS =======
products = [
    {"id": 1, "name": "Букет Роз", "price": 3500, "category": "roses", "image": "images/roses.jpg"},
    {"id": 2, "name": "Букет Тюльпанов", "price": 2800, "category": "tulips", "image": "images/tulips.jpg"},
    {"id": 3, "name": "Букет Пионов", "price": 4200, "category": "peonies", "image": "images/peonies.jpg"},
]


# ======= ROUTES =======

@app.route('/')
def index():
    return render_template('index.html', products=products)

@app.route("/checkout")
def checkout():
    total = request.args.get("total", 0, type=int)
    return render_template("checkout.html", total=total)

@app.route('/submit_order', methods=['POST'])
def submit_order():
    name = request.form.get("name")
    phone = request.form.get("phone")
    address = request.form.get("address")
    comment = request.form.get("comment")

    # Здесь можно отправить заказ в Telegram, базу, email и т.д.
    print("=== NEW ORDER ===")
    print("Имя:", name)
    print("Телефон:", phone)
    print("Адрес:", address)
    print("Комментарий:", comment)

    return render_template("success.html", name=name)

@app.route('/success')
def success():
    return render_template("success.html", name="Клиент")

if __name__ == "__main__":
   app.run(host="0.0.0.0", port=8000)

