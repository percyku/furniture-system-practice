const baseUrl = "https://livejs-api.hexschool.io/api/livejs/v1/customer/";
const api_path = "percyku19api";
const token = "KDdHk6jfkCPVofZFXJVGHm7CCbg2";

const constraints = {
  姓名: {
    presence: {
      message: "是必填欄位",
    },
  },
  電話: {
    presence: {
      message: "是必填欄位",
    },
    length: {
      minimum: 8,
      message: "號碼需超過 8 碼",
    },
  },
  信箱: {
    presence: {
      message: "是必填欄位",
    },
    email: {
      message: "格式有誤",
    },
  },
  寄送地址: {
    presence: {
      message: "是必填欄位",
    },
  },
};

let recordProducts = [];
let recordCart = [];

const productList = document.querySelector(".productWrap");
const productSelect = document.querySelector(".productSelect");
productSelect.addEventListener("change", (e) => {
  let category = e.target.value;
  if (category === "全部") {
    renderProduct(recordProducts);
    return;
  }

  let targetProducts = recordProducts.filter((item) => {
    if (item.category === category) {
      return item;
    }
  });

  renderProduct(targetProducts);
});

async function getProducts() {
  return axios
    .get(`${baseUrl}${api_path}/products`)
    .then((res) => {
      return res.data.products;
    })
    .catch((error) => {
      console.log(error);
    });
}

function renderProduct(products) {
  productList.innerHTML = products
    .map(
      (item) => `
       <li class="productCard">
          <h4 class="productType">新品</h4>
          <img
            src="${item.images}"
            alt="${item.title},${item.category}"
          />
          <button href="#" class="addCardBtn" data-id="${item.id}">加入購物車</button>
          <h3>${item.title}</h3>
          <del class="originPrice">NT$${item.origin_price}</del>
          <p class="nowPrice">NT$${item.price}</p>
        </li>
    `
    )
    .join("");

  let addCartBtn = document.querySelectorAll(".addCardBtn");
  addCartBtn.forEach(function (item) {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      addCartItem(e.target.dataset.id);
      // console.log("end2");
    });
  });
}

async function addCartItem(productId, quantity = 1) {
  let qty = 0;
  try {
    disableCartAllBtn();
    disabelShoppingItemBtn();
    let myCart = await getCart();
    qty = myCart.carts.find((item) => item.product.id === productId)?.quantity;
    qty = qty == undefined ? 0 : qty;
  } catch (error) {
    console.log(error);
  }

  enableCartAllBtn();
  enableShoppingItemBtn();

  axios
    .post(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,
      {
        data: {
          productId: productId,
          quantity: qty + 1,
        },
      }
    )
    .then(function (response) {
      renderCart(response.data);
    })
    .catch((error) => {
      console.log(error);
    });
}

function getCategories(products) {
  let sorted = products
    .map((item) => item.category)
    .reduce((pre, cur) => {
      if (pre.includes(cur) == false) {
        pre.push(cur);
      }
      return pre;
    }, []);

  renderCategories(sorted);
}

function renderCategories(sorted) {
  let str = '<option value="全部" selected>全部</option>';
  sorted.forEach(function (item) {
    str += `<option value="${item}">${item}</option>`;
  });
  productSelect.innerHTML = str;
}

const shoppingCart = document.querySelector(".shoppingCart tbody");
const finalPrice = document.querySelector(".finalPrice");
async function getCart() {
  return axios
    .get(`${baseUrl}${api_path}/carts`)
    .then((res) => {
      return res.data;
    })
    .catch((error) => {
      console.log(error);
      res.data = [];
    });
}

async function renderCart(carts) {
  if (carts.carts.length === 0) {
    recordCart = [];
    discardAllBtn.setAttribute("disabled", true);
  } else {
    recordCart = carts.carts;
    discardAllBtn.removeAttribute("disabled");
  }
  finalPrice.innerHTML = carts.finalTotal;
  shoppingCart.innerHTML = carts.carts
    .map(
      (item) => `
          <tr>
              <td>
                <div class="cardItem-title">
                  <img src="${item.product.images}" alt="" />
                  <p>${item.product.title}</p>
                </div>
              </td>
              <td>NT$${item.product.origin_price}</td>
              <td class="">
                <div class="quality-control">


                  <button class="add-btn">
                    <span class="material-icons"  data-id="${
                      item.id
                    }"> add </span>
                  </button>
                  <span class="a-num" >${item.quantity}</span>
                  <button class="remove-btn"  ${
                    item.quantity === 1 ? "disabled='true'" : ""
                  }>
                    <span class="material-icons"  data-id="${
                      item.id
                    }"> remove </span>
                  </button>
                </div>
              </td>
              <td>NT$${item.product.price}</td>
              <td class="discardBtn">
                <button class="material-icons" data-id="${
                  item.id
                }"> clear </button>
              </td>
            </tr>
    `
    )
    .join("");

  try {
    await renderDiscardBtn();
    await renderAddBtn();
    await renderRemoveBtn();
  } catch (error) {
    console.log(error);
  } finally {
    enableShoppingItemBtn();
  }
}

async function renderAddBtn() {
  let addBtn = document.querySelectorAll(".add-btn");
  addBtn.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      let qty =
        parseInt(e.target.parentElement.nextElementSibling.innerText) + 1;
      disableCartAllBtn();
      disabelShoppingItemBtn();
      modifyOrderProductQtyAndRenderCart(e.target.dataset.id, qty);
    });
  });
}

async function renderRemoveBtn() {
  let addBtn = document.querySelectorAll(".remove-btn");
  addBtn.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();

      let qty =
        parseInt(e.target.parentElement.previousElementSibling.innerText) - 1;
      disableCartAllBtn();
      disabelShoppingItemBtn();
      modifyOrderProductQtyAndRenderCart(e.target.dataset.id, qty);
    });
  });
}

function modifyOrderProductQtyAndRenderCart(productId, qty) {
  axios
    .patch(`${baseUrl}${api_path}/carts`, {
      data: {
        id: productId,
        quantity: qty,
      },
    })
    .then((res) => {
      renderCart(res.data);
    })
    .catch((error) => {
      console.log(error);
    });
}

async function renderDiscardBtn() {
  let discardBtn = document.querySelectorAll(".discardBtn");
  discardBtn.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      disableCartAllBtn();
      disabelShoppingItemBtn();

      axios
        .delete(`${baseUrl}${api_path}/carts/${e.target.dataset.id}`)
        .then((res) => {
          renderCart(res.data);
        })
        .catch((error) => {
          console.log(error);
        });
    });
  });
}

const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click", (e) => {
  e.preventDefault();
  disableCartAllBtn();

  axios
    .delete(`${baseUrl}${api_path}/carts`)
    .then((res) => {
      renderCart(res.data);
    })
    .catch((error) => {
      console.log(error);
    });
});

function disableCartAllBtn() {
  document.querySelectorAll(".shoppingCart button").forEach((item) => {
    item.setAttribute("disabled", true);
  });
}

function disabelShoppingItemBtn() {
  document.querySelectorAll(".addCardBtn").forEach((item) => {
    item.setAttribute("disabled", true);
  });
}

function enableCartAllBtn() {
  document.querySelectorAll(".shoppingCart button").forEach((item) => {
    item.removeAttribute("disabled");
  });
}

function enableShoppingItemBtn() {
  document.querySelectorAll(".addCardBtn").forEach((item) => {
    item.removeAttribute("disabled");
  });
}

async function init() {
  try {
    let productList = await getProducts();
    recordProducts = productList;
    renderProduct(productList);
    getCategories(productList);

    let myCart = await getCart();
    renderCart(myCart);
  } catch (error) {
    console.log(error);
  }
}

init();

const form = document.querySelector(".orderInfo-form");
const orderInfoBtn = document.querySelector(".orderInfo-btn");

const inputs = document.querySelectorAll(
  "input[type=text],input[type=tel],input[type=email]"
);

const messages = document.querySelectorAll("[data-message]");

form.addEventListener("submit", verification, false);
function verification(e) {
  e.preventDefault();
  if (recordCart.length === 0) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Shopping cart items are empty",
    });
    return;
  }
  let errors = validate(form, constraints);
  if (errors) {
    showErrors(errors);
  } else {
    addOrder();
  }

  // addOrder();
}

function showErrors(errors) {
  messages.forEach((item) => {
    item.textContent = "";
    item.textContent = errors[item.dataset.message];
  });
}
// 監控所有 input 的操作
inputs.forEach((item) => {
  item.addEventListener("change", function (e) {
    e.preventDefault();
    let targetName = item.name;
    let errors = validate(form, constraints);
    item.nextElementSibling.textContent = "";
    // 針對正在操作的欄位呈現警告訊息
    if (errors) {
      document.querySelector(`[data-message='${targetName}']`).textContent =
        errors[targetName];
    }
  });
});

function addOrder() {
  orderInfoBtn.setAttribute("disabled", true);
  disableCartAllBtn();
  let url = `${baseUrl}${api_path}/orders`;
  let data = {
    data: {
      user: {
        name: document.querySelector("#customerName").value.trim(),
        tel: document.querySelector("#customerPhone").value.trim(),
        email: document.querySelector("#customerEmail").value.trim(),
        address: document.querySelector("#customerAddress").value.trim(),
        payment: document.querySelector("#tradeWay").value.trim(),
        // name: "testSser",
        // tel: "123456789",
        // email: "test@gmail.com",
        // address: "test123",
        // payment: "信用卡",
      },
    },
  };

  axios
    .post(url, data)
    .then((res) => {
      data = {};
      init();
      orderInfoBtn.removeAttribute("disabled");
      form.reset();
    })
    .catch((error) => {
      console.log(error);
      enableCartAllBtn();
      enableShoppingItemBtn();
      orderInfoBtn.removeAttribute("disabled");
    });
}
