var vw:NotesView = database.getView("vwCustomTable");
	if(null!=vw){
		json = "";	
		var ec:NotesViewEntryCollection = vw.getAllEntries();
		var colsName:java.util.Vector = vw.getColumns();
		if(ec.getCount()>0){
			var entry:NotesViewEntry = ec.getFirstEntry();
			while(null!=entry){
				json += '{"@unid":"'+entry.getDocument().getUniversalID() + '","';
				json += '"@position:"' + entry.getPosition(".") + '","';
				for(var i=0;i<colsName.size();i++){
					json += '"' + colsName.get(i) + '":"' + entry.getColumnValues().get(i) + '",';	
				}
				json += '"},'
				
				tmpentry = ec.getNextEntry(entry)
				entry.recycle();
				entry = tmpentry;
			}
		}
		json  = "[" + @Left(json, @Length(json) - 1) + "]";	
	}
	
var exCon:javax.faces.context.ExternalContext = facesContext.getExternalContext();
	var response:com.ibm.xsp.webapp.XspHttpServletResponse = exCon.getResponse();

	
	var request:com.sun.faces.context.MyHttpServletRequestWrapper = exCon.getRequest();
	var map:java.util.Map = request.getParameterMap();
	var it:java.util.Iterator = map.entrySet().iterator();
	while(it.hasNext()){
		var entry:Map.Entry = it.next();
		print(entry.getKey());
		print(etnry.getValue());
	}
	
	var doc:NotesDocument = database.createDocument();
	doc.replaceItemValue("form","fmCustom");
	doc.replaceItemValue(entry.getKey().replace("$","M_"),entry.getValue());
	doc.computeWithForm();
	doc.save(true,false);