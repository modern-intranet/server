window.onload = () => {
  // save user and dish choices
  $("#user").change((e) => {
    localStorage.setItem("userId", e.target.value);

    // auto select food by getting data
    $.post(`/menu/${e.target.value}/${date.id}`, (data) => {
      const menu = menus.find((menu) => compare(menu.dish, data));
      if (menu) $("#dish").val(menu.id).change();
    });
  });

  // auto restore selected user
  const userOption = localStorage.getItem("userId");
  if (users.some((user) => user.id === +userOption)) {
    $("#user").val(userOption).change();
  }

  // save dish name to hidden field (to send along with api)
  $("#dish").change((e) => {
    const menu = menus.find((menu) => menu.id === +e.target.value);
    menu && $("#dishName").val(menu.dish);
  });

  // trigger first time to update dishName field
  $("#dish").change();

  // show warning if outside order hour
  const today = new Date();
  const hours = today.getHours();
  (today.toISOString().split("T")[0] >= date.id || hours < 13 || hours > 17) &&
    $("#outside-hour-warning").show();
};

// disable button while submitting
function onSubmit() {
  $("#submit-button").prop("disabled", true);
}

function compare(a, b) {
  return a.trim().localeCompare(b.trim(), "en", { sensitivity: "base" }) === 0;
}
