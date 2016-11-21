$(document).ready(function()
{
	$("#logout").click(function()
	{
		$.ajax({
			url: "/logout",
			type: "POST",
			data: {logout : true},
			success: function(data)
			{
				alert('Successfully logged out. Redirecting to login page.');
				window.location.href = '/';
			},
			error: function(jqXHR)
			{
				console.log(jqXHR.responseText + ' - ' + jqXHR.statusText);
			}
		});
	});

	$("#changePW").click(function()
	{
		window.location.href = '/change';
	});
});
