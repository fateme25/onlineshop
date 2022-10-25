const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "y7lcdd3sklj2",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: "Rpl9CAmog-Vl0cmqyhC4FlQpsdmca7teGJf6dguWhPQ"
});
// shopping cart
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const continueCartBtn = document.querySelector('.continue-shopping');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center2');




//cart
let cart = [];
// buttons
buttonDOM=[];

// // getting products
class Products {

  async getProducts() {
    try {
      const response = await client.getEntries({
        content_type: 'onlineshopProductPage'
      });



      // let result = await fetch("products.json");
      // let data = await result.json();

      let products = response.items;
      products = products.map(item => {
        const { title, price} = item.fields;
        const { id , discount } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price,discount, id, image };
      })
      return products;
    } catch (error) {
      // console.log(error);

    }
  }
}
// display products
 class UI {
   displayProducts(products){
    let result='';
    products.forEach(product=>{
      result+=`<article class="product">
      <div class="img-container">
       <img src=${product.image} class="product-img" alt="product">
        <button class="bag-btn" data-id=${product.id}>
          <i class="fa fa-shopping-cart"></i>
          مشاهده و خرید
        </button>
      </div>
      <h5>${product.title}</h5>
      <h6>${product.price}.000تومان</h6>

    </article>
    `
    
    });
    productsDOM.innerHTML=result +"<del>5000.000 تومان</del>"+
    "<mark>25%</mark>"
    
    
   }
   getbagButtons(){
    const buttons=[...document.querySelectorAll(".bag-btn")];
    buttonDOM=buttons;
    buttons.forEach(button=>{
      let id=button.dataset.id;
      let inCart=cart.find(item=>item.id===id);
    
      if(inCart){
        button.innerText='اضافه شد';
         button.disabled=false;
      }
      else{
        button.addEventListener("click", event =>{
          event.target.innerText='اضافه شد';
          event.target.disabled=true
          // get product form products 
          let cartItems={...Storage.getProduct(id),
          amount:1};
          //  add product to the cart
          cart=[...cart,cartItems];
          // save cart in local storage
          Storage.saveCart(cart)
          // set cart values
          this.setCartValues(cart);
          // display cart item
          this.addCartItem(cartItems)
          // show the cart
          this.showCart()
        
        });
      }
    })
   }
    setCartValues(cart){
      let tempTotal=0;
      let itemsTotal=0;
      cart.map(item=>{
      tempTotal += item.price * item.amount;
      itemsTotal +=item.amount;
      });
      cartTotal.innerText = parseFloat(tempTotal.toFixed(6));
      cartItems.innerText = itemsTotal;
   }
   addCartItem(item){
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML=`
    <img src=${item.image} alt="product">
    <div class="product-price">
      <h5>${item.title}</h5>
      <h6>${item.price}000تومان</h6>
      <span class="remove-item" data-id=${item.id}>حذف کردن</span>
    </div>
    <div>
      <i class="fa fa-plus"data-id=${item.id}></i>
      <p class="item-quantity">${item.amount}</p>
      <i class="fa fa-minus" data-id=${item.id}></i>
    </div>`
    cartContent.appendChild(div);
   }
   showCart(){
    cartOverlay.classList.add('transparentBcg'); 
    cartDOM.classList.add('showCart');
   }
   setupApp(){
     cart=Storage.getCart();
     this.setCartValues(cart);
     this.populateCart(cart);
     cartBtn.addEventListener('click',this.showCart);
     closeCartBtn.addEventListener('click',this.hideCart);
   }
   populateCart(){
     cart.forEach(item =>this.addCartItem(item));
   }
   hideCart(){
    cartOverlay.classList.remove('transparentBcg'); 
    cartDOM.classList.remove('showCart');
   }
   cartLogic(){
    //  clear cart button
    continueCartBtn.addEventListener('click', () =>{
      this.clearCart();
    });
    // cart functionality
    cartContent.addEventListener("click", event=>{
      if(event.target.classList.contains('remove-item')
      ){
        let removeItem=event.target;
        let id=removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      }
      else if(event.target.classList.contains('fa-plus')){
        let addAmount=event.target;
        let id= addAmount.dataset.id;
        let tempItem=cart.find(item =>item.id === id);
        tempItem.amount= tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText=tempItem.amount;
      }
      else if(event.target.classList.contains('fa-minus')){
        let lowerAmount= event.target;
        let id= lowerAmount.dataset.id;
        let tempItem=cart.find(item =>item.id === id);
        tempItem.amount= tempItem.amount - 1;
        if(tempItem.amount>0){
        Storage.saveCart(cart);
        this.setCartValues(cart);
        lowerAmount.previousElementSibling.innerText=tempItem.amount;
        }
        // else{
        //   cartContent.removeChild(lowerAmount.parentElement.parentElement);
        //   this.removeItem(id);
        // }

      }


      
    });
   }
   clearCart(){
     let cartItems=cart.map(item =>item.id);
     cartItems.forEach(id =>this.removeItem(id));
     console.log(cartContent.children);
     while(cartContent.children.length>0){
      cartContent.removeChild(cartContent.children[0])
     }
     this.hideCart();
   }
   removeItem(id){
    cart=cart.filter(item =>item.id !==id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button=this.getSingleButton(id);
    /* we use it when we remove an item we are not able to click on it agian and
    choose it again */
    button.disabled=false;
    button.innerHTML=` <i class="fa fa-shopping-cart"></i>مشاهده و خرید`;
   }
   getSingleButton(id){
     return buttonDOM.find(button=>button.dataset.id
      ===id)
   }
 }

//  local storage
class Storage { 
  static saveProducts(products){
    localStorage.setItem("products",JSON.stringify(products));
  }
  static getProduct(id){
    let products=JSON.parse(localStorage.getItem('products'));
    return products.find(product => product.id === id)
  }

  static saveCart(cart){
    localStorage.setItem("cart",JSON.stringify(cart));
  }
  static getCart(){
    return localStorage.getItem('cart')?JSON.parse
    (localStorage.getItem('cart')):[]
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  // setup app
  ui.setupApp();


  // get all products
  products.getProducts().then(products =>{
    ui. displayProducts(products);
  Storage.saveProducts(products);
  }).then(()=>{
    ui.getbagButtons();
    ui.cartLogic();
  })

});

// login and registration form
 var loginForm=document.getElementById("loginForm");
 var regForm=document.getElementById("regForm");
 var Indicator=document.getElementById("Indicator");

 function register(){
  regForm.style.transform="translateX(0px)";
  loginForm.style.transform="translateX(0px)";
  Indicator.style.transform="translateX(-130px)";
 }
 function login(){
 regForm.style.transform="translateX(340px)";
  loginForm.style.transform="translateX(340px)";
  Indicator.style.transform="translateX(0px)";
 }

