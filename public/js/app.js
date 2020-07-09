// query selectors
const cartBtn = $(".cart-btn");
const closeCartBtn = $(".close-cart");
const clearCartBtn = $(".clear-cart-btn");
const cartDOM = $(".cart");
const cartOverlay = $(".cart-overlay");
const cartItems = $(".cart-items");
const cartTotal = $(".cart-total");
const cartContent = $(".cart-content");
// const productDOM = $("products-center");

// main cart
let cart = [];

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
  // getBagButtons() {
  //   const bagBtns = [...document.querySelectorAll(".bag-btn")];

  //   console.log(bagBtns);
  // }
}

// store products in local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
}

// EVENT LISTENERS
// * change to jQuery
document.addEventListener("DOMContentLoaded", () => {
  // create instance of "Products" class
  const products = new Products();

  // create instance of "UI" class
  const ui = new UI();

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
    });
});
