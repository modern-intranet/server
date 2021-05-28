window.onload = () => {
  /* Setup datepicker */
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

  /* Use ajax to get table list */
  $.post(`/list/of/${date}`, (data) => {
    try {
      if (data.data.table.includes("<td>")) {
        $("#list-table").html(data.data.table);
      } else {
        $("#list-table td").html("<b>Không có danh sách</b>");
      }
    } catch {
      $("#list-table td").html("<b>Đã xảy ra lỗi kết nối</b>");
    }
  });
};
