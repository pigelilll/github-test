'use strict';

const products = [...document.querySelectorAll('.product')];
const filters = document.querySelectorAll('.filter');
const cart = new Map();
const cartToggle = document.querySelector('#cart-toggle');
const cartDialog = document.querySelector('#cart-dialog');
const cartItems = document.querySelector('#cart-items');
const statusMessage = document.querySelector('#cart-status');
const currency = new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK', maximumFractionDigits: 0 });
let toastTimeout;

filters.forEach((button) => {
  button.addEventListener('click', () => {
    filters.forEach((filter) => {
      const selected = filter === button;
      filter.classList.toggle('active', selected);
      filter.setAttribute('aria-pressed', String(selected));
    });
    products.forEach((product) => {
      product.hidden = button.dataset.filter !== 'alle' && product.dataset.category !== button.dataset.filter;
    });
    const visibleCount = products.filter((product) => !product.hidden).length;
    document.querySelector('#product-count').textContent = `${visibleCount} styles`;
  });
});

function updateCart() {
  let count = 0;
  let total = 0;
  cartItems.replaceChildren();
  cart.forEach((item, id) => {
    count += item.quantity;
    total += item.price * item.quantity;
    const row = document.createElement('li');
    const description = document.createElement('span');
    description.textContent = `${item.quantity} × ${item.name} · ${currency.format(item.price * item.quantity)}`;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = 'Fjern';
    remove.setAttribute('aria-label', `Fjern ${item.name} fra kurven`);
    remove.addEventListener('click', () => {
      cart.delete(id);
      updateCart();
      // Behold tastaturfokus i kurven, når den aktive knap fjernes.
      document.querySelector('#close-cart').focus();
    });
    row.append(description, remove);
    cartItems.append(row);
  });
  if (!count) {
    const empty = document.createElement('li');
    empty.textContent = 'Din kurv er tom. Find din næste favorit i kollektionen.';
    cartItems.append(empty);
  }
  document.querySelector('#cart-count').textContent = count;
  cartToggle.setAttribute('aria-label', `Åbn kurv, ${count} ${count === 1 ? 'vare' : 'varer'}`);
  document.querySelector('#cart-total').textContent = currency.format(total);
}

products.forEach((product) => {
  product.querySelector('.add-to-cart').addEventListener('click', () => {
    const { id, name, price } = product.dataset;
    const item = cart.get(id) || { name, price: Number(price), quantity: 0 };
    item.quantity += 1;
    cart.set(id, item);
    updateCart();
    clearTimeout(toastTimeout);
    statusMessage.textContent = `${name} er lagt i kurven (${item.quantity} stk.).`;
    statusMessage.classList.add('visible');
    toastTimeout = setTimeout(() => statusMessage.classList.remove('visible'), 2800);
  });
});

cartToggle.addEventListener('click', () => cartDialog.showModal());
document.querySelector('#close-cart').addEventListener('click', () => cartDialog.close());
cartDialog.addEventListener('click', (event) => {
  if (event.target !== cartDialog) return;
  const bounds = cartDialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) cartDialog.close();
});
document.querySelector('#year').textContent = new Date().getFullYear();
updateCart();
