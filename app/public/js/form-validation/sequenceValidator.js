function sequenceValidator()
{
	//check science
	//check general ed
	//check program electives
	//check completed courses prerequisites

	this.validateScience = function()
	{
		return $('.science:checked').length >= 2;
	}

	this.validateGeneral = function()
	{
		return $('.general:checked').length >= 1;
	}

	this.validateScience = function()
	{
		return $('.program:checked').length >= 5;
	}

	this.validateCompleted = function()
	{
		var conflicting = [];
		$('.completed:checked').each(function()
		{
			var checkedSplitter = $(this).val().split('.');

			if (checkedSplitter[1] != '')
			{
				var prereqSplitter = checkedSplitter[1].split(',');

				($('.completed').not(':checked')).each(function()
				{
					var uncheckedSplitter = $(this).val().split('.');

					for (var i = 0; i < prereqSplitter.length; i++)
					{
						if (prereqSplitter[i] == uncheckedSplitter[0])
						{
							conflicting.push(checkedSplitter[2] + ' needs ' + uncheckedSplitter[2]);
						}
					}
				});
			}
		});
		return conflicting;
	}
}

sequenceValidator.prototype.validateForm = function()
{
	var conflicts = this.validateCompleted();
	
	/*if (this.validateScience() == false)
	{
		alert('You need to select a total of two basic science electives.');
		return false;
	}
	else if (this.validateGeneral() == false)
	{
		alert('You need to select at least one general elective.');
		return false;
	}
	else if (this.validateScience() == false)
	{
		alert('You need to select at least five program electives.');
		return false;
	}
	else*/ if (conflicts.length > 0)
	{
		var error = 'Completed Courses Error! You need to fulfill the prerequisites for:';

		for(message in conflicts)
		{
			error += '\n' + conflicts[message];
		}

		alert(error);

		return false;
	}
	else
	{
		return true;
	}

}