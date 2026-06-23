const SELECT_CATEGORY  = { BY_NAME:"byName", BY_DESC : "byDesc",  BY_DRIVER: "byDriver", BY_AREA: "byArea" };
const s_ValueType = [ "Unknown", "Bool", "Integer", "Real", "String" ];

function getContextPath() {
//	var hostIndex = location.href.indexOf( location.host ) + location.host.length;
//	return location.href.substring( hostIndex, location.href.indexOf('/', hostIndex + 1) );
	return location.origin;
};

Date.prototype.format = function (f) 
{
    if (!this.valueOf()) return " ";
    var weekKorName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    var weekKorShortName = ["일", "월", "화", "수", "목", "금", "토"];
    var weekEngName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var weekEngShortName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var d = this;
	
    return f.replace(/(yyyy|yy|MM|dd|KS|KL|ES|EL|HH|hh|mm|ss|a\/p)/gi, function ($1) {
        switch ($1) {
            case "yyyy": return d.getFullYear(); // 년 (4자리)
            case "yy": return (d.getFullYear() % 1000).zf(2); // 년 (2자리)
            case "MM": return (d.getMonth() + 1).zf(2); // 월 (2자리)
            case "dd": return d.getDate().zf(2); // 일 (2자리)
            case "KS": return weekKorShortName[d.getDay()]; // 요일 (짧은 한글)
            case "KL": return weekKorName[d.getDay()]; // 요일 (긴 한글)
            case "ES": return weekEngShortName[d.getDay()]; // 요일 (짧은 영어)
            case "EL": return weekEngName[d.getDay()]; // 요일 (긴 영어)
            case "HH": return d.getHours().zf(2); // 시간 (24시간 기준, 2자리)
            case "hh": return ((h = d.getHours() % 12) ? h : 12).zf(2); // 시간 (12시간 기준, 2자리)
            case "mm": return d.getMinutes().zf(2); // 분 (2자리)
            case "ss": return d.getSeconds().zf(2); // 초 (2자리)
            case "a/p": return d.getHours() < 12 ? "오전" : "오후"; // 오전/오후 구분
            default: return $1;
        }
    });
};

String.prototype.string = function (len) { var s = '', i = 0; while (i++ < len) { s += this; } return s; };
String.prototype.zf = function (len) { return "0".string(len - this.length) + this; };
Number.prototype.zf = function (len) { return this.toString().zf(len); };
	
Loading = {
	start: function() {
   		if (document.getElementById('loading')) {
   			return;
   		}
   		var ele = document.createElement('div');
   		ele.setAttribute('id', 'loading');

		var image = document.createElement('img');
		image.setAttribute('id', 'loading-image');
		image.setAttribute('src', getContextPath() + "/resources/images/biznexus/Wait.gif");
		image.setAttribute('alt', "Loading...");

   		ele.appendChild(image);
   		document.body.append(ele);
	},
	stop: function() {
   		var ele = document.getElementById('loading');
   		if (ele) {
   			ele.remove();
   		}
	}
}

Number.prototype.pad = function(size) 
{
   	var s = String(this);
   	while (s.length < (size || 2)) {s = "0" + s;}
   	return s;
}	
	
Number.prototype.withCommas = function() {
    var reg = /(^[+-]?\d+)(\d{3})/;
    var n = (this + '');
	 
    while (reg.test(n)) n = n.replace(reg, '$1' + ',' + '$2');
	 
    return n;
}

let numberFormat = function(nVal, nDec, bComma) 	{
	if(typeof nVal == 'undefined')
		return nVal;
	else {
		nVal = nVal.toFixed(nDec);

		var strVal = nVal.toString();
			
		var decPart = strVal.split(".");
		if(bComma == true)
			strVal = decPart[0].replace(/\B(?=(\d{3})+(?!\d))/g,",") + (decPart[1] ? "." + decPart[1] : "");
			
		return strVal;
	}
}
	
function setDarkTheme() {
	var element = document.body;
	var content = document.getElementById("DarkModetext");
	element.className = "dark-mode";
	//content.innerText = "Dark Mode is ON";
}

function MsgBox(txtHeader,txtContent) {
	Sexy.alert('<h1>'+txtHeader+'</h1><p>'+txtContent+'</p>');
}

function ConfirmBox(title, message, func) {
	Sexy.confirm('<h1>' + title + '</h1><p>' + message + '</p>', {
		textBoxBtnOk: 'Ok',
		textBoxBtnCancel: 'Cancel',
		onComplete: function(retCode) {
			func(retCode);
		}
	});
}

OnMessage = function(title, info) {
	!!info.msg ?
	MsgBox(title, info.msg)
	:
	MsgBox(title, info);
}

OnNop = function(title, info) {
	deleteTagCount(title, info);//2023-07-28 heewon 체크박스를 사용한 삭제 진행상황 확인
}

function getItems(url) {
	var obj = new Object();
	obj.cmd = "getItems";
	obj.param = "";
	
	req(url, JSON.stringify(obj));
}

function postMessage(url, req, func) {
	return new Promise((resolve, reject) => {
		$.ajax ({
		    type: 'POST',
		    contentType: 'application/json; charset=UTF-8',
		    url: url,
		    dataType: 'json',
		    cache : false,
		    data: JSON.stringify(req),
		    success: function (obj){
				if(obj.cmd == req.cmd) {
					if(typeof(func) == 'undefined')
						OnMessage(obj.cmd, obj.param);
					else
						func(obj.param, JSON.parse(this.data));
				}
				else if(req.cmd == "selectTags" && obj.cmd == "error"){
					postMessage(url, req, func);
				}
				resolve();
			},
			error: function (request, status, error) 
			{	
				console.log("Error" +  "[" + status + "]" + error);
				reject();
			}
		});
	});
}

/*
function req(url, reqData) {
	return new Promise((resolve, reject) => {
		$.ajax (
		{
		    type: 'POST',
		    contentType: 'application/json; charset=UTF-8',
		    url: url,
		    dataType: 'json',
		    cache : false,
		    data: reqData,
		    success: function (obj) 
		    {	
				if(obj.cmd == "selectTags") OnSelectTags(onGetLoader);
				else if(obj.cmd == "getValues") OnValues(obj.param);
				else if(obj.cmd == "getDrivers") OnDrivers(obj.param);
				else if(obj.cmd == "getAreas") OnAreas(obj.param);
				else if(obj.cmd == "putValues") OnMessage(obj.cmd, obj.param);//OnMessage("Info", "값 등록이 완료되었습니다.");
				else if(obj.cmd == "addTags") OnMessage("Info", "태그 추가가 완료되었습니다.");//OnMessage(obj.cmd, obj.param);
				else if(obj.cmd == "deleteTag") OnNop(obj.cmd, obj.param);
				else if(obj.cmd == "updateTags") OnMessage(obj.cmd, obj.param);//OnMessage("Info", "태그 수정이 완료되었습니다.");
				else if(obj.cmd == "scripts") OnScripts(obj.cmd, obj.param);
				else if(obj.cmd == "getScript") OnGetScript(obj.cmd, obj.param);
				else if(obj.cmd == "putScript") OnMessage(obj.cmd, obj.param);//OnMessage("Info", "스크립트 등록이 완료되었습니다.");
				else if(obj.cmd == "delScript") OnMessage(obj.cmd, obj.param);//OnMessage("Info", "스크립트 삭제가 완료되었습니다.");
				else if(obj.cmd == "getLogs") onGetLogs(obj.cmd, obj.param);
				else if(obj.cmd == "getDriverInfo") OnGetDriverInfo(obj.cmd, obj.param);
				else if(obj.cmd == "getDriverStat") OnGetDriverStat(obj.cmd, obj.param);
				//else if(obj.cmd == "fetchValues")  OnFetchValues(obj.param);
				else if(obj.cmd == "stopProcess")  OnMessage(obj.cmd, obj.param);//OnMessage("Info", "작업이 완료되었습니다.");
				else if(obj.cmd == "setConfig")  OnMessage(obj.cmd, obj.param);//OnMessage("Info", "드라이버 정보 수정이 완료되었습니다.");
				else if(obj.cmd == "systemInfo")  OnSystemInfo(obj.param);
				else if(obj.cmd == "scriptLogs")  OnScriptLogs(obj.param);
				else if(obj.cmd == "getItems")  OnItems(obj.param);
				else console.log(obj);
				resolve();
			},
			error: function (request, status, error) 
			{
				console.log("Error" +  "[" + status + "]" + error);
				reject();
			}
		});
	});
}
*/