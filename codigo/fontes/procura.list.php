<?    
  include_once("abertura_delphi.php"); 
  include_once("acesso_sistema.func.php");
  include_once("servico.func.php");     
  include_once("cad_delphi.php");


  $gdb = new servico(); 	  
  
  foreach($_GET as $campo=>$valor){
	  $$campo = $valor;
  }
   
  if( $cd_usrs !='' ){ 
	  if( !isset( $pesquisa )  ){
	     $gdb->open("select * from knoll_pesquisa where cd_usrs = '$cd_usrs' ");
	     if( $gdb->linhas>0 ){
		     $in_tipo = $gdb->gs['IN_TIPO'][0];
		     $ds_dado = $gdb->gs['DS_DADO'][0];
		     $pesquisa = 1;
	     }
	  }else{
	  	$gdb->open("delete from knoll_pesquisa where cd_usrs = '$cd_usrs' ");
	  	if( $pesquisa !=0 ){	  		
	  		$gdb->open("insert into knoll_pesquisa(cd_usrs,in_tipo,ds_dado) values('$cd_usrs','$in_tipo','$ds_dado')");
	  	}	  }
  }
  /* */ 
   if ( $pesquisa == 1) { 
      if( $tabela == 'servico' ){ 		  
		  $gdb->titulo_campo  ='Servi&ccedil;o,Cliente,Entrada,Saida,Endereco,bairro,municipio,telefone,celular,Produto'; 
		  $gdb->visivel_campo ='v,v,v,v,v,v,v,v,v,v'; 
		  $gdb->alinha_campo  ='e,e,e,e,e,e,e,e,e,e'; 
		  $gdb->chave_campo   ='0';
		  $gdb->procurar_servico_cliente($in_tipo, $ds_dado);
		  $lista = '<b>Listagem de Servi&ccedil;o</b>';
	  }
      if( $tabela == 'cliente' ){ 		  
		  $gdb->titulo_campo  ='Codigo,Nome,Endereco,bairro,municipio,telefone,celular'; 
		  $gdb->visivel_campo ='v,v,v,v,v,v,v,v,v'; 
		  $gdb->alinha_campo  ='e,e,e,e,e,e,e,e,e'; 
		  $gdb->chave_campo   ='0';
		  $gdb->procurar_cliente($in_tipo, $ds_dado);
		  $lista = '<b>Listagem de Cliente</b>';		  
	  }	  
      if( $tabela == 'produto' ){ 		  
		  $gdb->titulo_campo  ='Codigo,Produto,Marca,Modelo,,,Nota,,,Loja'; 
		  $gdb->visivel_campo ='v,v,v,v,i,i,v,i,i,v'; 
		  $gdb->alinha_campo  ='e,e,e,e,e,e,e,e,e,e'; 
		  $gdb->chave_campo   ='0';
		  $gdb->procurar_produto_cliente($idcli);
		  $lista = '<b>Listagem de Produto</b>';		  
	  }	  	  
      if( $tabela == 'itens' ){ 		  
		  $gdb->titulo_campo  ='Codigo,Produto,Unidade,Valor'; 
		  $gdb->visivel_campo ='v,v,v,v'; 
		  $gdb->alinha_campo  ='e,e,e,e'; 
		  $gdb->chave_campo   ='0';
		  $gdb->procurar_produto($in_tipo, $ds_dado);
		  $lista = '<b>Listagem de Pe&ccedil;as</b>';		  
	  }
      if( $tabela == 'agenda' ){ 		  
		  $gdb->titulo_campo  ='Data,Hora,Funcionario,Codigo,Cliente,Bairro,Municipio,Produto,Dados do Servi&ccedil;o'; 
		  $gdb->visivel_campo ='v,v,i,v,v,v,v,v,v'; 
		  $gdb->alinha_campo  ='e,e,e,e,e,e,e,e,e'; 
		  $gdb->chave_campo   ='0';
		  
		  $gdb->parametro('dt_sada_term' ,'NDATA',$dt_sada );
		  $gdb->parametro('dt_sada_inic' ,'NDATA',$dt_sada );

		  $gdb->open(" SELECT DATE_FORMAT(dt_sada,'%d/%m/%Y')   as data,
							   hr_sada as  hora,
							   f.nome as funcionario,
							   s.idser as servico,
							   c.nome as Cliente,
							   c.bairro,
							   c.municipio,
							   p.DS_EQPM as produto,
							   p.defeito
						  FROM knoll_servicos s
							
						   JOIN knoll_funcionario f
						     ON s.idfun=f.idfun  
							   
					       JOIN knoll_clientes c
						     ON s.idcli=c.idcli 		   
							 
					 LEFT JOIN knoll_clientes_produtos p
							ON p.idser=s.idser    
							
						 WHERE s.dt_sada <= :dt_sada_term
						   AND s.dt_sada >= :dt_sada_inic
						   AND s.idfun= $idfun
					  ORDER BY s.idfun, s.dt_sada,s.hr_sada");
		  $lista = '<b>Tecnico :</b>'.$gdb->gs['FUNCIONARIO'][0];		  
	  }	  	  
	  	  	  
   } 
?>

<form name="frm">
 <input type="hidden" name="pesquisa" id="pesquisa">
 <input type="hidden" name="tabela" id="tabela" value="<? @print $tabela; ?>" > 
 <input type="hidden" name="cd_usrs" id="cd_usrs" value="<? @print $cd_usrs; ?>" > 
  
<table class="table_externa" >
  <tr>
    <td colspan="4">
    <? 
	  if( $tabela != 'agenda' ) abertura('Procura de Ordem de Servi&ccedil;o','',0); 
	  else  abertura('Consulta da Agenda','',0); 
	?>
    </td> 
  </tr>
  <? if( $pesquisa == 0){  ?> 
        <tr><td width="47"></td><td colspan="4">&nbsp;</td></tr>  
        <tr  height="150%">
          <!-- Area dos botões de operações -->  
          <td valign="top">
          <? botoes_procura('p'); ?>
          </td>
          <!-- Area de dados do cadastro -->
          <td colspan="3" valign="top">
          <? 
		    if( $tabela == 'servico' )  campos_busca_servico();
            else if( $tabela == 'cliente' || $tabela == 'produto' )  campos_busca_cliente();						
            else if( $tabela == 'itens'  )  campos_busca_produto();
		   ?>
          </td>  
        </tr>          
  <? }else{ ?>
        <tr><td width="47"></td><td colspan="4">&nbsp;</td></tr>  
        <tr  height="150%">
          <!-- Area dos botões de operações -->  
          <td valign="top">
          <? botoes_procura('n'); ?>
          </td>
          <!-- Area de dados do cadastro -->
          <td colspan="3" valign="top">
             <table>
               <tr><td>
                   <? $gdb->print_tabela_especial( $lista ); ?>                  
               </td></tr>
             </table>               
          </td>  
        </tr>  
  <? } ?>
</table>
</form>


<script>
<!--
function pesquisar(opc){
  var checkOK = "1234567890";
  
  if ( opc == 0 ) frm.pesquisa.value =opc;   
  else{
     if ( frm.ds_dado.value == '' ){
         alert("Informe algum dados ! ");
         frm.ds_dado.focus();
         return false;	 
	 }else frm.pesquisa.value =opc;   
  }  
  frm.submit();
}

function sair(){
   window.close();
}

function escolher(){ 

   if ( window.opener!=null) {	
        /*   
        window.opener.document.getElementById(codigo).value        =selecionar.arguments[0];	   
        window.opener.document.getElementById(codigo2).value       =selecionar.arguments[1];
        window.opener.document.getElementById(descricao).innerHTML =selecionar.arguments[2];
		window.opener.document.getElementById('nu_alqt').value     =selecionar.arguments[3];
	    window.opener.document.getElementById('tr_base').value ="";		   		
		
		if( selecionar.arguments[4] !='' ){
	        window.opener.document.getElementById('ds_cst').innerHTML  =selecionar.arguments[5]+' - '+selecionar.arguments[6];				
			window.opener.document.getElementById('cd_cst').value =selecionar.arguments[4];		
		}else{ 	
	        window.opener.document.getElementById('ds_cst').innerHTML  =window.opener.document.getElementById('ds_cst2').value;									
	        window.opener.document.getElementById('cd_cst').value =window.opener.document.getElementById('cd_cst2').value;		
		}
		if(  window.opener.document.getElementById('cd_cst').value.substring(3,4) == "S")
		   window.opener.document.getElementById('tr_base').style.display ="block";
		else window.opener.document.getElementById('tr_base').style.display ="none";
		
		window.opener.document.getElementById('cd_cnae2').value     =selecionar.arguments[1];
		*/
		if( document.frm.tabela.value == 'servico'){
		    window.opener.document.getElementById('codigo').value = escolher.arguments[0]; 
		    window.opener.navegar_registro( 'Buscar', escolher.arguments[0] );		
		}
		if( document.frm.tabela.value == 'produto') window.opener.buscar_produto( escolher.arguments[0] );					
		if( document.frm.tabela.value == 'itens') window.opener.buscar_produto_itens( escolher.arguments[0] );							
		if( document.frm.tabela.value == 'cliente'){
		    window.opener.buscar_cliente( escolher.arguments[0] );				
		}
	    window.close();
   }  
   
}
//-->
</script>