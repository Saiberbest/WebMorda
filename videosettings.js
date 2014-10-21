		
var param = new Array(); //Переменная, в которой хранятся текущие параметры камеры
var tempParam //Переменная, в которой хранятся параметры, введённые пользователем на странице
var httpResponse;
var paramGetNames = [
	"title",
	"videocodec",
	"videocodecname",
	"videocodeccombo",
	"videocodeccomboname",
	"videocodecres",
	"videocodecresname",
	"bitrate1",
	"bitrate2",
	"framerate1",
	"frameratenameall1",
	"framerate2",
	"frameratenameall2",
	"framerate3",
	"frameratenameall3",
	"ratecontrol1",
	"ratecontrol2",
	"ratecontrolname",	//OFF;VBR;CBR
	"datestampenable1",
	"datestampenable2",
	"datestampenable3",
	"timestampenable1",
	"timestampenable2",
	"timestampenable3",
	"textenable1",
	"textenable2",
	"textenable3",
	"textposition1",
	"textposition2",
	"textposition3",
	"textpositionname",	//Top-Left;Top-Right
	"overlaytext1",
	"overlaytext2",
	"overlaytext3",
	"detailinfo1",
	"detailinfo2",
	"detailinfo3",
	"mirctrl",
	"mirctrlname",			//OFF;HORIZONTAL;VERTICAL;BOTH
	"localdisplay",
	"localdisplayname",	//OFF;NTSC;PAL
	"aviformat",
	"aviformatname", 		//MPEG4(1280 x 720);MPEG4(320 x 192)
	"aviduration",
];
var paramSetNames = ["title","videocodec","videocodeccombo","videocodecres","bitrate1","framerate1"];

getParamResponse();

function copy(o) {
	 var out, v, key;
	 out = Array.isArray(o) ? [] : {};
	 for (key in o) {
			 v = o[key];
			 out[key] = (typeof v === "object") ? copy(v) : v;
	 }
	 return out;
}



function getXmlHttp() {
	var xmlhttp;
	try {
		xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
	} catch (e) {
		try {
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		} catch (E) {
			xmlhttp = false;
		}
	}
	if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
		xmlhttp = new XMLHttpRequest();
	}
	return xmlhttp;
}



function getParamResponse(){
	paramNames=paramGetNames;
	var xmlhttp = getXmlHttp();				
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4) {
			if(xmlhttp.status == 200) {							
				try {								
					document.getElementById("scriptLog").innerHTML += "Параметры камеры получены.\r\n"; 								
				}catch(e){
				}
				httpResponse=xmlhttp.responseText;
				loadPageScript();							
			}else{
				try {
					document.getElementById("scriptLog").innerHTML += "Error 404: cannot get response from camera!\r\n"; 
				}catch(e){
				} 
				httpResponse="";
			}
		}else{httpResponse="";}
	};				
	var url='vb.htm?';
	for(var i=0; i < paramNames.length; i++){
		url+="paratest="+paramNames[i];
		if (i<(paramNames.length-1)){url+="&"}
	}
	xmlhttp.open('GET', url, true);
	xmlhttp.send();
}	


//Запись параметров TempParam в камеру
function setParamResponse(){
	paramNames=paramSetNames;

	var xmlhttp = getXmlHttp();				
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4) {
			if(xmlhttp.status == 200) {							
				try {								
					document.getElementById("scriptLog").innerHTML += "Запись параметров:"+xmlhttp.responseText; 								
				}catch(e){
				}
				httpResponse=xmlhttp.responseText;
				alert("Параметры установлены. Ответ камеры:"+httpResponse);
				getParamResponse();							
			}else{
				try {
					document.getElementById("scriptLog").innerHTML += "Error 404: cannot get response from camera!\r\n"; 
				}catch(e){
				} 
				httpResponse="";
			}
		}else{httpResponse="";}
	};			
	
	var url='vb.htm?';
	for(var i=0; i < paramNames.length; i++){
		if(param[paramNames[i]]!=tempParam[paramNames[i]]){
			url+= paramNames[i]+"="+tempParam[paramNames[i]];
			if (i<(paramNames.length-1)){url+="&"}
		}
	}
	xmlhttp.open('GET', url, true);
	xmlhttp.send();
	
	
}



function loadPageScript(){
	//После получения ответа от камеры, запускаем этот скрипт
	
	//Парсим параметры и сохраняем их в глобальную переменную param[]
	parseParams();
	
	//Парсим имена для селектов видеокодеков
	parseCodecSelectNames();
	
	//Создаём копию параметров для хранения введеных пользователем значений
	tempParam=copy(param);
	
	//Создаём селекты в соответствии с текущими значениями
	createCodecSelect(param);
	
	//Отображаем полученные параметры и селекты
	displayParamSet(param);				
	
}


//Функция, которая разбивает строку ответа от камеры на отдельные параметры и записывает их в ассоциативный массив param[key]=value
function parseParams(){ 

	var tmp = new Array();      // два вспомогательных
	var tmp2 = new Array();     // массива
	
	var get = httpResponse;  
	if(get != '') {
		tmp = (get.substr(3)).split('OK ');   
		for(var i=0; i < tmp.length; i++) {
			tmp2 = tmp[i].split('=');       
			param[tmp2[0]] = tmp2[1];       
		}										
	}else{
		try {
			document.getElementById("scriptLog").innerHTML += "Error: empty response from camera!\r\n"; 
		}catch(e){
		} 
	}
}


//Функция, которая парсит имена кодеков 
function parseCodecSelectNames(){
	try {	
		//Парсинг одновложенных параметров (разделитель ";")
		function parseNamesUno(key){
			var tmp = new Array();      
			var keyString = param[key];
			var keyParsed = key+"Parsed";
		
			if(keyParsed != '') {
				param[keyParsed]=new Array();
				tmp = (keyString).split(';');   
				for(var i=0; i < tmp.length; i++) {							      
					param[keyParsed][i] = tmp[i]; 				
				}					
			}
		}
		//Парсинг двухвложенных параметров (разделители "@", ";")
		function parseNamesDuo(key){
			var tmp = new Array();      // два вспомогательных
			var tmp2 = new Array(); 		// массива
			var keyString = param[key];
			var keyParsed = key+"Parsed";
		
			if(keyString != '') {
				param[keyParsed]=new Array();
				tmp = (keyString).split('@');   
				for(var i=0; i < tmp.length; i++) {	
					tmp2 = tmp[i].split(';'); 
					param[keyParsed][i]=new Array();
					for(var j=0; j < tmp2.length; j++) {	
						param[keyParsed][i][j] = tmp2[j]; 
					}
				}
			}
		}
		//Парсинг трёхвложенных параметров (разделители "@", ";", ",")
		function parseNamesTrio(key){
			var tmp = new Array();      // три вспомогательных
			var tmp2 = new Array(); 		// массива
			var tmp3 = new Array(); 		// массива
			var keyString = param[key];
			var keyParsed = key+"Parsed";
		
			if(keyString != '') {
				param[keyParsed]=new Array();
				tmp = (keyString).split('@');   
				for(var i=0; i < tmp.length; i++) {	
					tmp2 = tmp[i].split(';'); 
					param[keyParsed][i]=new Array();
					for(var j=0; j < tmp2.length; j++) {	
						tmp3 = tmp2[j].split(',');
						param[keyParsed][i][j] = new Array(); 
						for(var k=0; k < tmp3.length; k++) {	
							param[keyParsed][i][j][k] = tmp3[k];
						}
						 
					}
				}
			}
		}
	
		
		parseNamesUno		(	"videocodecname"			);							
		parseNamesDuo		(	"videocodeccomboname"	);							
		parseNamesDuo		(	"videocodecresname"		);					
		parseNamesTrio	(	"frameratenameall1"		);							
		parseNamesTrio	(	"frameratenameall2"		);							
		parseNamesTrio	(	"frameratenameall3"		);					
		parseNamesUno		(	"ratecontrolname"			);							
		parseNamesUno		(	"textpositionname"		);							
		parseNamesUno		(	"mirctrlname"					);							
		parseNamesUno		(	"localdisplayname"		);							
		parseNamesUno		(	"aviformatname"				);
		
	}catch(e){
		var obj = document.getElementById("scriptLog"); 							
		obj.innerHTML += "Cannot parse videocodec names.\r\n";
	}
	
}



function createCodecSelect(paramSet){
	function createSelect(key,Names){
		//Выбираем селекты из DOM
		videocodecSelect = document.getElementById(key);		
		//Очищаем
		videocodecSelect.options.length = 0;
		//Создаём новые элементы											
		for (var i=0; i<Names.length; i++){
			videocodecSelect.options[i]=new Option(Names[i], i);
		}		
	}

	var videocodecSelect;
	var videocodeccomboSelect;
	var videocodecresSelect;		
	
	//Получаем индексы для извлечения имён селектов	
	var videocodecNum=parseInt(paramSet["videocodec"];
	var videocodeccomboNum=parseInt(paramSet["videocodeccombo"];
	var videocodecresNum=parseInt(paramSet["videocodecres"];
	var videocodecresIndex;
	videocodecresIndex=	(videocodecNum==0?	videocodeccomboNum:
													(videocodecNum==1?	3+videocodeccomboNum:
														8+videocodeccomboNum
													)	
											);	
	//Получаем имена для селектов	
	var videocodecNames=paramSet["videocodecnameParsed"];
	var videocodeccomboNames=paramSet["videocodeccombonameParsed"][videocodecNum];	
	var videocodecresNames=paramSet["videocodecresnameParsed"][videocodecresIndex];
	var framerate1Names=paramSet["videocodecresnameParsed"][videocodecresIndex][videocodecresNum];
	
	
		
	try {
			
			createSelect("videocodec",videocodecNames);	
			
			createSelect("videocodeccombo",videocodeccomboNames);	
			
			createSelect("videocodecres",videocodecresNames);	
			
			
						
	}catch (e) {
		try {
			var obj = document.getElementById("scriptLog"); 							
			obj.innerHTML += "Cannot find one of videocodec selects.\r\n";
		}catch (e) {}
	}
}



function displayParamSet(paramSet){
	for (var key in paramSet) {
		try {
			var obj = document.getElementById(key);  
			idTagName=obj.tagName.toLowerCase();						
			if (idTagName=="input"){
				obj.value = paramSet[key];							
			}else if (idTagName=="select"){
				//Если селект относится к выбору кодека, то запускаем функцию обновления селектов кодеков
				if (key=="videocodec"||key=="videocodeccombo"||key=="videocodecres"){
				}
				obj.value = paramSet[key];
				obj.options.selectedIndex=paramSet[key];
			}else{document.getElementById("scriptLog").innerHTML+=key+"="+idTagName+"\r\n";}
		}catch (e) {
			try {
				var obj = document.getElementById("scriptLog"); 							
				obj.innerHTML +="Не могу отобразить "+key+"\r\n";
			}catch (e) {
			}
		}
	}
}



function onCodecSelectChange(triger){				
	try {
		if (triger==2){
			var videocodecSelect 					= document.getElementById("videocodec");	
			var videocodeccomboSelect 		= document.getElementById("videocodeccombo");		
			var videocodecresSelect 			= document.getElementById("videocodecres"); 
			tempParam["videocodec"]				= videocodecSelect.value;
			tempParam["videocodeccombo"]	= videocodeccomboSelect.value;
			tempParam["videocodecres"]		= videocodecresSelect.value;
		}else if (triger==1){
			var videocodecSelect 					= document.getElementById("videocodec");	
			var videocodeccomboSelect 		= document.getElementById("videocodeccombo");		
			tempParam["videocodec"]				= videocodecSelect.value;
			tempParam["videocodeccombo"]	= videocodeccomboSelect.value;
			tempParam["videocodecres"]		= 0;
		}else if (triger==0){
			var videocodecSelect 					= document.getElementById("videocodec");		
			tempParam["videocodec"]				= videocodecSelect.value;
			tempParam["videocodeccombo"]	= 0;
			tempParam["videocodecres"]		= 0;
		}
		createCodecSelect(tempParam);
		displayParamSet(tempParam);		
	}catch (e) {}	
}
