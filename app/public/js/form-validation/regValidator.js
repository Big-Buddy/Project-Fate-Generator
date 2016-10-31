function checkFN(){
	var firstName = document.getElementById("fNam").value;
	var	rightForm = /^([A-Za-z\-]+|\s)$/;
	var	checkedFN = document.getElementById("checkedFN");
	if(firstName.match(rightForm))
		checkedFN.innerHTML = "";
	else
		checkedFN.innerHTML = "invalid";
}
function checkLN(){
	var lastName = document.getElementById("lNam").value;
	var	rightForm = /^([A-Za-z\-]+|\s)$/;
	var	checkedLN = document.getElementById("checkedLN");
	if(rightForm.test(lastName))
		checkedLN.innerHTML = "";
	else
		checkedLN.innerHTML = "invalid";
}
function checkPN(){
	var tel = document.getElementById("tel").value;
	var checkedPN = document.getElementById("checkedPN");
	var rightForm = /^\(\d{3}\)\d{3}\-\d{4}$/;
	if (tel.match(rightForm))
		checkedPN.innerHTML = "";
	else
		checkedPN.innerHTML = "invalid";	
}
function checkEM(){
	var email = document.regF.email.value;
	var form = /^\w+@[A-Za-z0-9]+\.\w+$/;
	var checkedEM = document.getElementById("checkedEM");
	if (email.match(form))
		checkedEM.innerHTML = "";
	else
		checkedEM.innerHTML = "invalid";
}
function checkAC(){
	var account = document.regF.account.value;
	var form = /^\w{6}\w*$/;
	var checkedAC = document.getElementById("account");
	if (account.match(form))
		checkedAC.innerHTML = "";
	else
		checkedAC.innerHTML = "invalid";
}

function checkPW1(){
	var pw1 = document.getElementById("pw1").value;
	var rightForm = /^[A-Za-z0-9]{6}[A-Za-z0-9]*$/;
	var checkedPW = document.getElementById("pw");
	if(pw1.match(rightForm))
		checkedPW.innerHTML = "";
	else
		checkedPW.innerHTML = "invalid";
}
function checkPW2(){
	var pw1 = document.regF.pw.value;
	var pw2 = document.regF.pwConf.value;
	var pwConf = document.getElementById("pwConf");
	if(pw1 == pw2)
		pwConf.innerHTML = "valid";
	else
		pwConf.innerHTML = "invalid";
}
