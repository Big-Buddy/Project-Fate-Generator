function loginValidator()
{
	//Error message display
}

loginValidator.prototype.validateForm = function()
{
	if ($('#user').val() == '')
	{
		alert('The user field needs input!');
		return false
	}
	else if ($('#pass').val() == '')
	{
		alert('The password field needs input!');
		return false;
	}
	else
	{
		return true;
	}
}