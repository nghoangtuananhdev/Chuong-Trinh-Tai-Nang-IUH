$(document).ready(function() {
  // Sidebar active state logic
  $(document).on('click', '.nav-link', function(e) {
    if ($(this).attr('href') === '#' || $(this).attr('href') === '') {
      e.preventDefault();
    }
    $('.nav-link').removeClass('active');
    $(this).addClass('active');
  });
  // Xử lý submit form đổi mật khẩu
  $('#changePasswordForm').on('submit', function(e) {
    e.preventDefault();
    const newPass = $('#newPassword').val();
    const confirmPass = $('#confirmPassword').val();

    if (newPass !== confirmPass) {
      alert('Mật khẩu mới và xác nhận mật khẩu không khớp!');
      return;
    }

    alert('Đổi mật khẩu thành công!');
    $('#changePasswordModal').modal('hide');
    this.reset();
  });
});
