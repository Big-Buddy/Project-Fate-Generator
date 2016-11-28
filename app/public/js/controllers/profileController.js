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
				alert('Successfully logged out. Redirecting   to login page.');
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

	//Absolute FRONT END SEXINESS after this comment:
	var totalScienceElectives=2;
	var totalGeneralElectives=1;
	var totalProgramElectives=5;
	//Science electives selection
	$('#electives-list-1').find('input[type=checkbox]').click(function(){
		var numScienceBoxesChecked = $('#electives-list-1').find("input:checkbox:checked").length;
		$("#class-remaining-1").text(totalScienceElectives-numScienceBoxesChecked);
		if(numScienceBoxesChecked >= totalScienceElectives) {
	        $('#electives-list-1').find('input[type="checkbox"]').not(':checked').prop('disabled', true);
	   }
	   else{
	   	$('#electives-list-1').find('input[type="checkbox"]').not(':checked').prop('disabled', false);
	   }
	});
	//General electives selection
	$('#electives-list-2').find('input[type=checkbox]').click(function(){
		var numGeneralBoxesChecked = $('#electives-list-2').find("input:checkbox:checked").length;
		$("#class-remaining-2").text(totalGeneralElectives-numGeneralBoxesChecked);
		if(numGeneralBoxesChecked >= totalGeneralElectives) {
	        $('#electives-list-2').find('input[type="checkbox"]').not(':checked').prop('disabled', true);
	   }
	   else{
	   	$('#electives-list-2').find('input[type="checkbox"]').not(':checked').prop('disabled', false);
	   }
	});
	//Program electives selection
	$('#electives-list-3').find('input[type=checkbox]').click(function(){
		var numProgramBoxesChecked = $('#electives-list-3').find("input:checkbox:checked").length;
		$("#class-remaining-3").text(totalProgramElectives-numProgramBoxesChecked);
		if(numProgramBoxesChecked >= totalProgramElectives) {
	        $('#electives-list-3').find('input[type="checkbox"]').not(':checked').prop('disabled', true);
	   }
	   else{
	   	$('#electives-list-3').find('input[type="checkbox"]').not(':checked').prop('disabled', false);
	   }
	});
});
