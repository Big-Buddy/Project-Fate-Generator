//check if inputs for user registration are valid
function regValidator()
{
	//Error Message Display

	this.validateName = function(name)
	{
		return name.length >= 3;
	}

	this.validatePassword = function(pass)
	{
		return pass.length >= 6;
	}

	this.validateEmail = function(email)
	{
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	}

	//TO BE ADDED: HANDLING FOR USERNAMES AND EMAILS ALREADY IN USE
};

regValidator.prototype.validateForm = function()
{
	if (this.validateName($('#user').val()) == false)
	{
		alert('A username must be at least 3 characters long!');
		return false
	}
	else if (this.validatePassword($('#pass').val()) == false)
	{
		alert('Your password must be at least 6 characters long!');
		return false;
	}
	else if ($('#pass').val() != $('#pass-cf').val())
	{
		alert('The passwords in both inputs must match!');
		return false;
	}
	else if (this.validateEmail($('#email').val()) == false)
	{
		alert('That is not a valid email address!');
		return false;
	}
	else
	{
		return true;
	}
}

