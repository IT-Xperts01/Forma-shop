# FORMA Shop

### Everyday essentials. Extraordinary finds.

A responsive shopping application built by **Joel Eke** using HTML, CSS, and JavaScript. FORMA connects to a sample product API and lets users browse products, explore product details, and manage a cart.

**[View Live Demo](https://it-xperts01.github.io/Forma-shop/)**

## Overview

FORMA is a frontend portfolio project that brings together responsive interface design, API integration, and interactive shopping features.

The application uses a blue and white visual identity, a custom SVG logo, and layouts that adapt to mobile, tablet, and desktop screens.

## Features

- **Product catalogue:** Loads product information and images from DummyJSON.
- **Search:** Finds products by name as users type.
- **Category filtering:** Generates categories from the API catalogue.
- **Price sorting:** Sorts products from lowest to highest price or highest to lowest.
- **Product details:** Displays a larger image, description, and price in a popup.
- **Shopping cart:** Supports adding products, adjusting quantities, and removing items.
- **Persistent cart:** Saves product IDs and quantities using localStorage.
- **Loading and error states:** Provides feedback while fetching data and a retry option when requests fail.
- **Image fallbacks:** Displays a message when a product image cannot load.
- **Responsive design:** Adapts the layout to different screen sizes.

## Built With

| Technology | Purpose |
| --- | --- |
| HTML5 | Semantic page structure and native dialogs |
| CSS3 | Responsive layouts, styling, and transitions |
| JavaScript | Product rendering, filtering, sorting, and cart logic |
| Fetch API | Requests product data |
| localStorage | Saves cart items in the browser |
| SVG | Custom logo and interface icons |
| DummyJSON | Sample product catalogue |

No frontend framework or build tool is required.

## Getting Started

### Run locally

1. Clone the repository:

   ```bash
   git clone https://github.com/IT-Xperts01/Forma-shop.git
   ```

2. Open the project folder:

   ```bash
   cd Forma-shop
   ```

3. Open the folder in VS Code and launch `index.html` using the Live Server extension.

An internet connection is required to load products and images.

## Project Structure

```text
Forma-shop/
├── index.html
├── style.css
├── script.js
└── README.md
```

- **index.html:** Page structure, shop controls, and product and cart dialogs.
- **style.css:** Branding, responsive layouts, product cards, and popup styling.
- **script.js:** API requests, product rendering, search, filtering, sorting, and cart persistence.

## How It Works

1. The application requests product data from DummyJSON.
2. Returned data is checked and mapped into the shop’s product format.
3. Categories and product cards are generated from the catalogue.
4. Search, category, and sorting controls update the displayed products.
5. Cart changes update item counts and totals.
6. Cart quantities are saved in localStorage and restored after the catalogue loads.

Product text received from the API is inserted using `textContent`.

## Accessibility

The interface includes:

- Labels for search and dropdown controls.
- Visible keyboard focus indicators.
- Native dialogs that support closing with the Escape key.
- Descriptive labels for cart controls.
- Status messages for loading, search results, and cart updates.
- A skip link to the main content.
- Reduced-motion support.

## What I Practised

Through this project, I practised:

- Building responsive layouts with CSS Grid and Flexbox.
- Working with asynchronous JavaScript using `async` and `await`.
- Handling API responses, loading states, errors, and timeouts.
- Creating and updating elements through the DOM.
- Using arrays and objects to manage application data.
- Combining search, filters, and sorting.
- Saving and restoring data with browser storage.
- Publishing a static website using GitHub Pages.

## Demo Limitations

FORMA is a portfolio demonstration, not a production store.

- Products come from a sample API.
- Prices are displayed in USD for demonstration.
- Payments and order processing are not implemented.
- Cart data is stored in the current browser and does not sync across devices.
- Sample prices and availability are not live merchant information.

## Future Improvements

- Product pagination or a “Load more” feature.
- A wishlist.
- Additional product images.
- Automated interaction tests.
- A checkout demonstration.

## Author

**Joel Eke** — Frontend Developer

- [GitHub](https://github.com/IT-Xperts01)
- [FORMA Live Demo](https://it-xperts01.github.io/Forma-shop/)

## Acknowledgements

- [DummyJSON](https://dummyjson.com/) for the sample product API.
- GitHub Pages for hosting the application.
