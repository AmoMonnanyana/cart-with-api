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
      storedCart: [],
      cartCount: 0,
      isLoggedIn: false,
      payment: false,
      totalPizzas: 0,
      countedCarts: 0,
      cartHistory: [],
      showHistory: false,
      checkoutComplete: false,
      historyUser: '',
      eachOrderHistory: [],
      paidPizzas : [],
      paidTotal : 0,
      enteredAmount: 0,
      listOfpayments: [],
      eachPaymentAmount: 0,
      eachOrderAmount: 0,
      orderList : [],

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
          this.countedCarts = 0
          this.cartCount = 0
          this.storedCart = []
          localStorage['cartCount'] = 0
          this.showHistory = false
          this.orderList = []
          this.historyUser = ''
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
          //console.log(this.cartPizzas);
          this.cartTotal = cartData.total.toFixed(2)
          
          //console.log(this.cartPizzas)
        })
      },

      init() {
        
            if(localStorage['cartCount']){
              this.countedCarts = localStorage['cartCount']
            } else {
              this.addPizzaToStorage()
            }
        const storedUsername = localStorage['username'];
        const storedCartId = localStorage['cartId'];
        
        //console.log(storedUsername)
        
        if (storedUsername){
          this.username = storedUsername;
        }
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
          //console.log('user not logged');
        }
        

        // if(this.cartId){

        // }

      },
      addPizzaToStorage(){
        localStorage['storedCart']=this.storedCart
        this.cartCount = this.storedCart.length
        localStorage['cartCount'] = this.cartCount
        this.countedCarts = localStorage['cartCount']
        //console.log(this.cartCount)
      },

      addPizzaTocart(pizzaId) {
        this.addPizza(pizzaId)
          .then(() => {
            this.showCartData()
            this.storedCart.push(this.cartPizzas)
            this.addPizzaToStorage()
            //console.log(this.storedCart.length)
            
          })
      },

      

      removePizzaFromCart(pizzaId) {
        this.removePizza(pizzaId)
          .then(() => {
            this.showCartData();
            this.storedCart.pop(this.cartPizzas)
            this.addPizzaToStorage()
            //console.log(this.storedCart)
            
          })
      },
      changeRemaining() {
        if (this.paymentAmount > this.cartTotal) {
          this.payment = true
          this.change = (this.paymentAmount - this.cartTotal).toFixed(2)
        }
      },
      viewHistory(){
        this.showHistory = !this.showHistory
      },
      getHistory(){
        
        this.historyUser = this.username
        //console.log(this.paidPizzas)
        for(let i = 0; i < this.paidPizzas.length; i++) {
          this.eachOrderHistory = this.paidPizzas[i]
          this.orderList.push(this.eachOrderHistory)
        }
        let eachPayment = {}
        eachPayment["eachOrderAmount" + this.eachOrderAmount] = this.paidTotal
        eachPayment["eachPaymentAmount" + this.eachPaymentAmount] = this.enteredAmount

        this.listOfpayments.push(eachPayment)
        console.log(this.listOfpayments)
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
              this.checkoutComplete = true
              this.paidPizzas = this.cartPizzas
              this.paidTotal = this.cartTotal
              this.enteredAmount = this.paymentAmount
              this.eachOrderAmount = this.eachOrderAmount + 1 
              this.eachPaymentAmount++
              this.changeRemaining()
              this.getHistory()
              //this.getHistory()
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
                this.countedCarts = 0
                this.cartCount = 0
                this.storedCart = []
                localStorage['cartCount'] = 0
                this.createCart();
              }, 3000)
             
            }
            
          })
      }
    }
  })
})