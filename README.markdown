# Simple Validator for jQuery

A validation library that does its best to stay out of your way!

## Why Another Validation Library?

Up until this point, I've never found a client-side validation library that I like. Most of them require you to write obtuse sections of code, which... rather defeats the entire purpose of a validation library. At that point, it's just easier to check the fields yourself!

The goal of Simple Validator is to set the page up, tweak a few variables to your liking, and then forget it exists. It was envisioned as a jQuery extension using HTML 5 data attributes and regular CSS classes as its triggers. Originally, it was coupled with Bootstrap. You can see its first and "classic" behavior by loading the `Bootstrap.Icon` style plugin.

## How to Install

1. Grab the latest copy of simple-validator and any themes you're interested in. 
2. Load the latest version of jQuery onto your web page.
3. **Optional:** If you're using one of the Bootstrap themes, you'll need both the script and style files from [Bootstrap][].
4. Load `simple-validator.js` via a `script` tag.
5. **Optional but Highly Recommended:** Load the theme file of your choice via a `script` tag.

[bootstrap]: http://twitter.github.com/bootstrap/index.html

## Getting Started

Enable validation on any `form` element simply by adding the `validate` class:

	<form class="validate">
	...
	</form>

Of course, your newly validatable form won't be of much use without some validators:

	<form class="validate">
		<div>
			<label for="txtRequired">Required:</label>
			<input id="txtRequired" name="txtRequired" type="text" data-validators="required" />
		</div>
		<div>
			<input id="btnSubmit" type="submit" value="Submit!" />
		</div>
	</form>

This example uses `required`, the simplest built-in validator available. Go ahead and try to submit the form without filling in the text box. Now type something in the box and tab out of it, then submit. **See how easy that was?**

(**Tip:** If all you got after a bad submit was the word 'Required', you need to load a style plugin!)

### Basic Validators

Simple Validator comes with seven validator types built-in:

* required
* stringlength
* number
* regex
* match
* email
* url

Here are all of them in action:

	<form class="validate">
		<div>
			<label>Required:</label>
			<input type="text" data-validators="required" />
		</div>
		<div>
			<label>String Length:</label>
			<!-- You can use just min or just max here -->
			<input type="text" data-validators="stringlength" data-stringlength-min="4" data-stringlength-max="12" />
		</div>
		<div>
			<label>Number:</label>
			<!-- Again, you can use just min or just max -->
			<input type="text" data-validators="number" data-stringlength-min="1" data-stringlength-max="10" />
		</div>
		<div>
			<label>Regex:</label>
			<!-- It's a good idea to inclue a more descriptive message for regex validation -->
			<input type="text" data-validators="regex" data-regex-pattern="^(blue|green|red)$" data-regex-msg="Must be red, blue, or green." />
		</div>
		<div>
			<label>Match (#1):</label>
			<input id="txtTarget" type="text" />
			<br />
			<label>Match (#2):</label>
			<!-- data-match-target is a jQuery selector -->
			<input type="text" data-validators="match" data-match-target="#txtTarget" />
		</div>
		<div>
			<label>Email:</label>
			<input type="text" data-validators="email" />
		</div>
		<div>
			<label>URL:</label>
			<input type="text" data-validators="url" />
		</div>
	</form>

The stock validators are a pretty diverse bunch and should (hopefully) cover about 90% of your needs. For a more thorough example, see the `demos/simple.html` page.

### Combining Validators

You can specify as many validators as you want, simply by separating them with spaces:

	<form class="validate">
		<div>
			<label>Required <strong>and</strong> Number:</label>
			<input type="text" data-validators="required number" data-number-min="10" />
		</div>
	</form>

The most common use for this is specifying `required` in addition to another validator type. That bears repeating: **Other validator types will accept blank values if you don't include `required`!**

### Forcing Validation

You don't necessarily need a submit to validate the form. You can trigger validation manually like this:

	// This will validate the entire form.
	var isValid = $('#theFormToValidate').validator('validate');

	// This will validate individual elements. (The call is the same!)
	var isTextValid = $('#theFormToValiate input#txtRequired').validator('validate');

All the regular validation messages will appear/disappear during manual valiation, so you don't have to do anything extra for them.

### Custom Submit Hooks

Because of the way jQuery selectors handle events, hooking the `submit` event is a no-no for validated forms. Instead, use the `success` event handler provided by the library:

	$(document).ready(function() {
		$('#myForm').validator('success', myHandler);
		//Or: $('#myForm').on('success.validate', myHandler);
	});

Just like `submit`, you can return false and/or use `e.preventDefault()` to stop postback, i.e. for AJAX handling.

### Reset Validation

To reset all validation messages and states, just call:

	$('#myForm').validator('reset');


## Advanced Usage

While made with simplicity in mind, Simple Validator has several API hooks lurking under the hood if you want to get fancy.

### Custom Error Template

By default, Simple Validator appends an unstyled span with the error text immediately after the validated element. This is meant as a failsafe in case a styling plugin hasn't been loaded. You can create your own error template quite easily:

	$.validator.setCustomTemplate('<p class="error">%s</p');

`%s` is a placeholder for the validation error text. You do *not* have to include it, which is particularly useful for custom validators. (More on this later.)

You can change the template later via another call to `$.validator.setCustomTemplate`. This will trigger revalidation on every form, however.

### Custom Error Placement

You're not limited to putting the error message right after the validated element. Move it around with these attributes:

* Place it directly after an element with `data-error-after`
* Drill down into the validated element with `data-error-after-child`
* Visit the element's parents and above with `data-error-after-closest`
* Look for a different element at the same level with `data-error-after-sibling`

All of these attributes take jQuery selectors as their values. `data-error-after` is a direct match, all others are relative to the element being validated.

### Custom Validators

Simple Validator's most useful function is the ability to create powerful custom validators with a minimum of effort. Call `$.validator.addCustomValidations`, like so:

	$(document).ready(function() {
		// Set as many as you want in one go!
		$.validator.addCustomValidations({
			'containsthe': function(value) {
				// Return an error message if invalid.
				// If valid, return null.
				//
				return /the/i.match(value)
					? null
					: "Must contain 'the'."
				;
			},
			'doesntcontainand': function(value) {
				return !/and/i.match(value)
					? null
					: "Must not contain 'and'."
				;
			}
		});
	});

Then use them like any other validator:

	<form class="validate">
		<div>
			<label>Special:</label>
			<input type="text" data-validators="required containsthe doesntcontainand" />
		</div>
		<div>
			<input type="submit" value="Submit!" />
		</div>
	</form>

(These examples could easily be done with the stock `regex` validator, of course, but this gives you an idea of the code flow. )

In addition, `this` is scoped to the element being validated. This means you can do things like this:

	$.validator.addCustomValidators({
		'example': function() {
			var val = $(this).val();
			var next = $(this).next();
			...
		}
	});

This is particularly handy when you need extra information for your validation, i.e. what the values in sibling text boxes are.

### Validation Groups

You can bundle multiple elements together into groups, like so:

	<form class="validator">
		<div>
			<input type="text" data-validators="required" data-validation-group="allrequired" />
			<input type="text" data-validators="required" data-validation-group="allrequired" />
			<input type="text" data-validators="required" data-valiation-group="allrequired" />
		</div>
	</form>

When one member of the `allrequired` validation group is validated, the other members will trigger as well.


## Even More Advanced Features

### Creating Your Own Styles 

Craving even more customization? Read on!

Hiding and showing errors can be overridden and handled in custom code. For a live example, take a look at the Bootstrap Popover style plugin, which uses custom event hooks to initialize and destroy popovers.

You have two options if you want this:

* Call `$().validator('showerror')` or `$().validator('hideerror')` to override the handler for individual elements.
* Call `$.validator.showerror()` or `$.validator.hideerror()` to set global handler(s) for *every* form on the page.

In addition to the standard jQuery `event` object, the following information is passed into the `showerror` event handler:

* `context`: the element after which the error message should be appended
* `msg`: the raw error message itself
* `oldErr`: error element being replaced (if any)
* `newErr`: error element for the current validation pass

For `hideerror`, the extra elements are:

* `context`: the element after which the error message is displayed
* `err`: error element being hidden/removed

Note that `context` won't necessarily be the validated element, i.e. in case you've requested a custom error placement. If you want the validated element itself, use `event.target`.

**Warning!** When overriding `showerror` and `hideerror`, Simple Validator assumes you want to handle element insertion/cleanup yourself. This is to avoid timing issues with cleanup. So, don't forget to call `$(context).after($(newErr))` or `$(err).remove()` before you're done!
