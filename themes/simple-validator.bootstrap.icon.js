(function($){

	var _defaultTemplate = '<span class="help-inline"><i class="icon-warning-sign"></i></span>';

	function showError(e, context, msg, oldErr, newErr) {
		if (oldErr) {
			var $oldErr = $(oldErr);
			$oldErr.popover('destroy');
			$oldErr.remove();
		}
		
		var $newErr = $(newErr);
		$newErr.popover({ title: 'Error', placement: 'right', trigger: 'hover', content: msg });
		$(context).after($newErr);
		
		$(e.target).closest('.control-group').addClass('error');
	}
	
	function hideError(e, context, err) {
		if (err) {
			var $err = $(err);
			$err.popover('destroy');
			$err.remove();
		}
		
		$(e.target).closest('.control-group').removeClass('error');
	}

	$(document).ready(function() {
		$.validator.setCustomTemplate(_defaultTemplate);
		$.validator.showerror(showError);
		$.validator.hideerror(hideError);
	});

})(jQuery);
