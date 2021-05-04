window.onload = () => {
  // save user and dish choices
  $("#user").change((e) => {
    localStorage.setItem("userId", e.target.value);

    // auto select food
    $.get(`/menu/${e.target.value}/${date.id}`, (data) => {
      const menu = menus.find((menu) => menu.dish === data);
      if (menu) $("#dish").val(menu.id).change();
    });
  });

  $("#dish").change((e) => {
    localStorage.setItem("dishId", e.target.value);

    // save dish name to hidden field (to send along with api)
    const menu = menus.find((menu) => menu.id === +e.target.value);
    menu && $("#dishName").val(menu.dish);
  });

  // auto restore select user and dish
  const userOption = localStorage.getItem("userId");
  if (users.some((user) => user.id == userOption)) {
    $("#user").val(userOption).change();
  }

  const dishOption = localStorage.getItem("dishId");
  if (menus.some((menu) => menu.id == dishOption)) {
    $("#dish").val(dishOption).change();
  }

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
