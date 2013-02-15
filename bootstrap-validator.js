(function ($) {
    var _rgxEmail = /^[0-9a-z._%+-]+@[0-9a-z.-]+\.[a-z]{2,6}$/i;
	var _rgxUrl = /^(?:https?://)?(?:[\w]+\.)(?:\.?[\w]{2,})+$/i;
	
    // Stock validators.
    //
    var _validators = {
        'required': function(value, msg) {
            return !value ? (msg || "Required.") : null;
        },
        'stringlength': function(value, msg) {
            var $this = $(this);
            
            if (value) {
                var min = parseInt($this.data('stringlength-min'));
                if (isNaN(min)) min = null;

                var max = parseInt($this.data('stringlength-max'));
                if (isNaN(max)) max = null;

                if (min > 0 && max > 0 && (value.length < min || value.length > max)) {
                    return msg || "Must be between " + min.toString() + " and " + max.toString() + " characters long.";
                }
                else if (min > 0 && value.length < min) {
                    return msg || "Must be " + min.toString() + " characters or more."
                }
                else if (max > 0 && value.length > max) {
                    return msg || "Must be " + max.toString() + " characters or less."
                }
            }

            return null;
        },
        'number': function(value, msg) {
            var $this = $(this);
            
            var number = parseInt(value);
            if (isNaN(number)) return msg || 'Not a number.';

            var min = parseInt($this.data('number-min'));
            if (isNaN(min)) min = null;

            var max = parseInt($this.data('number-max'));
            if (isNaN(max)) max = null;

            if (min > 0 && max > 0 && (number < min || number > max)) {
                return msg || "Must be between " + min.ToString() + " and " + max.toString() + ".";
            }
            else if (min > 0 && number < min) {
                return msg || "Must be " + min.toString() + " or greater.";
            }
            else if (max > 0 && number > max) {
                return msg || "Must be " + max.toString() + " or less.";
            }

            return null;
        },
        'regex': function(value, msg) {
            var pattern = $(this).data('regex-pattern');

            if (pattern && value) {
                var rgx = new RegExp(pattern);
                if (!rgx.test(value)) return msg || "Invalid value.";
            }

            return null;
        },
        'match': function(value, msg) {
            var selector = $(this).data('match-selector');
            var $target = !selector ? null : $(selector);
                    
            if ($target.length > 0 && value!==$target.val()) {
                return msg || "Values do not match.";
            }

            return null;
        },
        'email': function(value, msg) {
            return _rgxEmail.test(value) ? null : (msg || "Not a valid email address.");
        },
		'url': function(value, msg) {
			return _rgxUrl.test(value) ? null : (msg || "Not a valid URL.");
		}
    };

    _validators.__defineGetter__('stockNames', function () {
        return ['required', 'stringlength', 'number', 'date', 'time', 'datetime', 'regex', 'match', 'email'];
    });

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

            var msg = null;
            var customMsg = $this.data(name + '-msg');

            if (_validators.stockNames.indexOf(name) < 0)
                msg = !_validators[name].call(this, getValueFromElement(this)) ? (customMsg || "Invalid value.") : null;
            else
                msg = _validators[name].call(this, getValueFromElement.call(this), customMsg);

            if (msg) return msg;
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

        var $err = $context.next('.validation-error');
        $err.popover('destroy');
        $err.remove();

        if (msg) {
            $this.closest('.control-group').addClass('error');

			var errorTemplate = $this.data('error-template') || '<span class="help-inline"><i class="icon-warning-sign"></i></span>';
            $err = $(errorTemplate);
			$err.addClass('error-placeholder');
            $context.after($err);

            $err.popover({ title: 'Error', placement: 'right', trigger: 'hover', content: msg });
        }
        else {
            $this.closest('.control-group').removeClass('error');
        }
    }

    function validateElement(force) {
        var $this = $(this);
		
		if (
			!force
			&& $this.is('input, textarea, select')
			&& !$this.hasData('validate-activated')
			&& !getValueFromElement.apply(this)
		)
		{
			return;
		}
		
        $this.data('validate-activated', true);

        var msg = getValidationMessage.call(this);
        processErrorMsg.call(this, msg);

        return typeof msg === 'undefined' || msg === null;
    }

    function resetContainer() {
        $(this)
            .find('[data-validators]')
            .each(function () { processErrorMsg.call(this); })
        ;
    }

    function validateContainer() {
        var $this = $(this);
        var success = true;

        resetContainer.call(this);

        $this
            .find('[data-validators]')
            .each(function () {
                success = validateElement.call(this, true) && success;
            })
        ;

        return success;
    }

    function fireTriggers() {
        var $this = $(this);

        var selector = $this.data('triggers-container');
        var selectorIsGlobal = /^(true|yes)$/i.test($this.data('triggers-container-is-global'));

        var $container = selectorIsGlobal ? $(selector) : $this.closest(selector);
        if ($container.length < 1) return;
        
        $container.hasClass('validate')
            ? validateContainer.call($container[0])
            : validateElement.call($container[0], true)
        ;
    }

    function onBlur() {
        var $this = $(this);
        
        if (!$this.is('[data-validators]')) {
            if ($this.is('[data-triggers-container]')) fireTriggers.call(this);
            return;
        }

        if ($this.is('input, select, textarea')) {
            var value = $this.is('input') ? $this.val() : $this.find('option:selected').val();
            if (!value && $this.data('validation-held')) return;
        }

        validateElement.call(this);
    }

    function onSubmit(e) {
        if (!validateContainer.call(this)) {
            e.preventDefault();
            return false;
        }
        else
            return true;
    }

    function addCustomValidator(name, fn) {
        if (!name || typeof fn !== 'function') return;

        if (_validators.stockNames.indexOf(name) < 0) {
            _validators[name] = fn;
        }
    }

    $(document).ready(function () {
        $(document).on('submit', 'form.validate', onSubmit);
        $(document).on('blur', '.validate input[type!="hidden"], .validate select, .validate textarea', onBlur);

        $.validator = {
            addCustomValidator: function() {
                var options = Array.prototype.slice.call(arguments, 0);
                addCustomValidator.apply(this, options);
            }
        };

        $.fn.validator = function (method) {
            var result = true;
            var isContainer = this.hasClass('validate');

            this.each(function () {
                switch (method.toLowerCase()) {
                    case 'validate':
                        result = (!isContainer ? validateElement.call(this) : validateContainer.call(this)) && result;
                        break;

                    case 'reset':
                        isContainer ? resetContainer.call(this) : processErrorMsg.call(this, null);
                        break;
                }
            });

            return result;
        };
    });
})(jQuery);