const todayStr = new Date().toISOString().split("T")[0];

window.onload = () => {
  /* Save user and dish choices */
  $("#user").change((e) => {
    localStorage.setItem("userId", e.target.value);
  });

  /* Auto restore selected user */
  const userOption = localStorage.getItem("userId");
  if (users.some((user) => user.id === +userOption)) {
    $("#user").val(userOption).change();
  }

  onChangeUser();
  $("#user").change(onChangeUser);
};

/* Toggle disable all elements */
function disableAllElements(disable) {
  if (disable) {
    $("#user").siblings("button").prop("disabled", true);
    $("#submit-button").prop("disabled", true);
    $(".selectpicker").siblings("button").prop("disabled", true);
    $(".refresh-icon").hide();
  } else {
    $("#user").siblings("button").prop("disabled", false);
    $("#submit-button").prop("disabled", false);
    $(".selectpicker").siblings("button").prop("disabled", false);
    $(".refresh-icon").show();
  }
}

/* On submit form */
function onSubmit() {
  disableAllElements(true);
  $("#schedule-message").html("<b>Đang đặt lịch</>");
}

/* Use ajax to get orders list */
function onChangeUser(e) {
  const userId = e?.target.value || $("#user").val();

  $.post(`/schedule/of/${userId}`, (data) => {
    if (!data || !data.thisWeekData || !data.nextWeekData) return;

    data.thisWeekData.forEach((d) => {
      $(`#${d.date}`).val(d.dish);
      $(`#${d.date}`).change();

      /* Not allow shedule the date that already passed or already ordered */
      if (todayStr >= d.date || d.status === 1) {
        $(`#${d.date}`).siblings("button").prop("disabled", true);
      }
    });

    data.nextWeekData.forEach((d) => {
      $(`#${d.date}`).val(d.dish);
      $(`#${d.date}`).change();

      /* Not allow shedule the date that already passed or already ordered */
      if (todayStr >= d.date || d.status === 1) {
        $(`#${d.date}`).siblings("button").prop("disabled", true);
      }
    });
  });
}

/* Sync order list from intranet to database */
function syncOrderOfDate(date) {
  disableAllElements(true);
  $("#schedule-message").html("<b>Đang đồng bộ hóa</>");

  $.post(`/schedule/sync/${date}`, (data) => {
    window.location.reload();
  });
}
