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

	$("#add").click(function()
	{
		$.ajax({
			url: "/add-course",
			type: "POST",
			data: {add : true},
			success: function(data)
			{
				alert('Course succesfully added.');
			},
			error: function(jqXHR)
			{
				console.log(jqXHR.responseText + ' - ' + jqXHR.statusText);
			}
		});
	});
});
