// disable button while submitting
function onSubmit() {
  $("#submit-button").prop("disabled", true);
}

// handle on select user
window.onload = () => {
  // save user and dish choices
  $("#user").change((e) => {
    localStorage.setItem("userId", e.target.value);
  });

  $("#dish").change((e) => {
    localStorage.setItem("dishId", e.target.value);
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
