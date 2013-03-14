(function ($) {
    var _defaultTemplate = '<span class="help-inline"><i class="icon-warning-sign"></i></span>';

    var _template = null;
    var _rgxEmail = /^[0-9a-z._%+-]+@[0-9a-z.-]+\.[a-z]{2,6}$/i;
    var _rgxUrl = new RegExp('^https?://[^.]+?(\.[^.]+?)*$', 'i');
    
    // Stock validators.
    //
    var _validators = {
        'required': function(value) {
            return !value ? 'Required' : null;
        },
        'stringlength': function(value) {
            var $this = $(this);
            
            if (value) {
                var min = parseInt($this.data('stringlength-min'), 10);
                if (isNaN(min)) min = null;

                var max = parseInt($this.data('stringlength-max'), 10);
                if (isNaN(max)) max = null;

                if (min > 0 && max > 0 && (value.length < min || value.length > max)) {
                    return "Must be between " + min.toString() + " and " + max.toString() + " characters long.";
                }
                else if (min > 0 && value.length < min) {
                    return "Must be " + min.toString() + " characters or more."
                }
                else if (max > 0 && value.length > max) {
                    return "Must be " + max.toString() + " characters or less."
                }
            }

            return null;
        },
        'number': function(value) {
            var $this = $(this);
            if (!value) return null;
            
            var number = parseInt(value, 10);
            if (isNaN(number)) return 'Not a number.';

            var min = parseInt($this.data('number-min'), 10);
            if (isNaN(min)) min = null;

            var max = parseInt($this.data('number-max'), 10);
            if (isNaN(max)) max = null;

            if (min > 0 && max > 0 && (number < min || number > max)) {
                return "Must be between " + min.toString() + " and " + max.toString() + ".";
            }
            else if (min > 0 && number < min) {
                return "Must be " + min.toString() + " or greater.";
            }
            else if (max > 0 && number > max) {
                return "Must be " + max.toString() + " or less.";
            }

            return null;
        },
        'regex': function(value) {
            var pattern = $(this).data('regex-pattern');
            var caseSensitive = $(this).data('regex-case-sensitive');

            if (pattern && value) {
                var rgx = new RegExp(pattern, !caseSensitive ? 'i' : '');
                if (!rgx.test(value)) return "Invalid value.";
            }

            return null;
        },
        'match': function(value) {
            var selector = $(this).data('match-target');
            var $target = !selector ? null : $(selector);
                    
            if ($target && $target.length > 0 && value!==$target.val()) {
                return "Values do not match.";
            }

            return null;
        },
        'email': function(value) {
            return !value || _rgxEmail.test(value) ? null : "Not a valid email address.";
        },
        'url': function(value) {
            return !value || _rgxUrl.test(value) ? null : "Not a valid URL.";
        }
    };    
    
    function getValueFromElement() {
        var $this = $(this);

        if ($this.is('input, textarea, select')) {
            return $this.is('select') ? $this.find('option:selected').val() : $this.val();
        }
        else
            return null;
    }

    function getValidationMessage() {
        var $this = $(this);
        
        var validators = ($this.data('validators') || "").split(/,?\s+/);
        var valid = true;

        for (var i in validators) {
            var name = validators[i];
            if (!_validators[name]) continue;

            var value = $.proxy(getValueFromElement, this)();

            var msg = $.proxy(_validators[name], this)(value);
            var customMsg = $this.data(name.toLowerCase() + '-msg');

            if (msg) return customMsg || msg;
        }

        return null;
    }

    function processErrorMsg(msg) {
        var $context;

        var $this = $(this);
        
        if ($this.data('error-after'))
            $context = $($this.data('error-after')).first();
        else if ($this.data('error-after-local'))
            $context = $($this.data('error-after-local'), $this).first();
        else if ($this.data('error-after-closest'))
            $context = $this.closest($this.data('error-after-closest')).first();
        else if ($this.data('error-after-sibling'))
            $context = $this.siblings($this.data('error-after-sibling')).first();
        else
            $context = $this;

        var $err = $context.next('.validation-error-msg');
        $err.popover('destroy');
        $err.remove();

        if (msg) {
            $this.closest('.control-group').addClass('error');

            var template = _template || _defaultTemplate;
            $err = $(template);
            $err.addClass('validation-error-msg');
            $context.after($err);
            $err.popover({ title: 'Error', placement: 'right', trigger: 'hover', content: msg });

            $this.addClass('validation-error');
        }
        else {
            $this.closest('.control-group').removeClass('error');
            $this.removeClass('validation-error');
        }
    }

    function validateElement(force) {
        var $this = $(this);
        
        if (
            !force
            && $this.is('input, textarea, select')
            && !$this.data('validate-activated')
            && !$.proxy(getValueFromElement, this)()
        )
        {
            return;
        }
        
        $this.data('validate-activated', true);

        var msg = $.proxy(getValidationMessage, this)();
        $.proxy(processErrorMsg, this)(msg);

        return typeof msg === 'undefined' || msg === null;
    }

    function resetContainer() {
        $(this)
            .find('[data-validators]')
            .each(function () {
                $(this).removeData('validate-activated');
                $.proxy(processErrorMsg, this)();
            })
        ;
    }

    function validateContainer(erroredOnly) {
        var $this = $(this);
        var success = true;

        var findStr = erroredOnly ? '.validation-error' : '[data-validators]';
        var $elements = $this.find(findStr);

        $.proxy(resetContainer, this)();

        $elements.each(function () {
            success = $.proxy(validateElement, this)(true) && success;
        });

        return success;
    }

    function fireTriggers() {
        var $this = $(this);

        var selector = $this.data('triggers-container');
        var selectorIsGlobal = /^(true|yes)$/i.test($this.data('triggers-container-is-global'));

        var $container = selectorIsGlobal ? $(selector) : $this.closest(selector);
        if ($container.length < 1) return;
        
        $container.hasClass('validate')
            ? $.proxy(validateContainer, $container[0])()
            : $.proxy(validateElement, $container[0])(true);
        ;
    }

	function validateGroup(initialSuccess) {
		var self = this;
		var $this = $(this);
		var validationGroup = $this.data('validation-group');
		var $container = $this.closest('.validate');
		
		var $group = $this
			.closest('.validate')
			.find('[data-validators]')
			.filter(function() {
				return this !== self
					&& $(this).data('validation-group') === validationGroup
				;
			})
		;

		var $successes = $group.filter(function() {
			if ($(this).is('input, select, textarea'))
				return $.proxy(validateElement, this)(true);
			else
				return $.proxy(validateContainer, this)();
		});

		// Hackaround to make sure control-group errors are set. We'll
		// need to fix the design scheme at some point.
		if (!initialSuccess || $successes.length !== $group.length) {
			$this.closest('.control-group').addClass('error');
		}
	}

    function onBlur() {
        var $this = $(this);
        
        if (!$this.is('[data-validators]')) {
            if ($this.is('[data-triggers-container]')) $.proxy(fireTriggers, this)();
            return;
        }

        if ($this.is('input, select, textarea')) {
            var value = $this.is('input') ? $this.val() : $this.find('option:selected').val();
            if (!value && $this.data('validate-activate')) return;
        }

        var initialSuccess = $.proxy(validateElement, this)();

		if ($this.is('[data-validation-group]')) {
			$.proxy(validateGroup, this)(initialSuccess);
		}
    }

    function onSubmit(e) {
        if (!$.proxy(validateContainer, this)()) { 
            e.preventDefault();
            e.stopImmediatePropagation();
            return false;
        }

		var successEvent = $.Event('success');
		$(this).trigger(successEvent);

		if (successEvent.isDefaultPrevented()) e.preventDefault();
		if (successEvent.isPropagationStopped()) e.stopPropagation();
		if (successEvent.isImmediatePropagationStopped()) e.stopImmediatePropagation();
		
		return successEvent.result;
    }

    function addCustomValidators(name, fn) {
        if (!name) return;

        if (typeof name === 'object') {
            var obj = name;

            for (var key in obj) {
                if (_validators.stockNames.indexOf(key) < 0) {
                    _validators[key] = obj[key];
                }
            }
        }
        else if (fn && _validators.stockNames.indexOf(name) < 0) {
            _validators[name] = fn;
        }
    }

    $(document).ready(function () {
        var stockNames = [];
        
        for (var i in _validators) {
            stockNames.push(i);
        }
        _validators.stockNames = stockNames;
        
        $(document).on('submit.validate', 'form.validate', onSubmit);
        $(document).on('blur.validate', '.validate input[type!="hidden"], .validate select, .validate textarea', onBlur);

        $.validator = {
            addCustomValidators: function() {
                var options = Array.prototype.slice.call(arguments, 0);
                addCustomValidators.apply(this, options);
            },
            setCustomTemplate: function(html) {
                _template = !html ? _defaultTemplate : html;
                
                $('.validate').each(function() {
                    $.proxy(validateContainer, this)(true);
                });
            }
        };

        $.fn.validator = function (method) {
			var options = Array.prototype.slice.call(arguments, 1);
            var result = true;
            var isContainer = this.hasClass('validate');

            this.each(function () {
                switch (method.toLowerCase()) {
                    case 'validate':
                        result = !isContainer
                            ? $.proxy(validateElement, this)()
                            : $.proxy(validateContainer, this)()
                        && result;
                        break;

					case 'success':
						if (options.length > 0) {
							$(this).on('success.validate', options[0]);
						}
						break;

                    case 'reset':
                        isContainer
                            ? $.proxy(resetContainer, this)()
                            : $.proxy(processErrorMsg, this)(null)
                        ;
                        break;
                }
            });

            return result;
        };
    });
})(jQuery);
