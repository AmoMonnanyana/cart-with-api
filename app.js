document.addEventListener('alpine:init', () => {
  Alpine.data('pizzaCartWithAPIWidget', function () {
    return {
      pizzas: [],
      username: '',
      cartId: '',
      cartPizzas: [],
      user: false,
      cartTotal: 0.00,
      paymentAmount: 0,
      message: 'g',
      paymentSuccessful: false,
      paymentFailed: false,
      change: 0.00,
      cartContents: false,
      cartCount: 0,
      isLoggedIn: false,
      payment: false,
      totalPizzas: 0,

      login() {
        if (this.username.length > 2) {
          localStorage['username'] = this.username
          this.username = localStorage['username']
          this.user = true
          this.createCart();
          this.isLoggedIn = true;
        } else {
          alert("Username is too short!")
        }
      },

      logout() {
        if (confirm('Do you want to logout?')) {
          this.username = '';
          this.cartId = '';
          localStorage['cartId'] = '';
          localStorage['username'] = '';
          this.user = false
          this.isLoggedIn = false
          this.cartPizzas = ''
          this.cartTotal = ''
          this.message = ''
          this.cartContents = false
          this.cartCount = 0
          this.payment = false
          this.paymentSuccessful = false
          this.paymentFailed = false
        }
      },
      displayCart() {
        this.cartContents = !this.cartContents
      },
      createCart() {
        const cartId = localStorage["cartId"];
        if (cartId) {
          this.cartId = cartId;
          //console.log('cart already exists');
          return Promise.resolve();
        } else {
          //console.log('çreating cart');
          const createCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/create?username=${this.username}`
          return axios.get(createCartURL)
            .then((result) => {
              this.cartId = result.data.cart_code
              localStorage["cartId"] = this.cartId
            }
            )
        }

      },

      countingCartItems(){
        this.cartCount = this.cartPizzas.length
      },
      
      getCart() {
        const url = `https://pizza-api.projectcodex.net/api/pizza-cart/${this.cartId}/get`
        return axios.get(url);
      },
      addPizza(pizzaId) {
        return axios.post(`https://pizza-api.projectcodex.net/api/pizza-cart/add`, {
          "cart_code": this.cartId,
          "pizza_id": pizzaId
        })
      },
      removePizza(pizzaId) {
        return axios.post(`https://pizza-api.projectcodex.net/api/pizza-cart/remove`, {
          "cart_code": this.cartId,
          "pizza_id": pizzaId
        })
      },

      pay(amount) {
        return axios.post(`https://pizza-api.projectcodex.net/api/pizza-cart/pay`,
          {
            "cart_code": this.cartId,
            amount
          });

      },

      showCartData() {
        this.getCart().then(result => {
          //console.log(result.data);
          const cartData = result.data
          this.cartPizzas = cartData.pizzas;
          console.log(this.cartPizzas.length);
          this.cartTotal = cartData.total.toFixed(2)
          //console.log(this.cartPizzas)
        })
      },

      init() {
        const storedUsername = localStorage['username'];
        const storedCartId = localStorage['cartId'];
        //console.log(storedUsername)
        /*
        if (storedUsername){
          this.username = storedUsername;
        }*/
        axios.get('https://pizza-api.projectcodex.net/api/pizzas')
        .then((result) => {
          this.pizzas = result.data.pizzas;
        });

        if (storedUsername && storedCartId) {
         
          this.createCart().then(() => {
            this.showCartData();
            this.isLoggedIn = true;
          })
        } else {
          console.log('user not logged');
        }


        // if(this.cartId){

        // }

      },
      addPizzaTocart(pizzaId) {
        this.addPizza(pizzaId)
          .then(() => {
            this.showCartData();
            this.cartCount++
          })
      },
      removePizzaFromCart(pizzaId) {
        this.removePizza(pizzaId)
          .then(() => {
            this.showCartData();
            if (this.cartCount > 0) {
              this.cartCount--
            }

          })
      },
      changeRemaining() {
        if (this.paymentAmount > this.cartTotal) {
          this.payment = true
          this.change = (this.paymentAmount - this.cartTotal).toFixed(2)
        }
      },
      payForCart() {
        this.pay(this.paymentAmount)
          .then(result => {
            if (result.data.status == 'failure') {
              this.message = result.data.message
              this.paymentFailed = true
              this.paymentSuccessful = false
              //console.log(this.message)
              setTimeout(() => {
                this.message = 'Try Again'
              }, 3000)
            } else {
              this.message = "Payment Successful!"
              this.paymentSuccessful = true
              this.paymentFailed = false
              this.changeRemaining()
              setTimeout(() => {
                this.message = '';
                this.cartPizzas = [];
                this.cartTotal = 0.00;
                this.paymentAmount = 0;
                this.cartId = ''
                //this.username = '',
                localStorage["cartId"] = ''
                this.change = 0.00;
                this.cartContents = false
                this.payment = false
                this.cartCount = 0
                this.paymentSuccessful = false
                this.paymentFailed = false
                this.createCart();
              }, 3000)
            }
          })
      }
    }
  })
})