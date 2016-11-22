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
			if (status == 'success')
			{
				alert(responseText);
				window.location.href = '/';
			}
		},
		error: function(err)
		{
			if (err.responseText == 'username-taken')
			{
				alert('That username is taken.');
			}
			else if (err.responseText == 'email-taken')
			{
				alert('That email is taken.');
			}
		}
	});
});