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
			}
		},
		error: function(err)
		{
			alert('Failed to add account.')
		}
	});
});