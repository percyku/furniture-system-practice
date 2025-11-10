const baseUrl = "https://livejs-api.hexschool.io/api/livejs/v1/admin/";
const api_path = "percyku19api";
const token = "KDdHk6jfkCPVofZFXJVGHm7CCbg2";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 1000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

const Toast2 = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

function successfulMsg(msg) {
  Toast.fire({
    icon: "success",
    title: msg,
  });
}

function errorMsg(msg) {
  Toast2.fire({
    icon: "error",
    title: msg,
  });
}

let recordOrder = [];

const orderBody = document.querySelector(".orderPage-table tbody");

const discardAllOrderItemBtn = document.querySelector(".discardAllBtn");

discardAllOrderItemBtn.addEventListener("click", (e) => {
  e.preventDefault();

  if (recordOrder.length === 0) {
    Swal.fire({
      icon: "warning",
      title: "Sorry....",
      text: "Order items are empty",
    });
    return;
  }

  disAllOrderListBtn();

  axios
    .delete(`${baseUrl}${api_path}/orders`, {
      headers: {
        Authorization: token,
      },
    })
    .then((res) => {
      discardAllOrderItemBtn.removeAttribute("disabled");
      successfulMsg(`Delete all order items successfully`);
      renderOrder(res.data.orders);
    })
    .catch((error) => {
      discardAllOrderItemBtn.removeAttribute("disabled");
      errorMsg(error);
    });
});

async function getOrderList() {
  return axios
    .get(`${baseUrl}${api_path}/orders`, {
      headers: {
        Authorization: token,
      },
    })
    .then((res) => {
      return res.data.orders;
    })
    .catch((error) => {});
}

async function renderOrder(orders) {
  recordOrder = orders;
  renderCart(orders);
  orderBody.innerHTML = orders
    .map(
      (order) =>
        `
            <tr>
              <td>${order.id}</td>
              <td>
                <p>${order.user.name}</p>
                <p>${order.user.tel}</p>
              </td>
              <td>${order.user.address}</td>
              <td>${order.user.email}</td>
              <td>
                ${order.products
                  .map((product) => `<p>${product.title}</p>`)
                  .join("")}
              </td>
              <td>${new Date(order.createdAt * 1000)
                .toLocaleDateString()
                .replaceAll("/", "-")}</td>
              <td class="orderStatus" >
                <a href="#"  data-id="${order.id}">${
          order.paid === true ? "已處理" : "未處理"
        }</a>
              </td>
              <td>
                <input type="button" class="delSingleOrder-Btn" disabled ="true" value="刪除"  data-id="${
                  order.id
                }"/>
              </td>
            </tr>
    `
    )
    .join("");

  try {
    await renderorderStatus();
    await renderDeleteSingleOrderItem();
  } catch (error) {
    errorMsg(error);
    init();
  } finally {
    enableAllOrderListBtn();
  }
}

function renderCart(orders) {
  let totalNum = {};
  let finalData = [];
  let otherTotalNum = {};

  orders.forEach((order) => {
    order.products.forEach((product) => {
      if (totalNum[product.title] === undefined) {
        totalNum[product.title] = 1;
      } else {
        totalNum[product.title] += 1;
      }
    });
  });

  const sortedData = Object.entries(totalNum);

  sortedData.sort((a, b) => {
    return b[1] - a[1];
  });

  let colorCode = ["#DACBFF", "#9D7FEA", "#5434A7", "#301E5F"];

  let color = {};

  sortedData.forEach((item, i) => {
    if (i < 3) {
      color[sortedData[i][0]] = colorCode[i];
      finalData[i] = item;
    } else if ((i = 3)) {
      color["其他"] = colorCode[3];
    }

    if (i >= 3) {
      if (otherTotalNum["其他"] === undefined) {
        otherTotalNum["其他"] = parseInt(sortedData[i][1]);
      } else {
        otherTotalNum["其他"] += parseInt(sortedData[i][1]);
      }
    }
  });

  if (otherTotalNum["其他"] !== undefined) {
    finalData[3] = Object.entries(otherTotalNum)[0];
  }

  c3.generate({
    bindto: "#chart", // HTML 元素綁定
    data: {
      type: "pie",
      columns: finalData,
      colors: color,
    },
  });
}

async function renderorderStatus() {
  let orderStatus = document.querySelectorAll(".orderStatus");
  orderStatus.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();

      let status = e.target.text === "已處理" ? false : true;

      disAllOrderListBtn();
      editOrderItemStautAndRenderOrders(e.target.dataset.id, status);
    });
  });
}

async function renderDeleteSingleOrderItem() {
  let delSingleOrderBtns = document.querySelectorAll(".delSingleOrder-Btn");
  delSingleOrderBtns.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();

      disAllOrderListBtn();
      deleteOrderItemAndRenderOrders(e.target.dataset.id);
    });
  });
}

function editOrderItemStautAndRenderOrders(orderId, status) {
  axios
    .put(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
      {
        data: {
          id: orderId,
          paid: status,
        },
      },
      {
        headers: {
          Authorization: token,
        },
      }
    )
    .then((res) => {
      successfulMsg("Update order status successfully");
      renderOrder(res.data.orders);
    })
    .catch((error) => {
      errorMsg(error);
    });
}

function deleteOrderItemAndRenderOrders(orderId) {
  axios
    .delete(`${baseUrl}${api_path}/orders/${orderId}`, {
      headers: {
        Authorization: token,
      },
    })
    .then((res) => {
      successfulMsg(`Delete order id ${orderId} successfully`);
      renderOrder(res.data.orders);
    })
    .catch((error) => {
      errorMsg(error);
    });
}

function disAllOrderListBtn() {
  document.querySelectorAll(".orderStatus").forEach((item) => {
    item.children[0].setAttribute("class", "disabled");
  });

  document.querySelectorAll(".delSingleOrder-Btn").forEach((item) => {
    item.setAttribute("disabled", true);
  });

  discardAllOrderItemBtn.setAttribute("disabled", true);
}

function enableAllOrderListBtn() {
  document.querySelectorAll(".orderStatus").forEach((item) => {
    item.children[0].removeAttribute("class");
  });

  document.querySelectorAll(".delSingleOrder-Btn").forEach((item) => {
    item.removeAttribute("disabled");
  });

  discardAllOrderItemBtn.removeAttribute("disabled");
}

async function init() {
  try {
    let orders = await getOrderList();
    renderOrder(orders);
  } catch (error) {
    errorMsg(error);
  }
}

init();

// C3.js
// let chart = c3.generate({
//   bindto: "#chart", // HTML 元素綁定
//   data: {
//     type: "pie",
//     columns: [
//       ["Louvre 雙人床架", 1],
//       ["Antony 雙人床架", 2],
//       ["Anty 雙人床架", 3],
//       ["其他", 4],
//     ],
//     colors: {
//       "Louvre 雙人床架": "#DACBFF",
//       "Antony 雙人床架": "#9D7FEA",
//       "Anty 雙人床架": "#5434A7",
//       其他: "#301E5F",
//     },
//   },
// });
