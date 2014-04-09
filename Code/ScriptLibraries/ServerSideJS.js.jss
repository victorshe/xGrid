function getXNamesDb(){
//	var dbAdmin:NotesDatabase = session.getDatabase("","XAdmin.nsf");
//	var vwDbPath:NotesView = dbAdmin.getView("vwDbPath");
//	var vecKey:java.util.Vector = @DbLookup(new Array("","XAdmin.nsf"),"vwDbPath","nameDb",2)
//	var arrKey = vecKey.split("~")
	var dbNames:NotesDatabase = session.getDatabase("","names.nsf");
	return dbNames;
}

function getUserbh(strCommonName){
	try{
		if(strCommonName){
			var docPeople:NotesDocument = getUserPersonDoc(strCommonName);
		}else{
			var docPeople:NotesDocument = getUserPersonDoc();
		}
		
		var strbh = docPeople.getItemValueString("F_EmployeeID");
		return strbh;
	}catch(e){
		return 100000;
	}
}

function getUserPersonDoc(strCommonName){
	try{
		if(strCommonName){
			var strName = @Name("[Abbreviate]" ,strCommonName);
		}else{
			var strName = @Name("[Abbreviate]" ,context.getUser().getCommonName());
		}
		
		//var dbName = session.getDatabase("","names.nsf");
		var dbName:NotesDateabase = getXNamesDb();
		var vwName = dbName.getView("($VIMPeople)");
		var docPeople:NotesDocument = vwName.getDocumentByKey(strName);
		return docPeople;
	}catch(e){
		return null;
	}
}

function getUserMgrDeptName(strCommonName){
	try{
		if(strCommonName){
			var vecTitles:java.util.Vector = getUserTitles(strCommonName);
		}else{
			var vecTitles:java.util.Vector = getUserTitles();
		}
		
		if(vecTitles){
			var vecDefined:java.util.Vector = getHRKeywords("Titles");
			var vecDept:java.util.Vector = new java.util.Vector();
			for (strTitle in vecTitles){
				for (strDefined in vecDefined){
					if (strTitle.contains(vecDefined[strDefined])){
						vecDept.add(strTitle.slice(0,strTitle.indexOf("_")));
					}
				}
			}
			return getDeptNumByDeptName(vecDept);
		}else{
			return null;
		}
			
	}catch(e){
		print(e);
	}
}

function getUserMgrDeptNum(strCommonName){
	try{
		if(strCommonName){
			var vecDept = getUserMgrDeptName(strCommonName);
		}else{
			var vecDept = getUserMgrDeptName();
		}
		
		if(vecDept){
			return getDeptNumByDeptName(vecDept);
		}else{
			return null;
		}
	}catch(e){
		print(e);
	}
	
}

function getDeptNumByDeptName(vecDept){
	try{
		var vecDepts:java.util.Vector = new java.util.Vector();
		
		for(strDept in vecDept){
			vecDepts.add(expandDeptName(strDept).toString().replace("[","").replace("]",""));
		}
		
		var strDepts:string = vecDepts.toString();
		strDepts = strDepts.replace("[","");
		strDepts = strDepts.replace("]","");
		strDepts = strDepts.trim();
		var arrDepts = @Explode(strDepts,",");
		arrDepts = @Unique(@Trim(arrDepts));
		vecDepts.clear();
		if(isArray(arrDepts)){
			for(var i=0;i<arrDepts.length;i++){
				if(arrDepts[i]){
					vecDepts.add(arrDepts[i]);
				}	
			}
		}else{
			vecDepts.add(arrDepts);
		}
		
		//var vecDeptNum = @ReplaceSubstring(vecDepts,["管理部","人力资源课"],["03","07"])
		return vecDepts; 
	}catch(e){
		print(e);
	}
}

function expandDeptName(strDept){
	try{
		var vwName:NotesView = getUnitViewByParent();
		var expandDept:java.util.Vector = new java.util.Vector();
		
	
		var dcDept:NotesDocumentCollection = vwName.getAllDocumentsByKey(strDept);
		var docDept:NotesDocument = dcDept.getFirstDocument();
		expandDept.add(strDept);
		while (docDept!=null){
			var strDeptName = docDept.getItemValueString("F_DisName");
			expandDept.add(strDeptName);
			expandDept.add(expandDeptName(strDeptName));
			docDept = dcDept.getNextDocument(docDept);
			
		}
		//print(strDept);
		//print(expandDept);
		return expandDept;
	}catch(e){
		print(e);
	}
	
}

function getUnitViewByParent(){
	try{
		var dbName = getXNamesDb();
		var vwName:NotesView = dbName.getView("LKS_SearchUnitByParent");
		return vwName;
	}catch(e){
		print(e);
	}
	
}

function ifHasChildDept(strDeptName){
	var bFlag = true;
	var vwName:NotesView = getUnitViewByParent();
	var dcNames:NotesDocumentCollection = vwName.getAllDocumentsByKey(strDeptName);
	if (!dcNames.getCount){
		bFlag = false;
	}
}

function getUserTitles(strCommonName){
	try{
		if(strCommonName){
			var docPeople:NotesDocument = getUserPersonDoc(strCommonName);
		}else{
			var docPeople:NotesDocument = getUserPersonDoc();
		}
		var vecTitles = docPeople.getItemValue("F_POSTS");
		if (vecTitles){
			return vecTitles;
		}else{
			return null;
		}
		
	}catch(e){
		print(e);
	}
}


function getHRKeywords(strKey){
	var profile:NotesDocument = database.getProfileDocument("profile","");
	if (profile){
		var strAdminDbPath = profile.getItemValueString("AdminDbPath");
		var strAdminServer = profile.getItemValueString("AdminDbServer");
		var strInfo = strAdminServer+ "~" + strAdminDbPath;
	
		if (strInfo) {
			var arrInfo = strInfo.split("~");
			var vecPath:java.util.Vector = @DbLookup(arrInfo, "keywordsLookup", strKey, 2);
			return vecPath;
		}
	}else{
		return "错误！找不到简要文档。"
	}
}

function getOtherDbPath(strKey){
	//var profile:NotesDocument = database.getProfileDocument("profile","");
	//if (profile){
	//	var strAdminDbPath = profile.getItemValueString("AdminDbPath");
	//	var strAdminServer = profile.getItemValueString("AdminDbServer");
	//	var strInfo = strAdminServer+ "~" + strAdminDbPath;
		
		var strInfo = "~XAdmin.nsf";
		if (strInfo) {
			var arrInfo = strInfo.split("~");
			var vecPath:java.util.Vector = @DbLookup(arrInfo, "vwDbPath", strKey, 2);
			return vecPath;
		}
	//}else{
	//	return "错误！找不到简要文档。"
	//}
}

function addHistory(strFieldName, strAction){
	//修改记录
	var strCommonName = currentDocument.getItemValueString("P_UserCN");
	var dtNow:NotesDateTime = session.createDateTime("Today");
	dtNow.setNow();
	var strNow = dtNow.getLocalTime();
	//var strHistory = strCommonName + "，" + strAction + "：" + strNow + "。";
	var strHistory = strNow+":"+strCommonName + "，" + strAction
	var strOrgHistory:java.util.Vector = currentDocument.getItemValue(strFieldName);
	if(strOrgHistory.get(0)){
		strOrgHistory.add(strHistory);
	}else{
		strOrgHistory.set(0, strHistory);
	}
	
	currentDocument.replaceItemValue(strFieldName, strOrgHistory);
}

function addJumpHistory(strFieldName){
	var dtNow:NotesDateTime = session.createDateTime("Today");
	dtNow.setNow();
	var strNow = dtNow.getLocalTime();
	var strHistory = strNow+":因为下一节点审批人和当前节点审批人为同一人，跳过一下节点。"
	var strOrgHistory:java.util.Vector = currentDocument.getItemValue(strFieldName);
	if(strOrgHistory.get(0)){
		strOrgHistory.add(strHistory);
	}else{
		strOrgHistory.set(0, strHistory);
	}
	
	currentDocument.replaceItemValue(strFieldName, strOrgHistory);
}

function getWKShiftDb(){
	try{
		var vecPath:java.util.Vector = getOtherDbPath("WorkShift");	
		var arrPath = vecPath.split("~");
		var dbWKShift:NotesDatabase = session.getDatabase(arrPath[0],arrPath[1]);
		return dbWKShift;
	}catch(e){
		print(e);
		return false;
	}
}

function getUserWKShift(strCommonName){
	try{
		var docPerson:NotesDocument = getUserPersonDoc(strCommonName);
		var strWKShift:String = docPerson.getItemValueString("Z_WorkShift");
		return strWKShift;	
	}catch(e){
		print(e);
	}
}

function getWKShiftDoc(strWKShift){
	try{
		var dbWKShift:NotesDatabase = getWKShiftDb();
		var vwWKShift:NotesView = dbWKShift.getView("keywordsLookup");
		var docWKShift:NotesDocument = vwWKShift.getDocumentByKey(strWKShift);
		return docWKShift;
	}catch(e){
		print(e);
	}
}

function getHolidayDb(){
	try{
		var vecPath:java.util.Vector = getOtherDbPath("Holiday");	
		var arrPath = vecPath.split("~");
		var dbHoliday:NotesDatabase = session.getDatabase(arrPath[0],arrPath[1]);
		return dbHoliday;
	}catch(e){
		print(e);
		return false;
	}
}

function getSQLDb(){
	try{
	//	var vecPath:java.util.Vector = getOtherDbPath("SQLAgent");	
	//	var arrPath = vecPath.split("~");
	//	var dbSQL:NotesDatabase = session.getDatabase(arrPath[0],arrPath[1])
		var dbSQL:NotesDatabase = session.getDatabase("","AFB/DominoSQL.nsf");;
		return dbSQL;
	}catch(e){
		print(e);
		return false;
	}
}

function bIsHoliday(dtDate){
	try{
		var vwHoliday:NotesView = dbPHoliday.getView("vwAllHolidaysByDate");
		var docHoliday:NotesDocument = vwHoliday.getDocumentByKey(dtDate.getDateOnly());
		if(docHoliday){
			return true;
		}else{
			return false;
		}
	}catch(e){
		print(e);
	}
}

function getHolidayDays(dtStartDate,dtEndDate){
	try{
		var intMaxLoop = 0;
		var intDays = 0;
		while(dtStartDate.timeDifference(dtEndDate)<=0&intMaxLoop<5000){
			if(bIsHoliday(dtStartDate)){
				intDays = intDays + 1;
			}
			intMaxLoop = intMaxLoop + 1;
			dtStartDate.adjustDay(1);
		}
		return intDays;
	}catch(e){
		print(e);
	}
}

function isArray(obj) {  
	return (typeof obj=='object')&&obj.constructor==Array;    
}

function isString(str){
	return (typeof str=='string')&&str.constructor==String;
} 

function sendTodo(vUserList,intType){
	try{
		var dbTodo:NotesDatabase = session.getDatabase("192.168.15.204", "lks/sys/lks_tasks.nsf");
		
		if(!dbTodo.isOpen()){
			return false;
		}
		
		var strApplyCN = currentDocument.getItemValueString("ApplyNameCN");
		var strTopic = currentDocument.getItemValueString("Topic");
		var strSourceUNID = currentDocument.getItemValueString("P_UNID");
		
		var docTodo:NotesDocument = dbTodo.createDocument();
		docTodo.replaceItemValue("Form","FM_TaskDoc");
		
		docTodo.computeWithForm(false, false);
		
		if(!intType){
			var intDocType = 4;
			
		}else{
			var intDocType = intType;
		}
		
		switch(intDocType){
			case 1:
				var strAction = "请处理";
				var strSubject = strAction + strApplyCN + "提交的“" + strTopic +"”文档。"
				break;
			case 4:
				var strAction = "请查阅";
				var strSubject = strAction + strApplyCN + "提交的“" + strTopic +"”文档。"
				break;
			case 11:
				var strSubject = "流程文档被撤回。主题：“"+ strTopic+"”";
				var intDocType = 4;
				break;
			case 12:
				var strSubject = "流程文档被驳回。主题：“"+ strTopic+"”";
				var intDocType = 1;
				break;
			case 13:
				var strSubject = "流程文档被废弃。主题：“"+ strTopic+"”";
				var intDocType = 4;
				break;
			case 14:
				var strAction = "请处理";
				var strSubject = "转办：" + strAction + strApplyCN + "提交的“" + strTopic +"”文档。"
				var intDocType = 1;
				break;
			case 100:
				var strSubject = "流程文档通过审批。主题：" + strTopic +"”"
				var intDocType = 4;
				break;
			default:
				var strAction = "请查阅";
				var strSubject = strAction + strApplyCN + "提交的“" + strTopic +"”文档。"
		}
		
		docTodo.replaceItemValue("F_DocType",intDocType);
		docTodo.replaceItemValue("F_Show",1);
		docTodo.replaceItemValue("F_FLAG","PDA");
		docTodo.replaceItemValue("F_From","流程管理员");
		docTodo.replaceItemValue("F_MAINDOCID", docTodo.getItemValueString("SYSF_OriginalId"));
		//docTodo.replaceItemValue("F_DbTitle","审批流程V5.0");
		docTodo.replaceItemValue("F_OTHERSERVER","");
		docTodo.replaceItemValue("F_SOURCEDB","");
		docTodo.replaceItemValue("F_SOURCEDOC","");
		docTodo.replaceItemValue("$WebFlags","J");
		docTodo.replaceItemValue("F_CREATETIME",@Text(@Now()));
		docTodo.replaceItemValue("F_Readers_0",vUserList);
		docTodo.replaceItemValue("F_Admin","[Admin]");
		
		var itemReader:NotesItem = docTodo.getFirstItem("F_Readers_0");
		if(!itemReader.isReaders()){
			itemReader.setReaders(true);
		}
		var itemAdmin:NotesItem = docTodo.getFirstItem("F_Admin");
		
		if(!itemAdmin.isReaders()){
			itemAdmin.setReaders(true);
		}
		
		docTodo.replaceItemValue("Subject", strSubject);
		var strURL = context.getUrl().toString();
		
		if(strURL.indexOf("newDocument")>0){
			var strURL = strURL.slice(0, strURL.indexOf("?")) + "?documentId=" + strSourceUNID + "&action=editDocument";
		}
		
		docTodo.replaceItemValue("F_URL",strURL);
		
		docTodo.save(false,false);
		
		currentDocument.replaceItemValue("TodoDocId",docTodo.getItemValueString("SYSF_OriginalId"));
	}catch(e){
		print(e);
	}
}

function sendTodo2(vUserList,intType){
	try{
		var dbTodo:NotesDatabase = session.getDatabase("192.168.15.204", "lks/sys/lks_tasks.nsf");
		
		if(!dbTodo.isOpen()){
			return false;
		}
		
		var docTodo:NotesDocument = dbTodo.createDocument();
		docTodo.replaceItemValue("Form","FM_TaskDoc");
		
		docTodo.computeWithForm(false, false);
		
		if(!intType){
			var intDocType = 4;
			
		}else{
			var intDocType = intType;
		}
		
		docTodo.replaceItemValue("F_DocType",intDocType);
		docTodo.replaceItemValue("F_Show",1);
		docTodo.replaceItemValue("F_FLAG","PDA");
		docTodo.replaceItemValue("F_From","流程管理员");
		docTodo.replaceItemValue("F_MAINDOCID", docTodo.getItemValueString("SYSF_OriginalId"));
		docTodo.replaceItemValue("F_OTHERSERVER","");
		docTodo.replaceItemValue("F_SOURCEDB","");
		docTodo.replaceItemValue("F_SOURCEDOC","");
		docTodo.replaceItemValue("$WebFlags","J");
		docTodo.replaceItemValue("F_CREATETIME",@Text(@Now()));
		docTodo.replaceItemValue("F_Readers_0",vUserList);
		docTodo.replaceItemValue("F_Admin","[Admin]");
		
		var itemReader:NotesItem = docTodo.getFirstItem("F_Readers_0");
		if(!itemReader.isReaders()){
			itemReader.setReaders(true);
		}
		var itemAdmin:NotesItem = docTodo.getFirstItem("F_Admin");
		
		if(!itemAdmin.isReaders()){
			itemAdmin.setReaders(true);
		}
		
		var URL = context.getUrl();
		docTodo.replaceItemValue("Subject", "您"+URL.getParameter("rq")+"当天考勤异常，请处理考勤异常。");
		var strURL = context.getUrl().toString();
		
		docTodo.replaceItemValue("F_URL",strURL);
		
		docTodo.save(false,false);
		
	}catch(e){
		print(e);
	}
}

function cancelTodo(){
	try{
		var strDocId = currentDocument.getItemValueString("TodoDocId");
		
		if(!strDocId){
			//print("No Id");
			return false;
		}
		
		var dbTodo:NotesDatabase = sessionAsSignerWithFullAccess.getDatabase("192.168.15.204", "lks/sys/lks_tasks.nsf");
		
		if(!dbTodo.isOpen()){
			//print("No open");
			return false;
		}
		
		var docTodo:NotesDocument = dbTodo.getDocumentByUNID(strDocId);
		var strCurName = currentDocument.getItemValueString("P_User");
		if(docTodo){
			var vReaders:java.util.Vector = docTodo.getItemValue("F_Readers_0");
			vReaders.remove(strCurName);
			docTodo.replaceItemValue("F_Readers_0", vReaders);
			docTodo.save(false,false);
		}else{
			//print("No doc");
		}
		
	}catch(e){
		print(e);
	}	
}

function setPageHistory() {	// remember the current page name and title for the "back to XZY" link
//---------------------
	sessionScope.historyPageName	= view.getPageName();	
} 
