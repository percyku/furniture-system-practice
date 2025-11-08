// 請代入自己的網址路徑
const api_path = "percyku19api";
const token = "KDdHk6jfkCPVofZFXJVGHm7CCbg2";

// 取得產品列表
function getProductList() {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`
    )
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.log(error.response.data);
    });
}

// 加入購物車
function addCartItem() {
  axios
    .post(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,
      {
        data: {
          productId: "FaShP00eCGy5cuNQfxX0",
          quantity: 8,
        },
      }
    )
    .then(function (response) {
      console.log(response.data);
    });
}

// 取得購物車列表
function getCartList() {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`
    )
    .then(function (response) {
      console.log(response.data);
    });
}

// 清除購物車內全部產品
function deleteAllCartList() {
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`
    )
    .then(function (response) {
      console.log(response.data);
    });
}

// 刪除購物車內特定產品
function deleteCartItem(cartId) {
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`
    )
    .then(function (response) {
      console.log(response.data);
    });
}

// 送出購買訂單
function createOrder() {
  axios
    .post(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,
      {
        data: {
          user: {
            name: "六角學院",
            tel: "07-5313506",
            email: "hexschool@hexschool.com",
            address: "高雄市六角學院路",
            payment: "Apple Pay",
          },
        },
      }
    )
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.log(error.response.data);
    });
}

// 取得訂單列表
function getOrderList() {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
      {
        headers: {
          Authorization: token,
        },
      }
    )
    .then(function (response) {
      console.log(response.data);
    });
}

// 修改訂單狀態

function editOrderList(orderId) {
  axios
    .put(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
      {
        data: {
          id: orderId,
          paid: true,
        },
      },
      {
        headers: {
          Authorization: token,
        },
      }
    )
    .then(function (response) {
      console.log(response.data);
    });
}

// 刪除全部訂單
function deleteAllOrder() {
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
      {
        headers: {
          Authorization: token,
        },
      }
    )
    .then(function (response) {
      console.log(response.data);
    });
}

// 刪除特定訂單
function deleteOrderItem(orderId) {
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${orderId}`,
      {
        headers: {
          Authorization: token,
        },
      }
    )
    .then(function (response) {
      console.log(response.data);
    });
}
