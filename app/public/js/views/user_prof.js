$(document).ready(function()
{
	//check electives
	//this includes checking the completed course list for electives... and comparing it to the electives list...
	//if the user doesn't have 2 science electives, 1 gen. ed., 5 program electives checked off or already completed... throw an error message and stop form submission

	var validator = new sequenceValidator();

	$('#userProfile').ajaxForm({

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
				window.location.href = '/sequence';
			}
		},
		error : function(err)
		{
			if (err.responseText == 'sequence-generation-failed')
			{
				alert('Sequence generation has failed because of reasons.');
			}
			else
			{
				alert('done.');
			}
		}
	});
});