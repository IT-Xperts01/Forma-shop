const API_URL =
  "https://dummyjson.com/products?limit=0&select=title,price,description,category,thumbnail";

const STORAGE_KEY = "forma-api-cart-v1";
const MAX_QUANTITY = 999;

let products = [];
let cart = [];
let selectedProductId = null;
let productOpener = null;

const productsContainer = document.querySelector("#products");
const searchInput = document.querySelector("#product-search");
const categoryFilter = document.querySelector("#category-filter");
const sortSelect = document.querySelector("#sort-products");
const searchMessage = document.querySelector("#search-message");
const retryButton = document.querySelector("#retry-products");

const cartCountDisplay = document.querySelector("#cart-count");
const cartTotalDisplay = document.querySelector("#cart-total");
const cartDialog = document.querySelector("#cart-dialog");
const openCartButton = document.querySelector("#open-cart");
const closeCartButton = document.querySelector("#close-cart");
const cartItemsContainer = document.querySelector("#cart-items");
const dialogTotalDisplay = document.querySelector("#dialog-total");
const cartMessage = document.querySelector("#cart-message");

const productDialog = document.querySelector("#product-dialog");
const closeProductButton = document.querySelector("#close-product");
const detailImage = document.querySelector("#detail-image");
const detailName = document.querySelector("#detail-name");
const detailCategory = document.querySelector("#detail-category");
const detailDescription = document.querySelector("#detail-description");
const detailPrice = document.querySelector("#detail-price");
const detailAddButton = document.querySelector("#detail-add");
const detailMessage = document.querySelector("#detail-message");

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

function formatPrice(amount) {
  return money.format(amount);
}

function formatCategory(category) {
  return category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Use textContent when inserting text received from an API.
function createElement(tag, className, text) {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  return element;
}

function createButton(text, className, label) {
  const button = createElement("button", className, text);
  button.type = "button";

  if (label) {
    button.setAttribute("aria-label", label);
  }

  return button;
}

function showProductImage(container, product, lazy = false) {
  const fallback = () => {
    container.replaceChildren(
      createElement(
        "div",
        "image-fallback",
        `${product.name} — photo unavailable`
      )
    );
  };

  try {
    const url = new URL(product.image);

    if (url.protocol !== "https:") {
      fallback();
      return;
    }

    const image = document.createElement("img");

    image.alt = product.name;
    image.width = 600;
    image.height = 450;
    image.loading = lazy ? "lazy" : "eager";
    image.decoding = "async";

    image.addEventListener("error", fallback, { once: true });
    image.src = url.href;

    container.replaceChildren(image);
  } catch {
    fallback();
  }
}

// Load all sample products so filters cover the whole catalogue.
async function loadProducts() {
  searchMessage.textContent = "Loading products…";
  retryButton.hidden = true;
  productsContainer.setAttribute("aria-busy", "true");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(API_URL, {
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data.products)) {
      throw new Error("Unexpected API response.");
    }

    const seenIds = new Set();

    products = data.products
      .filter((item) => {
        if (
          !item ||
          !Number.isSafeInteger(item.id) ||
          seenIds.has(item.id) ||
          typeof item.title !== "string" ||
          typeof item.category !== "string" ||
          typeof item.description !== "string" ||
          typeof item.thumbnail !== "string" ||
          typeof item.price !== "number" ||
          !Number.isFinite(item.price) ||
          item.price < 0
        ) {
          return false;
        }

        seenIds.add(item.id);
        return true;
      })
      .map((item) => ({
        id: item.id,
        name: item.title,
        category: item.category,
        description: item.description,
        price: item.price,
        image: item.thumbnail
      }));

    if (data.products.length > 0 && products.length === 0) {
      throw new Error("No usable product data.");
    }

    cart = loadCart();

    populateCategories();
    updateProducts();
    updateCartDisplay();
    renderCart();

    searchInput.disabled = false;
    categoryFilter.disabled = false;
    sortSelect.disabled = false;
  } catch (error) {
    console.error("Product loading failed:", error);

    searchMessage.textContent =
      "We couldn’t load the products. Check your connection and try again.";

    retryButton.hidden = false;
  } finally {
    clearTimeout(timeoutId);
    productsContainer.setAttribute("aria-busy", "false");
  }
}

function populateCategories() {
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All categories";

  categoryFilter.replaceChildren(allOption);

  const categories = [...new Set(
    products.map((product) => product.category)
  )].sort();

  for (const category of categories) {
    const option = document.createElement("option");

    option.value = category;
    option.textContent = formatCategory(category);

    categoryFilter.appendChild(option);
  }
}

function createProductCard(product) {
  const card = createElement("article", "product-card");
  const imageContainer = createElement("div", "product-image");
  const info = createElement("div", "product-info");
  const actions = createElement("div", "product-actions");

  showProductImage(imageContainer, product, true);

  const detailsButton = createButton(
    "View details",
    "secondary-button",
    `View details for ${product.name}`
  );

  detailsButton.addEventListener("click", () => {
    openProductDetails(product.id, detailsButton);
  });

  const addButton = createButton(
    "Add to cart",
    "",
    `Add ${product.name} to cart`
  );

  addButton.addEventListener("click", () => {
    addToCart(product.id);
  });

  actions.append(detailsButton, addButton);

  info.append(
    createElement(
      "p",
      "product-category",
      formatCategory(product.category)
    ),
    createElement("h3", "", product.name),
    createElement("p", "product-price", formatPrice(product.price)),
    actions
  );

  card.append(imageContainer, info);

  return card;
}

function updateProducts() {
  const query = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;

  const visibleProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(query);
    const matchesCategory =
      category === "all" || product.category === category;

    return matchesSearch && matchesCategory;
  });

  if (sortSelect.value === "low-high") {
    visibleProducts.sort((a, b) => a.price - b.price);
  } else if (sortSelect.value === "high-low") {
    visibleProducts.sort((a, b) => b.price - a.price);
  }

  const fragment = document.createDocumentFragment();

  for (const product of visibleProducts) {
    fragment.appendChild(createProductCard(product));
  }

  productsContainer.replaceChildren(fragment);

  const count = visibleProducts.length;

  searchMessage.textContent =
    count === 0
      ? "No products found. Try another search or category."
      : `${count} product${count === 1 ? "" : "s"} found.`;
}

// Restore quantities only for products in the API catalogue.
function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (!Array.isArray(saved)) {
      return [];
    }

    return products.flatMap((product) => {
      const item = saved.find(
        (entry) =>
          entry !== null &&
          typeof entry === "object" &&
          entry.id === product.id
      );

      if (
        item &&
        Number.isSafeInteger(item.quantity) &&
        item.quantity > 0 &&
        item.quantity <= MAX_QUANTITY
      ) {
        return [{ id: product.id, quantity: item.quantity }];
      }

      return [];
    });
  } catch {
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch {
    cartMessage.textContent =
      "Your cart works, but this browser could not save it.";
  }
}

function updateCartDisplay() {
  let count = 0;
  let totalCents = 0;

  for (const item of cart) {
    const product = products.find(
      (product) => product.id === item.id
    );

    if (!product) {
      continue;
    }

    count += item.quantity;

    // Calculate in cents to avoid common decimal rounding errors.
    totalCents += Math.round(product.price * 100) * item.quantity;
  }

  cartCountDisplay.textContent = count;
  cartTotalDisplay.textContent = formatPrice(totalCents / 100);
  dialogTotalDisplay.textContent = formatPrice(totalCents / 100);
}

function addToCart(productId) {
  const product = products.find(
    (product) => product.id === productId
  );

  if (!product) {
    return false;
  }

  const existing = cart.find((item) => item.id === productId);

  if (existing && existing.quantity >= MAX_QUANTITY) {
    cartMessage.textContent =
      "Maximum quantity reached for this product.";

    return false;
  }

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }

  cartMessage.textContent = `${product.name} added to cart.`;
  refreshCart();

  return true;
}

function renderCart() {
  cartItemsContainer.replaceChildren();

  if (cart.length === 0) {
    cartItemsContainer.appendChild(
      createElement(
        "p",
        "",
        "Your cart is empty. Add something you love!"
      )
    );

    return;
  }

  for (const item of cart) {
    const product = products.find(
      (product) => product.id === item.id
    );

    if (!product) {
      continue;
    }

    const row = createElement("article", "cart-item");
    const controls = createElement("div", "cart-controls");

    const decrease = createButton(
      "−",
      "quantity-button",
      `Decrease quantity of ${product.name}`
    );

    const increase = createButton(
      "+",
      "quantity-button",
      `Increase quantity of ${product.name}`
    );

    const remove = createButton(
      "Remove",
      "remove-button",
      `Remove ${product.name} from cart`
    );

    decrease.disabled = item.quantity <= 1;
    increase.disabled = item.quantity >= MAX_QUANTITY;

    for (const [button, action] of [
      [decrease, "decrease"],
      [increase, "increase"],
      [remove, "remove"]
    ]) {
      button.dataset.id = product.id;
      button.dataset.action = action;
    }

    controls.append(
      decrease,
      createElement("span", "", item.quantity),
      increase,
      remove
    );

    const subtotal =
      Math.round(product.price * 100) * item.quantity / 100;

    row.append(
      createElement("h3", "", product.name),
      createElement("p", "", `${formatPrice(product.price)} each`),
      controls,
      createElement("p", "", `Subtotal: ${formatPrice(subtotal)}`)
    );

    cartItemsContainer.appendChild(row);
  }
}

function refreshCart() {
  updateCartDisplay();
  renderCart();
  saveCart();
}

function updateScrollLock() {
  document.body.classList.toggle(
    "modal-open",
    cartDialog.open || productDialog.open
  );
}

function openProductDetails(productId, opener) {
  const product = products.find(
    (product) => product.id === productId
  );

  if (!product) {
    return;
  }

  selectedProductId = product.id;
  productOpener = opener;

  detailName.textContent = product.name;
  detailCategory.textContent = formatCategory(product.category);
  detailDescription.textContent = product.description;
  detailPrice.textContent = formatPrice(product.price);
  detailMessage.textContent = "";

  showProductImage(detailImage, product);

  productDialog.showModal();
  updateScrollLock();
}

closeProductButton.addEventListener("click", () => {
  productDialog.close();
});

productDialog.addEventListener("close", () => {
  updateScrollLock();
  productOpener?.focus();
});

detailAddButton.addEventListener("click", () => {
  if (addToCart(selectedProductId)) {
    const item = cart.find(
      (item) => item.id === selectedProductId
    );

    detailMessage.textContent =
      `Added to cart. Quantity in cart: ${item.quantity}.`;
  } else {
    detailMessage.textContent =
      "Maximum quantity reached for this product.";
  }
});

openCartButton.addEventListener("click", () => {
  renderCart();
  cartDialog.showModal();
  updateScrollLock();
});

closeCartButton.addEventListener("click", () => {
  cartDialog.close();
});

cartDialog.addEventListener("close", () => {
  updateScrollLock();
  openCartButton.focus();
});

cartItemsContainer.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");

  if (!button) {
    return;
  }

  const id = Number(button.dataset.id);
  const action = button.dataset.action;
  const index = cart.findIndex((item) => item.id === id);

  if (index === -1) {
    return;
  }

  const item = cart[index];
  const product = products.find((product) => product.id === id);

  if (action === "increase" && item.quantity < MAX_QUANTITY) {
    item.quantity += 1;
  } else if (action === "decrease" && item.quantity > 1) {
    item.quantity -= 1;
  } else if (action === "remove") {
    cart.splice(index, 1);
  } else {
    return;
  }

  cartMessage.textContent =
    action === "remove"
      ? `${product.name} removed from cart.`
      : `${product.name} quantity updated to ${item.quantity}.`;

  refreshCart();

  const replacement = cartItemsContainer.querySelector(
    `button[data-id="${id}"][data-action="${action}"]`
  );

  if (replacement && !replacement.disabled) {
    replacement.focus();
  } else {
    const nextButton = cartItemsContainer.querySelector(
      "button:not(:disabled)"
    );

    (nextButton || closeCartButton).focus();
  }
});

searchInput.addEventListener("input", updateProducts);
categoryFilter.addEventListener("change", updateProducts);
sortSelect.addEventListener("change", updateProducts);
retryButton.addEventListener("click", loadProducts);

updateCartDisplay();
renderCart();
loadProducts();