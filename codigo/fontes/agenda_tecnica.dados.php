<?
@header('Content-Type: text/html; charset=iso-8859-1');
@header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
@header("Expires: Mon, 26 Jul 1997 05:00:00 GMT"); // Date in the past

include_once('gdb.php');

$gdb = new gdb();
			   
foreach($_GET as $campo=>$valor){
	$$campo = $valor;
}

if( $situacao == 'buscar' ){
	$where = '';
	
	if( $idfun != '') $where = "AND s.idfun= $idfun";
	
	$gdb->parametro('dt_sada_term' ,'NDATA',$dt_sada_term );
	$gdb->parametro('dt_sada_inic' ,'NDATA',$dt_sada_inic );
	
	$gdb->open("SELECT DATE_FORMAT(dt_sada,'%d/%m/%Y')   as data,
								   hr_sada   as  hora,
								   upper(f.nome)    as funcionario,
								   s.idser 	 as servico,
								   s.in_status,
								   c.nome	 as Cliente,
								   c.bairro,
								   c.municipio,
								   p.DS_EQPM as produto,
								   p.defeito,
								   s.hr_serv
							  FROM knoll_servicos s
								
							   JOIN knoll_funcionario f
								 ON s.idfun=f.idfun  
								   
							   JOIN knoll_clientes c
								 ON s.idcli=c.idcli 		   
								 
						 LEFT JOIN knoll_clientes_produtos p
								ON p.idser=s.idser    
								
							 WHERE s.idfun=f.idfun
							   AND s.idcli=c.idcli
							   AND s.dt_sada <= :dt_sada_term
							   AND s.dt_sada >= :dt_sada_inic
							   AND s.in_status<>'Cancelado'
							   AND s.in_status<>'Encerrado'
							   $where
						  ORDER BY s.idfun, s.dt_sada,s.hr_sada ");
				   
	tabela_agenda( $gdb );
}elseif( $situacao == 'atualizar' ){
	
	$gdb->parametro('dt_sada' ,'NDATA',$dt_sada );
	
	if( $gdb->open("UPDATE knoll_servicos 
	               SET hr_serv = '$hr_serv',
	                   dt_sada = :dt_sada,
					   hr_sada = '$hr_sada'
			     WHERE idser=$idser ") ) print "Ordem de servico n. $idser atualizado com sucesso !";	
	
}


function tabela_agenda( $gdb ){	
  
  $nm_func = '';
  $cd_serv = '';
  
  if( $gdb->linhas>0 ){ ?>
    <script type="text/javascript" src="http://www.ejc.eti.br/biblioteca/js/jQuery/jquery.maskedinput.js"></script>  
    
    <script>
	   $(document).ready(function(){	   
		<? foreach( $gdb->gs['SERVICO'] as $key=>$value ){ ?>
			 $("#serv_data_<? print $value; ?>").mask("99/99/9999");
			 $("#serv_hora_<? print $value; ?>").mask("99:99");
		<? } ?>		  	    
	   });
	</script>
	
     <table class="table_interna">
       <tr>
         <td align="center"class="table_interna"><font class="label">Data</font></td>
         <td align="center"class="table_interna"><font class="label">Hora</font></td>           
         <td align="center"class="table_interna"><font class="label">Dura&ccedil;&acirc;o</font></td>                    
         <td align="center"class="table_interna"><font class="label">Servi&ccedil;o</font></td>    
         <td align="center"class="table_interna"><font class="label">Estatus do Servi&ccedil;o</font></td>                    
         <td align="center"class="table_interna"><font class="label">Cliente</font></td>           
         <td align="center"class="table_interna"><font class="label">Bairro</font></td>           
         <td align="center"class="table_interna"><font class="label">Municipio</font></td>                    
         <td align="center"class="table_interna"><font class="label">Produto</font></td>           
         <td align="center"class="table_interna"><font class="label">Dados do Servi&ccedil;o</font></td>                    
         <td align="center"class="table_interna"><font class="label">Opera&ccedil;&acirc;o</font></td>                             
       </tr>
	<? foreach( $gdb->gs['SERVICO'] as $key=>$value ){
		
         if( $nm_func != $gdb->gs['FUNCIONARIO'][$key] ){?>
            <tr><td colspan="10" class="table_interna" align="center"><b><? print $gdb->gs['FUNCIONARIO'][$key]; ?></b></td></tr>
         <? }
		 
         if( $cd_serv != $gdb->gs['SERVICO'][$key] ){?>   
               
         <tr>
           <td align="center"class="table_interna">
               <font class="edit"><input type="text" size = "11" maxlength="10" onchange="ativar_botao(<? print $value ?>);"
                                         id="serv_data_<? print $value; ?>" name="serv_data_<? print $value; ?>"   
                                         value="<? print $gdb->gs['DATA'][$key]; ?>"/>
               </font>
           </td>
           <td align="center"class="table_interna">
                <font class="edit"><input type="text"  size = "6" maxlength="5" onchange="ativar_botao(<? print $value ?>);"
                                         id="serv_hora_<? print $value; ?>" name="serv_hora_<? print $value; ?>"   
                                         value="<? print $gdb->gs['HORA'][$key]; ?>"/> 
		   		</font>
           </td>
           <td  align="center"class="table_interna">
              <font class="edit">
              <select name="hr_serv_<? print $value ?>" id="hr_serv_<? print $value ?>" onchange="ativar_botao(<? print $value ?>);" >
                <option value="" >00:00</option>              
                <option value="00:30" <? if($gdb->gs['HR_SERV'][$key] == '00:30') print 'selected="selected"'; ?>>00:30</option>
                <option value="01:00" <? if($gdb->gs['HR_SERV'][$key] == '01:00') print 'selected="selected"'; ?>>01:00</option>  
                <option value="01:30" <? if($gdb->gs['HR_SERV'][$key] == '01:30') print 'selected="selected"'; ?>>01:30</option>
                <option value="02:00" <? if($gdb->gs['HR_SERV'][$key] == '02:00') print 'selected="selected"'; ?>>02:00</option>  
                <option value="02:30" <? if($gdb->gs['HR_SERV'][$key] == '02:30') print 'selected="selected"'; ?>>02:30</option>
                <option value="03:00" <? if($gdb->gs['HR_SERV'][$key] == '03:00') print 'selected="selected"'; ?>>03:00</option>  
              </select>
              </font>
           </td>
           <td align="left" class="table_interna">
             <font class="edit">
                <a target="_new" href="servico.form.php?nu_serv=<? print $gdb->gs['SERVICO'][$key]; ?>" ><b><? print $gdb->gs['SERVICO'][$key]; ?></b></a>
             </font>
           </td>     
           <td align="left" class="table_interna">
             <font class="edit"><? print $gdb->gs['IN_STATUS'][$key]; ?></font>
           </td>     
           
           <td align="left" class="table_interna"><font class="edit"><? print $gdb->gs['CLIENTE'][$key]; ?></font></td>          
           <td align="left" class="table_interna"><font class="edit"><? print $gdb->gs['BAIRRO'][$key]; ?></font></td>               
           <td align="left" class="table_interna"><font class="edit"><? print $gdb->gs['MUNICIPIO'][$key]; ?></font></td>             
     <? } else { ?> 
           <tr><td class="table_interna" colspan="6">&nbsp;<td>     
     <? }
		   $nm_func = $gdb->gs['FUNCIONARIO'][$key]; ?> 	                    
           
           <td align="left" class="table_interna"><font class="edit"><? print $gdb->gs['PRODUTO'][$key]; ?></font></td>               
           <td align="left" class="table_interna"><font class="edit"><? print $gdb->gs['DEFEITO'][$key]; ?></font></td>                    
           <td align="center"class="table_interna">
           <? if( $cd_serv != $gdb->gs['SERVICO'][$key] ){ ?>          
                <input type="button" value="Salvar"  id="btn_salvar_<? print $gdb->gs['SERVICO'][$key]; ?>" 
                       onclick="salvar_agenda('<? print $gdb->gs['SERVICO'][$key]; ?>');" disabled="disabled" />
           <? } 
	         $cd_serv = $gdb->gs['SERVICO'][$key];
		   ?>                             
           </td>                         
        </tr>	   
     <? } ?>
     </table>    
<? 
  }
}?>