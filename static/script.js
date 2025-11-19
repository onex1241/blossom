/********************************************
 * FINAL FIXED script.js (with checkout total)
 ********************************************/

/* ---------- STORAGE ---------- */
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let favs = JSON.parse(localStorage.getItem('favs') || '[]');
let currentProducts = window.initialProducts || [];

/* ---------- UTILS ---------- */
function saveState() {
  localStorage.setItem('cart', JSON.stringify(cart));
  localStorage.setItem('favs', JSON.stringify(favs));
}

function toast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.innerText = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1600);
}

function updateCounts() {
  const cc = document.getElementById('cart-count');
  const fc = document.getElementById('fav-count');
  if (cc) cc.innerText = cart.length;
  if (fc) fc.innerText = favs.length;
}

/* ---------- PANELS ---------- */
document.getElementById("fav-top-btn").onclick = toggleFavPanel;
document.getElementById("cart-top-btn").onclick = toggleCartPanel;

function toggleFavPanel() {
    document.getElementById("fav-panel").classList.toggle("open");
    document.getElementById("cart-panel").classList.remove("open");
}

function toggleCartPanel() {
    document.getElementById("cart-panel").classList.toggle("open");
    document.getElementById("fav-panel").classList.remove("open");
}


/* ---------- FLY TO CART ANIMATION ---------- */
function flyToCartFromImg(imgEl) {
  if (!imgEl) return;
  const cartBtn = document.querySelector('.cart-btn');
  if (!cartBtn) return;

  const clone = imgEl.cloneNode(true);
  const r1 = imgEl.getBoundingClientRect();
  const r2 = cartBtn.getBoundingClientRect();

  Object.assign(clone.style, {
    position: 'fixed',
    left: r1.left + 'px',
    top: r1.top + 'px',
    width: r1.width + 'px',
    height: r1.height + 'px',
    transition: 'all .75s cubic-bezier(.2,.9,.2,1)',
    zIndex: 99999,
    borderRadius: '12px',
    pointerEvents: 'none'
  });

  document.body.appendChild(clone);

  requestAnimationFrame(() => {
    clone.style.left = (r2.left + r2.width / 2 - 20) + 'px';
    clone.style.top = (r2.top + r2.height / 2 - 20) + 'px';
    clone.style.width = '36px';
    clone.style.height = '36px';
    clone.style.opacity = '0.25';
    clone.style.transform = 'rotate(12deg) scale(.75)';
  });

  setTimeout(() => clone.remove(), 800);
}

/* ---------- CART ---------- */
function addToCart(name, price, id, event) {
  const card = event?.target?.closest('.card');
  const img = card?.querySelector('img');

  if (img) {
    flyToCartFromImg(img);
    card.classList.add('flash');
    setTimeout(() => card.classList.remove('flash'), 450);
  }

  const ex = cart.find(x => x.id === id);
  if (ex) {
    ex.qty++;
  } else {
    cart.push({ id, name, price, qty: 1 });
  }

  saveState();
  updateCounts();
  renderCartPanel();
  toast("Добавлено в корзину");
}

function renderCartPanel() {
  const list = document.getElementById('cart-panel-list');
  const totalBox = document.getElementById('panel-total');
  list.innerHTML = '';

  if (cart.length === 0) {
    list.innerHTML = '<li class="panel-empty">Корзина пуста</li>';
    totalBox.innerText = 0;

    // Сохраняем итог для checkout
    localStorage.setItem("checkout_total", 0);

    return;
  }

  let total = 0;
  cart.forEach(item => {
    total += item.price * item.qty;

    const li = document.createElement('li');
    li.className = 'panel-item';
    li.innerHTML = `
      <span>${item.name} <small style="color:#666">x${item.qty}</small></span>
      <div class="item-right">
        <strong>${item.price * item.qty} ₽</strong>
        <button class="remove-small" onclick="removeFromCart(${item.id})">✖</button>
      </div>`;

    list.appendChild(li);
  });

  totalBox.innerText = total;

  /* ---------- FIX: SAVE TOTAL FOR CHECKOUT ---------- */
  localStorage.setItem("checkout_total", total);

  saveState();
}

function removeFromCart(id) {
  cart = cart.filter(x => x.id !== id);
  saveState();
  updateCounts();
  renderCartPanel();
  toast("Удалено");
}

/* ---------- FAVS ---------- */
function toggleFav(id) {
  id = Number(id);

  const idx = favs.indexOf(id);
  if (idx === -1) {
    favs.push(id);
    toast('Добавлено в избранное');
  } else {
    favs.splice(idx, 1);
    toast('Удалено из избранного');
  }

  saveState();
  updateCounts();
  renderFavPanel();

  const btn = document.querySelector(`.card[data-id="${id}"] .fav-btn`);
  if (btn) btn.classList.toggle('active', favs.includes(id));
}

function renderFavPanel() {
  const list = document.getElementById('fav-panel-list');
  list.innerHTML = '';

  if (favs.length === 0) {
    list.innerHTML = '<li class="panel-empty">Нет избранного</li>';
    return;
  }

  favs.forEach(id => {
    const p = window.initialProducts.find(x => x.id === id);
    if (!p) return;

    const li = document.createElement('li');
    li.className = 'panel-item';
    li.innerHTML = `
      <span>${p.name}</span>
      <div class="item-right">
        <strong>${p.price} ₽</strong>
        <button class="remove-small" onclick="toggleFav(${p.id})">✖</button>
      </div>`;
    list.appendChild(li);
  });
}

/* ---------- PRODUCT RENDER ---------- */
function renderProducts(list) {
  currentProducts = list;

  const cont = document.getElementById('products');
  cont.innerHTML = '';

  list.forEach(p => {
    const div = document.createElement('div');
    div.className = 'card tilt-card';
    div.dataset.id = p.id;

    div.innerHTML = `
      <div class="card-shine"></div>
      <img src="/static/${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p class="price">${p.price} ₽</p>

      <div class="card-actions">
        <button class="btn add-btn" onclick="addToCart('${p.name}', ${p.price}, ${p.id}, event)">
          В корзину
        </button>
        <button class="fav-btn ${favs.includes(p.id) ? 'active' : ''}" onclick="toggleFav(${p.id})">♥</button>
      </div>`;

    cont.appendChild(div);
  });
}

/* ---------- FILTERS ---------- */
function resetFilters() {
  renderProducts(window.initialProducts);
}

function filterByCategory(cat) {
  renderProducts(window.initialProducts.filter(p => p.category === cat));
}

function sortByPrice(dir) {
  const sorted = [...currentProducts].sort((a, b) =>
    dir === 'asc' ? a.price - b.price : b.price - a.price
  );
  renderProducts(sorted);
}

/* ---------- INITIAL LOAD ---------- */
document.addEventListener("DOMContentLoaded", () => {
  renderProducts(window.initialProducts);
  updateCounts();
  renderCartPanel();
  renderFavPanel();

  const s = document.getElementById("skeleton-wrapper");
  if (s) {
    setTimeout(() => {
      s.style.display = "none";
      document.getElementById("products").style.display = "grid";
    }, 400);
  }
});
