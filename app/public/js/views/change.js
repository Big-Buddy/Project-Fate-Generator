$(document).ready(function()
{
	var validator = new changeValidator();

	$("#changePassword").ajaxForm({
		beforeSubmit : function(formData, jqForm, options)
		{
			console.log('lol');
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
			alert('Failed to change password.');
		}
	});
});