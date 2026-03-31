/* app.js — fetches /api/products and renders the product grid */
(async function () {
  const grid        = document.getElementById('product-grid');
  const errorBanner = document.getElementById('error-banner');
  const errorDetail = document.getElementById('error-detail');
  const cartCount   = document.getElementById('cart-count');
  let   cart        = 0;

  async function loadProducts() {
    try {
      const res  = await fetch('/api/products');
      const data = await res.json();

      if (!res.ok) {
        // Server returned 4xx / 5xx — show the error banner
        showError(`${res.status} ${res.statusText} — ${data.message || data.error}`);
        return;
      }

      renderProducts(data.products || []);
    } catch (err) {
      showError(err.message);
    }
  }

  function showError(msg) {
    grid.innerHTML = '';          // clear skeletons
    errorBanner.classList.remove('hidden');
    errorDetail.textContent = msg;
  }

  function renderProducts(products) {
    grid.innerHTML = products.map(p => `
      <div class="product-card">
        <h3>${escHtml(p.name)}</h3>
        <div class="price">$${p.price.toFixed(2)}</div>
        <div class="stock">${p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}</div>
        <button
          onclick="addToCart(this)"
          ${p.stock === 0 ? 'disabled' : ''}
          data-id="${p.id}"
        >${p.stock > 0 ? 'Add to Cart' : 'Sold Out'}</button>
      </div>
    `).join('');
  }

  window.addToCart = function (btn) {
    cart++;
    cartCount.textContent = cart;
    btn.textContent = 'Added ✓';
    btn.disabled = true;
    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = 'Add to Cart';
    }, 1500);
  };

  function escHtml(s) {
    return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  loadProducts();
})();
