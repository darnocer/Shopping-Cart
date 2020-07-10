// const cartContent = document.getElementsByClassName(".cart-content");

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
                    Add to Cart
                </button>
            </div>
            <h3>${product.title}</h3>
            <h4>$${product.price}</h4>
        </article>
        <!--------------------end single product----------------------->`;
    });

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
    // create cart item div and appent to the cart
    const div = $("<div>").addClass("cart-item");
    div.html(`<img src="${item.image}" alt="product">
    <div>
        <h4>${item.title}</h4>
        <h5>$${item.price}</h5>
        <span class="remove-item" data-id=${item.id}>remove</span>
    </div>
    <div>
        <i class="fas fa-chevron-up" data-id=${item.id}></i>
        <p class="item-amount">1</p>
        <i class="fas fa-chevron-down" data-id=${item.id}></i>
    </div>
    `);
    $(".cart-content").append(div);
  }

  showCart() {
    // adds the overlay to the background
    $(".cart-overlay").addClass("transparentBcg");
    // transforms the cart to show it
    $(".cart").addClass("showCart");
  }
  setupAPP() {
    // sets up cart from values in local storage
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);

    //shows and hides cart
    $(".cart-btn").click((event) => {
      this.showCart();
    });
    $(".close-cart").click((event) => {
      this.hideCart();
    });
  }

  // takes argument of cart array; for every object in the array, add the cart item
  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }

  hideCart() {
    $(".cart-overlay").removeClass("transparentBcg");
    $(".cart").removeClass("showCart");
  }

  // functionality within the cart
  cartLogic() {
    // clear cart button
    $(".clear-cart").click((event) => {
      this.clearCart();
    });
    // item updating functionality
    $(".cart-content").click((event) => {
      // removing items - event listener on "remove" link
      if (event.target.classList.contains("remove-item")) {
        // grabs the element of the remove link
        let removeItem = event.target;
        // remove the "cart-item" two parents up from target "remove link"; remove that child from the cart content DOM
        document
          .querySelector(".cart-content")
          .removeChild(removeItem.parentElement.parentElement);
        // grab the id of the item from the clicked remove link
        let id = removeItem.dataset.id;
        // pass the id to remove item
        this.removeItem(id);
        //if the up button is clicked
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        // find the item in the cart with the corresponding id
        let tempItem = cart.find((item) => item.id === id);
        // add one to the amount for that item
        tempItem.amount = tempItem.amount + 1;
        // save new amount for item in local storage
        Storage.saveCart(cart);
        // update cart values
        this.setCartValues(cart);
        // update "amount" text
        addAmount.nextElementSibling.innerText = tempItem.amount;
        //if the down button is clicked
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        // find the item in the cart with the corresponding id
        let tempItem = cart.find((item) => item.id === id);
        // subtract one to the amount for that item
        tempItem.amount = tempItem.amount - 1;
        // update values and save new cart if 1 or more items
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
          // if 0 or less items, remove the item entirely
        } else {
          document
            .querySelector(".cart-content")
            .removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }

  clearCart() {
    // grab the ids of all of the items in the cart
    let cartItems = cart.map((item) => item.id);
    // remove each item from the cart based on its id
    cartItems.forEach((id) => this.removeItem(id));
    // while there are any children (cart items)
    while ($(".cart-content").children().length > 0) {
      // clear all children
      $(".cart-content").empty();
    }
    this.hideCart();
  }

  removeItem(id) {
    // find all of the items in the cart to not remove
    cart = cart.filter((item) => item.id !== id);
    // set new cart values and save new cart to local storag
    this.setCartValues(cart);
    Storage.saveCart(cart);
    // update the buttons from "in cart" back to "add to cart" and re-enable
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
  }

  getSingleButton(id) {
    // find add to cart buttons for remove items
    return buttonsDOM.find((button) => button.dataset.id === id);
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
