(function($) {

	var _defaultTemplate = '<span style="margin-left: 5px;" class="label label-important">%s</span>';

	$(document).ready(function() {
		$.validator.setCustomTemplate(_defaultTemplate);
	});

})(jQuery);
