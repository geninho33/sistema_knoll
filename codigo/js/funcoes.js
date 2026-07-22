 // JavaScript Document
function navegar_registro(tipo, registro ){
					
	var xmlhttp = new getXmlHttp();
	var x = 0;
	var total = document.frm.in_status.options.length; 
	var idcli = 0;
	var cd_eqpm = 0;
		
	if(document.getElementById('idser').innerHTM !='' || tipo == 'p' ){
		
		// determinando o tipo de busca
		if( tipo != 'Buscar' ) url = "servico.dados.php?codigo="+document.getElementById('idser').innerHTML+"&navegar="+tipo;
		else url = "servico.dados.php?codigo="+registro+"&navegar="+tipo;
		
        // alert(url);		
		xmlhttp.open("GET", url, true);
		xmlhttp.onreadystatechange=function() {
		
			if(xmlhttp.readyState == 4){
				if (xmlhttp.responseText != ''){				
				
					// alert(document.getElementById('idser').innerHTML);
					string = xmlhttp.responseText.split( "|" );
					document.getElementById('idser').innerHTML   = string[0];
					document.getElementById('nu_serv').value     = string[0];
					document.getElementById('dt_entr').value     = string[2];				
					document.getElementById('dt_sada').value     = string[3];								
					document.getElementById('hr_sada').value     = string[15];								
					document.getElementById('codigo').value      = string[1];
					document.getElementById('editContato').value = string[8];
					document.getElementById('val_ser').value     = string[16];								
					document.getElementById('val_pro').value     = string[4];
					document.getElementById('val_tot').value     = string[5];
  				    document.getElementById('servico').value     = string[13];	
					document.getElementById('ds_deft').value     = string[12];				
  				    document.getElementById('servico').innerHTML = string[13];	
					document.getElementById('val_des').value     = string[23];									
					// alert(string[12]);
					// ajustando a combo do estatus do servico
					
					document.frm.in_status.disabled = false;
				    // document.getElementById('btn_incluir_produto').disabled = false;
  					// document.getElementById('btn_incluir_itens').disabled   = false;

					for (x=0; x<total; x++) { 
					  if( document.frm.in_status.options[x].value == string[21] ){
						   document.frm.in_status.options[x].selected=true;
						   if( string[21] == 'Encerrado' &&
						       document.getElementById('usuario').value !='bsgrott' &&
							   document.getElementById('usuario').value !='ana'){
							   document.frm.in_status.disabled=true;
							   // document.getElementById('btn_incluir_produto').disabled = true;
  							   // document.getElementById('btn_incluir_itens').disabled   = true;
						   }
					  }
					}
					
					// ajustando a combo da garantia dos serviço
					total = document.frm.ds_situa.options.length;   
					for (x=0; x<total; x++) { 
					  if( document.frm.ds_situa.options[x].value == string[11] ) document.frm.ds_situa.options[x].selected=true;
					}

					// ajustando a combo da forma de pagamento
					total = document.frm.idpag.options.length;   
					for (x=0; x<total; x++) { 
					  if( document.frm.idpag.options[x].value == string[6] ) document.frm.idpag.options[x].selected=true;
					}
					
					// ajustando a combo de funcionario
					total = document.frm.idfun.options.length; 
					for (x=0; x<total; x++) { 
					  if( document.frm.idfun.options[x].value == string[7] ) document.frm.idfun.options[x].selected=true;
					}
					
					// ajustando a combo de hora e servico
					total = document.frm.hr_serv.options.length; 
					for (x=0; x<total; x++) { 
					  if( document.frm.hr_serv.options[x].value == string[24] ) document.frm.hr_serv.options[x].selected=true;
					}

					idcli   = string[1];							
					idser   = string[0];
					cd_eqpm	= string[17];
					limpa_campo('item');
					limpa_campo('produto');
					buscar_cliente(idcli);					
					// buscar_produto(cd_eqpm);
					buscar_itens('A',idser);
					buscar_itens_produto('A',idser);
					// combo_produto_cliente(idcli);
					
					//document.getElementById('codigo').value = string[0];
				}else{
					if( tipo == 'u' || tipo == 'f' ) alert('Este é o último registro !');
					if( tipo == 'a' || tipo == 'p' ) alert('Este é o primiero registro !');
				}
			}
	
		 }
		 xmlhttp.send(null);   
	}
}

function buscar_cliente(codigo){
					
	var xmlhttp_c = new getXmlHttp();
	var tipo  = '';

	url = "servico.dados.php?codigo="+codigo+"&navegar="+tipo;
	xmlhttp_c.open("GET", url, true);
	xmlhttp_c.onreadystatechange=function() {
	
		if(xmlhttp_c.readyState == 4){
			if (xmlhttp_c.responseText != ''){				
				// alert(document.getElementById('idser').innerHTML);
				string = xmlhttp_c.responseText.split( "|" );
				if( string[0] != null && string[0] != undefined && string[0] != '' ){
					document.getElementById('editNome').value      = string[0];
					document.getElementById('editEmail').value     = string[1];				
					document.getElementById('editEndereco').value  = string[2];								
					document.getElementById('editProximo').value   = string[3];								
					document.getElementById('editBairro').value    = string[4];
					document.getElementById('editMunicipio').value = string[5];
					document.getElementById('editCEP').value       = string[7];								
					document.getElementById('editFone').value      = string[8];
					document.getElementById('editCelular').value   = string[9];
					document.getElementById('editFAX').value       = string[10];
					document.getElementById('editCPF').value       = string[11];
					
			    }else limpa_campo('cliente');
				//document.getElementById('codigo').value = string[0];
			}else alert('Cliente não foi encontrado !');
		}
	 }
	 xmlhttp_c.send(null);   
}

function buscar_produto(codigo){
	var xmlhttp_c = new getXmlHttp();
	var tipo  = 'pc';	
	url = "servico.dados.php?codigo="+codigo+"&navegar="+tipo+"&idser="+document.getElementById('idser').innerHTML;
	xmlhttp_c.open("GET", url, true);
	xmlhttp_c.onreadystatechange=function() {
	if(xmlhttp_c.readyState == 4){
		if (xmlhttp_c.responseText != ''){				
			string = xmlhttp_c.responseText.split( "|" );
			if( string[1] != null && string[1] != undefined && string[1] != '' ){
			  document.getElementById('cd_eqpm').value  = string[0];	
			  document.getElementById('edDesc').value   = string[1];
			  document.getElementById('edMod').value    = string[3];				
			  document.getElementById('edData').value   = string[8];								
			  document.getElementById('edSerie').value  = string[4];								
			  document.getElementById('edLoja').value   = string[9];
			  document.getElementById('edNota').value   = string[6];			  
			  // document.getElementById('defeito').innerHTML = string[10];											
			}
			else limpa_campo('produto');
			//document.getElementById('codigo').value = string[0];
		}else alert('produto não foi encontrado !');
	  
	  }
	  
	 }
	 xmlhttp_c.send(null);
}

function combo_produto_cliente(codigo){
					
	var xmlhttp_pc = new getXmlHttp();
	var tipo    = 'pc';
	var x       = 0;
	var total   = document.frm.edDesc.options.length;   
	
	url = "servico.dados.php?codigo="+codigo+"&navegar="+tipo;
	xmlhttp_pc.open("GET", url, true);
	xmlhttp_pc.onreadystatechange=function() {	    
		if(xmlhttp_pc.readyState == 4){
			if (xmlhttp_pc.responseText != ''){				
				// alert(document.getElementById('idser').innerHTML);
				// document.getElementById('editNome').value  = string[0];				
				string = xmlhttp_pc.responseText.split( "|" );
				for (x=0; x<total; x++) document.frm.edDesc.remove(x);
				
				total = ( string[0] );								
				
				alert(total);
			    for (x=1; x<=total; x=x+2) document.frm.edDesc.options[(x-1)] = new Option(string[(x+1)], string[x] );				
			    
		    }
	    }
	}
	 xmlhttp_pc.send(null);   
}

function busca(tabela){
  var ds_parm = '';	
  var cd_usrs = document.getElementById('cd_usrs').value; 
  var idcli   = document.getElementById('codigo').value;
	 
  if( tabela == 'produto' )  ds_parm ="procura.list.php?tabela="+tabela+"&idcli="+idcli+"&pesquisa=1&cd_usrs="+cd_usrs;
  else ds_parm ="procura.list.php?tabela="+tabela+"&cd_usrs="+cd_usrs;

  if( tabela == 'produto' && 
      document.getElementById('codigo').value == '' ) {	  
	  alert('É necessário Informar o cliente !');
	  document.getElementById('codigo').focus();	   
  }else if( document.getElementById('acao').value != 'i' && tabela == 'cliente' ) alert("O cliente não pode mais ser alterado !");
  else window.open(ds_parm,"Procura","directories=0,location=0,menubar=0,resizable=1,scrollbars=1,status=0,toolbar=0,left=5,top=5,width=950,height=400");
  
}

function buscar_produto_itens(codigo){
	var xmlhttp_pi = new getXmlHttp();
	var tipo  = 'itens_produto';
	if( codigo != 0 || codigo !='' ){
		url = "servico.dados.php?codigo="+codigo+"&navegar="+tipo;
		xmlhttp_pi.open("GET", url, true);
		
		xmlhttp_pi.onreadystatechange=function() {
		
			if(xmlhttp_pi.readyState == 4){
				if (xmlhttp_pi.responseText != ''){				
					// alert(document.getElementById('idser').innerHTML);				
					string = xmlhttp_pi.responseText.split( "|" );
	
					if( string[1] != null && string[1] != undefined && string[1] != '' ){
						document.getElementById('edser').value       = string[0];
						document.getElementById('ds_produto').value  = string[1];				
						document.getElementById('ds_unidade').value  = string[2];								
						document.getElementById('edqtde').value      = 1;								
						document.getElementById('vl_unitario').value = string[3];
						document.getElementById('vl_total').value    = string[3];				  
					}else{
						alert('produto não foi encontrado !');
						limpa_campo('item');
						document.getElementById('edser').focus();
					}
					//document.getElementById('codigo').value = string[0];
				}else{
					alert('produto não foi encontrado !');
					limpa_campo('item');
					document.getElementById('edser').focus();
				}
			
			}
	
		 }
		 xmlhttp_pi.send(null);
	}else limpa_campo('item');
}

function limpa_campo(tipo){

  if( tipo == 'item' || tipo == ''  ){
	  document.getElementById('edser').value       = '';
	  document.getElementById('ds_produto').value  = '';				
	  document.getElementById('ds_unidade').value  = '';								
	  document.getElementById('edqtde').value      = '';								
	  document.getElementById('vl_unitario').value = '';
	  document.getElementById('vl_total').value    = '';				  
  }	
  
  if( tipo == 'produto' || tipo == ''  ){
	   //document.getElementById('idpro').value       = '';
	  document.getElementById('edDesc').value      = '';
	  document.getElementById('edMod').value       = '';				
	  document.getElementById('edData').value      = '';								
	  document.getElementById('edSerie').value     = '';								
	  document.getElementById('edLoja').value      = '';
	  document.getElementById('edNota').value      = '';	  
	  document.getElementById('defeito').value     = '';											
  }

  if( tipo == 'cliente' || tipo == ''  ){
	  document.getElementById('editNome').value       = '';
	  document.getElementById('editEmail').value      = '';
	  document.getElementById('editProximo').value    = '';
	  document.getElementById('editEndereco').value   = '';
	  document.getElementById('editBairro').value     = '';
	  document.getElementById('editMunicipio').value  = '';
	  document.getElementById('editCEP').value        = '';
	  document.getElementById('editFone').value       = '';
	  document.getElementById('editCelular').value    = '';
	  document.getElementById('codigo').value         = '';
	  document.getElementById('editContato').value    = '';	  
	  document.getElementById('editFAX').value        = '';	  
	  document.getElementById('editCPF').value        = '';	  	  	  
  }
  
  if( tipo == 'abertura' || tipo == ''  ){  
	  document.getElementById('idser').innerHTML   = '';
	  document.getElementById('dt_entr').value     = '';
	  document.getElementById('dt_sada').value     = '';
	  document.getElementById('hr_sada').value     = '';
	  document.getElementById('val_ser').value     = '';
	  document.getElementById('val_des').value     = '';	  
	  document.getElementById('val_pro').value     = '';
	  document.getElementById('val_tot').value     = '';
	  document.getElementById('servico').value     = '';
	  document.getElementById('ds_deft').value     = '';	  	  
  }

}
function buscar_itens(tp_oprc,codigo){

   var nm_div      = "tabela_itens";
   var ajax        = new AJAX(); 
   var ajax2       = new AJAX();    
   var tipo        = 'itens';
   var param       = "";
   var qtde        = document.getElementById('edqtde').value.replace(',','.');
   var vl_unitario = document.getElementById('vl_unitario').value.replace(',','.');
   var vl_total    = document.getElementById('vl_total').value.replace(',','.');
   var edser       = document.getElementById('edser').value;
   var ds_produto  = document.getElementById('ds_produto').value;
   var ds_unidade  = document.getElementById('ds_unidade').value;
   var nu_serv     = document.getElementById('nu_serv').value;
   var in_status   = document.getElementById('in_status').value;    
   var url = "";  

   if (tp_oprc == 'S'){
        if ( confirm("Tem certeza que deseja salvar este Item ?") ){
            tipo = "insert_item";		
            url  = "servico.dados.php?navegar="+tipo+"&codigo="+edser+"&descricao="+ds_produto+"&unidade="+ds_unidade+"&qtde="+qtde+"&vl_unitario="+vl_unitario+"&vl_total="+vl_total+"&idser="+nu_serv+"&in_status="+in_status; 
           ajax.Updater(url,nm_div,"get","Gravando ...");	
		   buscar_totais(nu_serv);
		   limpa_campo('item');
		   document.getElementById('edser').focus();
	    }	
   }else if(tp_oprc == 'E'){
	     if (confirm("Tem certeza que deseja excluir este item ?")){     
            tipo = 'excluir_item';				
			param  = "servico.dados.php?dados="+nu_serv+"_"+codigo+"&navegar="+tipo+"&in_status="+in_status;	
			// alert(param);			 
		    ajax.Updater(param,nm_div,"get","Aguarde ...");			
		    buscar_totais(nu_serv);
	     } 			
	}else{
 	   param  = "servico.dados.php?codigo="+codigo+"&navegar="+tipo+"&in_status="+in_status;
	   ajax2.Updater(param,nm_div,"get","Aguarde ...");	
	}

	// document.getElementById('div_outros').style.display = "none";

}

function buscar_itens_produto(tp_oprc,codigo){

   var nm_div      = "tabela_produto";
   var ajax        = new AJAX(); 
   var ajax2       = new AJAX();    
   var tipo        = 'produtos';
   var param       = "";
   
   var edDesc      = document.getElementById('edDesc').value;
   var cd_eqpm     = document.getElementById('cd_eqpm').value;
   var edMod       = document.getElementById('edMod').value;
   var edLoja      = document.getElementById('edLoja').value;
   var edData      = document.getElementById('edData').value;
   var edSerie     = document.getElementById('edSerie').value;
   var defeito     = document.getElementById('defeito').value;
   var idcli       = document.getElementById('codigo').value;   
   var nu_serv     = document.getElementById('nu_serv').value;
   var edNota      = document.getElementById('edNota').value; 
   var in_status   = document.getElementById('in_status').value; 
   var url = "";  
   
   if(idcli == '') idcli = 0;
   
   if (tp_oprc == 'S'){	   
	    if( edDesc == '' ){
		   alert('Informe a descricao do produto !');
		   return false;
	    }	   
	    if( defeito == '' ){
		   alert('Informe o defeito apresentado pelo produto !');
		   return false;
	    }	   
        if ( confirm("Tem certeza que deseja salvar este produto ?") ){
            tipo = "insert_produto";			
            url  = "servico.dados.php?navegar="+tipo+"&edDesc="+edDesc+"&defeito="+defeito+"&cd_eqpm="+cd_eqpm+"&edMod="+edMod+"&edLoja="+edLoja+"&edData="+edData+"&idser="+nu_serv+"&edSerie="+edSerie+"&idcli="+idcli+"&edNota="+edNota+"&in_status="+in_status;			
		   // alert(url);	
           ajax.Updater(url,nm_div,"get","Gravando ...");	
		   limpa_campo('produto');
		   document.getElementById('edser').focus();
	    }	
   }else if(tp_oprc == 'E'){
	     if (confirm("Tem certeza que deseja excluir este produto ?")){     
            tipo = 'excluir_produto';				
			param  = "servico.dados.php?idser="+nu_serv+"&cd_eqpm="+codigo+"&navegar="+tipo+"&in_status="+in_status;	
			limpa_campo('produto');	 
		    ajax.Updater(param,nm_div,"get","Aguarde ...");
	     } 			
	}else{
	   limpa_campo('produto');	
 	   param  = "servico.dados.php?codigo="+codigo+"&navegar="+tipo+"&in_status="+in_status;
	   ajax2.Updater(param,nm_div,"get","Aguarde ...");	
	}

	// document.getElementById('div_outros').style.display = "none";

}

function atualizar_valores(evento){
  var qtde = 0;	
  var vl_unitario =0;
  
   if( document.getElementById('vl_unitario').value !='' && document.getElementById('edqtde').value !='' ){
	   vl_unitario = document.getElementById('vl_unitario').value.replace('.',''); 
       vl_unitario = vl_unitario.replace(',','.'); 
	   qtde        = document.getElementById('edqtde').value.replace(',','.');
	   document.getElementById('vl_total').value = roundNumber( vl_unitario*qtde );
	   document.getElementById('vl_total').value = document.getElementById('vl_total').value.replace('.',',');
	   document.getElementById('vl_unitario').value = document.getElementById('vl_unitario').value.replace('.',''); 	   
	   // document.getElementById('vl_total').value = document.getElementById('vl_total').value.replace('.',',');
   }
}

function buscar_totais(codigo){
					
	var xmlhttp_total = new getXmlHttp();
	var tipo    = 'totais';
	var valtot ='';
	var valdes ='';
	
	url = "servico.dados.php?codigo="+codigo+"&navegar="+tipo;
	xmlhttp_total.open("GET", url, true);
	xmlhttp_total.onreadystatechange=function() {	    
		if(xmlhttp_total.readyState == 4){
			if (xmlhttp_total.responseText != ''){			
				string = xmlhttp_total.responseText.split( "|" );
				
				if( document.getElementById('val_ser').value == '' ) document.getElementById('val_ser').value = '0,00';
				if( document.getElementById('val_pro').value == '' ) document.getElementById('val_pro').value = '0,00';
				if( document.getElementById('val_des').value == '' ) document.getElementById('val_des').value = '0,00';
				
				valdes = string[3].replace('.','');
				valdes = valdes.replace(',','.');
				
				valtot = string[2].replace('.','');
				valtot = valtot.replace(',','.');
				
				// alert( string[1] );				
				
			    document.getElementById('val_ser').value  = string[0];
	            document.getElementById('val_pro').value  = string[1];
				document.getElementById('val_des').value  = string[3];
								
				if( valdes == '' ) document.getElementById('val_tot').value  = valtot;
				else document.getElementById('val_tot').value  = ( parseFloat(valtot)  - parseFloat(valdes) );
				
				document.getElementById('val_tot').value = document.getElementById('val_tot').value.replace('.',',');
				
				
		    }
	    }
	}
	 xmlhttp_total.send(null);   
}

function atualizar_totais(evento){
  var val_tot =0;
  var val_ser =0;
  var val_pro =0;  
  var val_des =0;    
  
   if( document.getElementById('val_ser').value !='' && document.getElementById('val_pro').value !='' ){
	   val_ser = document.getElementById('val_ser').value.replace('.',''); 
       val_ser = val_ser.replace(',','.'); 
	   
	   val_pro = document.getElementById('val_pro').value.replace('.',''); 
       val_pro = val_pro.replace(',','.'); 
	   
       // alert( 'Produto :' + val_pro );
       // alert( 'Servico :' + val_ser );	   
       // alert(parseFloat( val_ser ) + parseFloat( val_pro ));        
	   
	   document.getElementById('val_tot').value = ( parseFloat( val_ser ) + parseFloat( val_pro ) );
	   document.getElementById('val_tot').value = document.getElementById('val_tot').value.replace('.',',');
   }
   
   if( document.getElementById('val_ser').value !='' && 
       document.getElementById('val_pro').value !='' &&  
	   document.getElementById('val_des').value !='' ){
		   
	   val_ser = document.getElementById('val_ser').value.replace('.',''); 
       val_ser = val_ser.replace(',','.'); 
	   
	   val_pro = document.getElementById('val_pro').value.replace('.',''); 
       val_pro = val_pro.replace(',','.'); 

	   val_des = document.getElementById('val_des').value.replace('.',''); 
       val_des = val_des.replace(',','.'); 
	   
	   document.getElementById('val_tot').value = ( ( parseFloat(val_ser) + parseFloat(val_pro) ) - parseFloat(val_des) );
	   document.getElementById('val_tot').value = document.getElementById('val_tot').value.replace('.',',');
   }
   
}


function roundNumber (rnum) {
  return Math.round(rnum*Math.pow(10,2))/Math.pow(10,2);
}

function buscar_cep(obj){
  var correios = new getXmlHttp();	
  var url = 'http://cep.republicavirtual.com.br/web_cep.php?cep='+obj.value+'&formato=javascript';
  var total = 0;
 
  correios.open("GET", url, true); 
  correios.onreadystatechange=function() {	    
	if(correios.readyState == 4){
        alert(correios.responseText); 		
		if (correios.responseText != ''){	

			endereco = correios.responseText;			
			if( endereco[0] !='' ) document.getElementById('editEndereco').value   = endereco[0]+' '+endereco[1];
			if( endereco[2] !='' ) document.getElementById('editBairro').value     = endereco[2];
			if( endereco[3] !='' ) document.getElementById('editMunicipio').value  = endereco[3];
			if( endereco[4] !='' ){
			   // ajustando a combo de funcionario
			   total = document.frm.idfun.options.length; 
			   for (x=0; x<total; x++) { 
				if( document.frm.editUF.options[x].value == string[4] ) document.frm.editUF.options[x].selected=true;
			   }
			}

		}
	 }
   }
   correios.send(null);   
}

/*Area de Funções operacionais*/

function operacao(tipo,tabela){
  var atividade = new getXmlHttp();		
  var ds_parm = '';	
  var url = "";
  var url_salvar = '';
  var cd_usrs = document.getElementById('cd_usrs').value; 
  var valser = document.getElementById('val_ser').value.replace('.','');
  var valpro = document.getElementById('val_pro').value.replace('.','');
  var valtot = document.getElementById('val_tot').value.replace('.','');
  var valdes = document.getElementById('val_des').value.replace('.','');
  
  valser = valser.replace(',','.');
  valpro = valpro.replace(',','.');  
  valtot = valtot.replace(',','.');   
  valdes = valdes.replace(',','.'); 
  
  url_salvar = "servico.dados.php?navegar=salvar_servico&idser="+document.getElementById('nu_serv').value+"&dt_entr="+document.getElementById('dt_entr').value+"&dt_sada="+document.getElementById('dt_sada').value+"&hr_sada="+document.getElementById('hr_sada').value+"&in_status="+document.getElementById('in_status').value+"&equipamento="+document.getElementById('ds_situa').value+"&idfun="+document.getElementById('idfun').value+"&idcli="+document.getElementById('codigo').value+"&contato="+document.getElementById('editContato').value+"&nome="+document.getElementById('editNome').value+"&email="+document.getElementById('editEmail').value+"&proximo="+document.getElementById('editProximo').value+"&endereco="+document.getElementById('editEndereco').value+"&bairro="+document.getElementById('editBairro').value+"&municipio="+document.getElementById('editMunicipio').value+"&estado="+document.getElementById('editUF').value+"&cep="+document.getElementById('editCEP').value+"&fone="+document.getElementById('editFone').value+"&celular="+document.getElementById('editCelular').value+"&val_ser="+valser+"&val_pro="+valpro+"&val_tot="+valtot+"&servico="+document.getElementById('servico').value+"&idpag="+document.getElementById('idpag').value+"&ds_eqpm="+document.getElementById('edDesc').value+"&ds_modl="+document.getElementById('edMod').value+"&dt_emss="+document.getElementById('edData').value+"&ds_seri="+document.getElementById('edSerie').value+"&nm_revn="+document.getElementById('edLoja').value+"&ds_deft="+document.getElementById('ds_deft').value+"&usuario="+document.getElementById('usuario').value+"&val_des="+valdes+"&cpf="+document.getElementById('editCPF').value+"&fax="+document.getElementById('editFAX').value+"&hr_serv="+document.getElementById('hr_serv').value; 
  
	// alert( url_salvar );
	
  if( tipo == 'i' ||
	  tipo == 'p' ||
	  tipo == 'n' ||	  
      document.getElementById('in_status').value != 'Encerrado' ||	  
	  document.getElementById('usuario').value == 'bsgrott' ||
	  document.getElementById('usuario').value == 'ana' ||	  
	  document.frm.in_status.disabled == false
	   ){	
	 
	  if( tipo == 'p' ){
		 ds_parm ="procura.list.php?tabela="+tabela+"&cd_usrs="+cd_usrs;
		 window.open(ds_parm,"Procura_Servico","directories=0,location=0,menubar=0,resizable=1,scrollbars=1,status=0,toolbar=0,left=5,top=5,width=900,height=400");
	  }else if( tipo == 'n' ){
				if( document.getElementById('acao').value != 'i'){
			   	   if( document.frm.in_status.disabled == true ){
					   document.frm.in_status.disabled = false;	
					   // document.getElementById('in_status').value = 'Em atendimento'; 	
					   document.frm.in_status.options[1].selected=true;			   	   
				   }
				   url = "servico.dados.php?navegar=codigo_novo";			
				   atividade.open("GET", url, true); 
				   atividade.onreadystatechange=function() {		    
				   if(atividade.readyState == 4){ 
					 if (atividade.responseText != ''){	   			 
						 limpa_campo('');	    		 
						 document.getElementById('ultimo_servico').value =document.getElementById('nu_serv').value;
						 document.getElementById('nu_serv').value   = atividade.responseText;
						 document.getElementById('idser').innerHTML = atividade.responseText;
						 document.getElementById('acao').value  = 'i';					 
						 buscar_itens('A',atividade.responseText);
						 buscar_itens_produto('A',atividade.responseText);
						 document.getElementById('editCPF').focus();
						 // document.getElementById('dt_sada').focus();
					 }
				  }
				}
			    atividade.send(null);
			  }else alert("Voce ja esta incluindo um novo servico !");
	  }else if( tipo == 'c' ){
		   if( document.getElementById('acao').value == 'i'){
			   document.getElementById('acao').value = '';
			   document.getElementById('idser').innerHTM = document.getElementById('ultimo_servico').value;
			   // alert(document.getElementById('ultimo_servico').value);
			   navegar_registro('Buscar', document.getElementById('ultimo_servico').value );
			   document.getElementById('ultimo_servico').value = '';
		   }
	  }else if( tipo == 'e' ){
				if( document.getElementById('acao').value != 'i'){
				   if ( confirm("Tem certeza que deseja excluir este servico ?") ){
					  document.getElementById('acao').value = '';
					  document.getElementById('ultimo_servico').value = '';
					  url = "servico.dados.php?navegar=excluir_servico&idser="+document.getElementById('nu_serv').value+"&usuario="+document.getElementById('usuario').value;
					  atividade.open("GET",url,true);
					  atividade.send(null);
					  navegar_registro('p');
				   }
				}else alert("Voce ja esta em modo inclusao !");
	  }else if( tipo == 'g' ){	  
			if( document.getElementById('acao').value == 'i' || 
				document.getElementById('acao').value == 'n' || 
				document.getElementById('acao').value == ''){
				   if ( confirm("Tem certeza que deseja salvar este servico ?") ){
					  document.getElementById('acao').value = '';
					  document.getElementById('ultimo_servico').value = '';
					  // alert(url);
					  atividade.open("GET",url_salvar,true);
					  atividade.send(null);
				   }
				}else alert("Voce ja esta em modo inclusao !");
	  }else if( tipo == 'i' ){	  
				if( document.getElementById('editNome').value =='' ){ 
				   alert('O cliente não foi informado !');
				   return false;
				   document.getElementById('codigo').focus();
				}else if( document.getElementById('editFone').value == '' && 
				          document.getElementById('editCelular').value == '' ){ 
						  alert('Informe pelo menos um telefone !');
						  return false;
						  document.getElementById('editFone').focus();
				}else if( document.getElementById('editCPF').value == ''){ 
						  alert('Informe o CPF ou CNPJ !');
						  return false;
						  document.getElementById('editCPF').focus();
				}else{   
					if( valtot != '' && valtot != '0.00' && valtot != '0') 
						 document.getElementById('frm').action = 'servico_fechado.pdf.php?idser='+document.getElementById('nu_serv').value;
					else document.getElementById('frm').action = 'servico.pdf.php?idser='+document.getElementById('nu_serv').value;		
					
					// gravando antes de imprimir
					document.getElementById('acao').value = '';
					document.getElementById('ultimo_servico').value = '';
					atividade.open("GET",url_salvar,true);
					atividade.send(null);
					
					// gerando o PDF
					document.getElementById('frm').target = '_blank';
					document.getElementById('frm').submit();
				}
	  }
  }else{
 	alert('Esta ordem de serviço já foi encerrada !');  
  }
}


function consultar_agenda(){

   var idfun   = document.getElementById('idfun').value;
   var dt_sada = document.getElementById('dt_sada').value;
   var cd_usrs = document.getElementById('cd_usrs').value; 
 
   if( idfun == '' ) alert('Informe o tecnico para consultar');
   else if( dt_sada == '' ) alert('Informe a data para consultar');
   else{  
     ds_parm ="procura.list.php?pesquisa=1&tabela=agenda&idfun="+idfun+"&dt_sada="+dt_sada+"&cd_usrs="+cd_usrs;
	 // alert(ds_parm);
     window.open(ds_parm,"Procura","directories=0,location=0,menubar=0,resizable=1,scrollbars=1,status=0,toolbar=0,left=5,top=5,width=950,height=400");
   }

}