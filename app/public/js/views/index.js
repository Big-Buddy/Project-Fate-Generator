//validation before submit and redirection after
$(document).ready(function()
{
	var validator = new loginValidator();

	$('#login').ajaxForm({
		beforeSubmit : function(formData, jqForm, options)
		{
			if (validator.validateForm() == false)
			{
				return false;
			}
			else
			{
				return true;
			}
		},
		success : function(responseText, status, xhr, $form)
		{
			if (status == 'success') window.location.href = '/user_prof';
		},
		error : function(err)
		{
			if (err.responseText == 'user-not-found')
			{
				alert('That user does not exist.');
			}
			else if (err.responseText == 'invalid-password')
			{
				alert('That isn\'t the right password.');
			}
		}
	});
});