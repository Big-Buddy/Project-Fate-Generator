//validation before submit and redirection after
$(document).ready(function()
{
	var validator = new regValidator();

	$('#reg').ajaxForm({
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
			//CHANGE ONCE USER PROF IS GOOD TO GO
			if (status == 'success')
			{
				alert(responseText);
			}
		},
		error: function(err)
		{
			if (err.responseText == 'email-taken')
			{
				alert('That email is already in use.');
			}
			else if (err.responseText == 'username-taken')
			{
				alert('That username is already in use.');
			}
		}
	});
});