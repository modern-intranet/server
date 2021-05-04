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
  $.post(`/list/of/${date}`, (data) => {
    try {
      if (data.data.table.includes("<td>")) {
        $("#list-table").html(data.data.table);
      } else {
        $("#list-table td").html("<b>Không có danh sách</b>");
      }
    } catch {}
  });
};
