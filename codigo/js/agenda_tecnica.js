function buscar_agenda(){

   var nm_div       = "tabela_agendamento";
   var ajax         = new AJAX(); 
   var url          = "";  
   var idfun        = document.getElementById('idfun').value;
   var dt_sada_inic = document.getElementById('dt_sada_inic').value;
   var dt_sada_term = document.getElementById('dt_sada_term').value;
   
   url  = "agenda_tecnica.dados.php?situacao=buscar&idfun="+idfun+"&dt_sada_inic="+dt_sada_inic+"&dt_sada_term="+dt_sada_term;				
   ajax.Updater(url,nm_div,"get","Buscando ...");	
	// document.getElementById('div_outros').style.display = "none";
}

function salvar_agenda(idser){
  var xmlhttp = new getXmlHttp();	
  var url     = "";  	
  var dt_sada = document.getElementById('serv_data_'+idser).value;
  var hr_sada = document.getElementById('serv_hora_'+idser).value;
  var total   = document.getElementById('hr_serv_'+idser).options.length;
  var hr_serv = '00:00'; 
  var x       = 0;
  var nm_div  = "tabela_agendamento";
  
  for (x=0; x<total; x++) { 
	if( document.getElementById( 'hr_serv_'+idser ).options[x].selected == true ){
		hr_serv = document.getElementById('hr_serv_'+idser).options[x].value;
	}
  }

  url  = "agenda_tecnica.dados.php?situacao=atualizar&dt_sada="+dt_sada+"&hr_sada="+hr_sada+"&hr_serv="+hr_serv+"&idser="+idser;			        
   
  // if( ajax.Updater(url,nm_div,"get","Gravando....") ) alert('A agenda foi atualizada com sucesso !');
  // alert(url);
  
  xmlhttp.open("GET",url,true);	  
  xmlhttp.onreadystatechange = function() {				
	if(xmlhttp.readyState == 4){
	   if (xmlhttp.responseText != ''){
		  alert(xmlhttp.responseText);   
		  document.getElementById('btn_salvar_'+idser).disabled="disabled";
	   }
	}
  }
  xmlhttp.send(null);
}

function operacao( tipo ){
  var total   = document.getElementById('idfun').options.length;	
  var idfun   = 0;
  
  if( tipo == 'i' ){	    
	  // gerando o PDF  
	  for (x=0; x<total; x++) { 
		if( document.getElementById( 'idfun').options[x].selected == true ){
			idfun = document.getElementById('idfun').options[x].value;
		}
	  }
	  
	  document.getElementById('frm').action = 'agenda_tecnica.pdf.php?dt_sada_inic='+document.getElementById('dt_sada_inic').value+'&dt_sada_term='+document.getElementById('dt_sada_term').value+"&idfun="+idfun;		   
	  document.getElementById('frm').target = '_blank';
	  document.getElementById('frm').submit();
  }
}

function ativar_botao(idser){
  	document.getElementById('btn_salvar_'+idser).disabled="";
}