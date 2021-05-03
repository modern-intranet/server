window.onload = () => {
  // setup datepicker
  $(function () {
    $("#datepicker")
      .datepicker({
        autoclose: true,
        todayHighlight: true,
      })
      .datepicker("update", new Date(date))
      .on("changeDate", (e) => {
        $("#form").submit();
      });
  });

  // use ajax to get table list
  $.get(`/list/${date}`, (data) => {
    if (data && data.data && data.data.includes("<td>")) {
      $("#list-table").html(data.data);
    } else {
      $("#list-table td").html("<b>Không có danh sách</b>");
    }
  });
};
