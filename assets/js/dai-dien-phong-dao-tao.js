$(document).ready(function() {
  // Sidebar active state logic
  $(document).on('click', '.nav-link', function(e) {
    if ($(this).attr('href') === '#' || $(this).attr('href') === '') {
      e.preventDefault();
    }
    $('.nav-link').removeClass('active');
    $(this).addClass('active');
  });
});
