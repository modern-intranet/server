// handle on select user
window.onload = () => {
  const todayStr = new Date().toISOString().split("T")[0];
  const hours = new Date().getHours();

  // save user and dish choices
  $("#user").change((e) => {
    localStorage.setItem("userId", e.target.value);
  });

  // auto restore select user and dish
  const userOption = localStorage.getItem("userId");
  if (users.some((user) => user.id == userOption)) {
    $("#user").val(userOption).change();
  }

  // use ajax to get orders list
  function onChangeUser(e) {
    const userId = e?.target.value || $("#user").val();

    $.get(`/schedule/${userId}`, (data) => {
      if (!data || !data.thisWeekData || !data.nextWeekData) return;

      data.thisWeekData.forEach((d) => {
        $(`#${d.date}`).val(d.dish);
        $(`#${d.date}`).change();

        // not allow shedule the date that already passed or already ordered
        if (todayStr >= d.date || d.status === 1) {
          $(`#${d.date}`).siblings("button").prop("disabled", true);
        }
      });

      data.nextWeekData.forEach((d) => {
        $(`#${d.date}`).val(d.dish);
        $(`#${d.date}`).change();

        // not allow shedule the date that already passed or already ordered
        if (todayStr >= d.date || d.status === 1) {
          $(`#${d.date}`).siblings("button").prop("disabled", true);
        }
      });
    });
  }

  onChangeUser();
  $("#user").change(onChangeUser);
};

// disable button while submitting
function onSubmit() {
  $("#submit-button").prop("disabled", true);
}
