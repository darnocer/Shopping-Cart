// main cart
let cart = [];
// buttons
let buttonsDOM = [];

// getting the product
class Products {
  async getProducts() {
    try {
      // returns a promise containing a response object
      let result = await fetch("products.json");
      // extracts JSON and resolves to a js object
      let data = await result.json();
      //simplifying the object
      let products = data.items;
      // for each item in the array of objects, destructure to get the title, price, id, and image url, and return a clean object
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

// display products
class UI {
  displayProducts(products) {
    console.log(products);

    let result = "";

    products.forEach((product) => {
      result += `
        <!--------------------single product----------------------->
        <article class="product">
            <div class="img-container">
                <img src=${product.image} 
                class="product-img" alt="product">
                <button class="bag-btn" data-id=${product.id}>
                    <i class="fas fa-shopping-cart"></i>
                    Add to Bag
                </button>
            </div>
            <h3>${product.title}</h3>
            <h4>$${product.price}</h4>
        </article>
        <!--------------------end single product----------------------->`;
    });

    // * why didn't this work with productsDOM?
    $(".products-center").html(result);
  }

  getBagButtons() {
    // uses spread operator to get "Add to Bag" buttons in an array
    const bagBtns = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = bagBtns;
    bagBtns.forEach((button) => {
      // grab the data id attribute for each button
      let id = button.dataset.id;
      // find each item in the cart array with an id equal to the button id
      let inCart = cart.find((item) => item.id === id);
      // if the item is in the cart, update the button text and disable the button for that item
      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      } else {
        // * update to jQuery
        button.addEventListener("click", (event) => {
          event.target.innerText = "In Cart";
          event.target.disabled = true;
          // returns product object from products based on the id with an additional amount proparty utilizing spread operator
          let cartItem = { ...Storage.getProduct(id), amount: 1 };
          console.log(cartItem);
          // add product to cart
          cart = [...cart, cartItem];
          // save cart items in local storage
          Storage.saveCart(cart);
          // set cart values (amount and total price)
          this.setCartValues(cart);
          // display cart item
          this.addCartItem(cartItem);
          // show the cart
          this.showCart();
        });
      }
    });
  }

  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    // fix to decimal places
    const total = parseFloat(tempTotal.toFixed(2));
    $(".cart-total").text(total);
    $(".cart-items").text(itemsTotal);
  }

  addCartItem(item) {
    const div = $("<div>").addClass("cart-item");
    div.html(`<img src="${item.image}" alt="product">
    <div>
        <h4>${item.title}</h4>
        <h5>$${item.price}</h5>
        <span class="remove-item" data-id=${item.id}>remove</span>
    </div>
    <div>
        <i class="fas fa-chevron-up" data-id=${item.id}></i>
        <p class="item-amount">${item.id}</p>
        <i class="fas fa-chevron-down" data-id=${item.id}></i>
    </div>
    `);
    $(".cart-content").append(div);
  }

  showCart() {
    $(".cart-overlay").addClass("transparentBcg");
    $(".cart").addClass("showCart");
  }
  setupAPP() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    $(".cart-btn").click((event) => {
      this.showCart();
    });
    $(".close-cart").click((event) => {
      this.hideCart();
    });
  }

  // takes argument of cart array
  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }

  hideCart() {
    $(".cart-overlay").removeClass("transparentBcg");
    $(".cart").removeClass("showCart");
  }

  cartLogic() {
    // clear cart button
    $(".clear-cart").click((event) => {
      this.clearCart();
    });
  }

  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
  }

  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
  }
}

// store products in local storage
class Storage {
  // saves products returned from JSON file in a string in local stoage with a key of "products"
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  // parse the "products" key from local storage, and find all objects where the id is equal to the id of the button clicked
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }
  // pass the cart array and save in local storage with a "cart" key
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  //  get cart
  static getCart() {
    // (ternary operator) if there is a value for "cart" in local storage, return the item; if nothing exists for cart in local storage (empty cart), return empty array
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

// EVENT LISTENERS
// * change to jQuery
document.addEventListener("DOMContentLoaded", () => {
  // create instance of "Products" class
  const products = new Products();
  // create instance of "UI" class
  const ui = new UI();
  // setup application
  ui.setupAPP();
  // getProducts() (method within Products class) retrieves the products from the JSON file (in Contentful format) and returns a clean object { title, price, id, image };
  products
    .getProducts()
    .then((products) => {
      // pass the object, display each product in the store
      ui.displayProducts(products);

      // do not need to create an instance of "Storage" since we are using a static method
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});
