function changeValidator()
{
	this.validatePassword = function(pass)
	{
		return pass.length >= 6;
	}
}

changeValidator.prototype.validateForm = function()
{
	if (this.validatePassword($('#pass').val()) == false)
	{
		alert('Your new password must be at least 6 characters long!');
		return false;
	}
	else if ($('#pass').val() != $('#pass-cf').val())
	{
		alert('The passwords in both inputs must match!');
		return false;
	}
	else
	{
		return true;
	}
}