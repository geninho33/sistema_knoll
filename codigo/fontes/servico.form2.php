<?
  include_once("abertura_delphi.php"); 
  include_once("acesso_sistema.func.php");
  include_once("servico.func.php");     
  include_once("cad_delphi.php");
  
  $gdb = new servico();
  $gdbu = new servico();
  
  $gdb->buscar('p');  
  
  $situacao = $gdb->vargetpost("situacao","");  
  $cd_usrs  = $gdb->vargetpost("cd_usrs","1");
  $nu_serv  = $gdb->vargetpost("nu_serv","");
   
  $gdbu->open("Select nm_logn From knoll_usuarios where cd_usrs=".$cd_usrs );
  
  $usuario = $gdbu->gs['NM_LOGN'][0];
  
  /*  
		  $gdb->open("SELECT distinct idpro FROM knoll_servicos_itens ");  
		  foreach($gdb->gs['IDPRO'] as $key=>$value){
			$gdbu->open("SELECT distinct idpro, descricao, unidade, venda FROM knoll_produtos where IDPRO = $value");
			if( $gdbu->linhas == 0 ){
			   $gdbu->open(" insert into knoll_produtos(idpro, descricao, unidade, venda ) 
							  SELECT distinct idpro, descricao, unidade, val_tot as venda  FROM knoll_servicos_itens where idpro = $value ");
			}   
		  }
			
		  
		  print '<pre>';
		  print_r($_SESSION);
		  print '</pre>';  
		  
		  
		  $campo = '';
		  foreach($gdb->tabela as $value){
			 $campo =$campo.$gdb->gs[$value][0].'|';
		  }
		  print $campo;
  */  
 
?>

<form name="frm" id="frm" method="post">
   <input type="hidden" name="acao" id="acao" value="n">
   <input type="hidden" name="ultimo_servico" id="ultimo_servico" value="">
   <input type="hidden" name="cd_usrs" id="cd_usrs" value="<? print $cd_usrs; ?>" >
   <input type="hidden" name="usuario" id="usuario" value="<? print $usuario; ?>" >
   
<table class="table_externa" >
  <tr>
    <td colspan="4">
    <? abertura('Ordem de Servi&ccedil;o');?>
    </td> 
  </tr>  
  <tr  height="100%">
    <!-- Area dos bot�es de opera��es -->  
    <td valign="middle">
    <? botoes_operacao(); ?>
    </td>
    <!-- Area de dados do cadastro -->
    <td colspan="3" valign="top">
    <? campos_form($gdb); ?>
    </td>  
  </tr>  
</table>
</form>

<body>
<script language="javascript" src="../js/ajax.js"></script>
<script language="javascript" src="../js/xformat_numero.js"></script>
<script language="javascript" src="../js/funcoes.js"></script>
<script>
<!--
  <? if($nu_serv !=''){  ?>
        document.getElementById('idser').innerHTML = <? print $nu_serv; ?>;
		navegar_registro('Buscar',0); 
  <? }else{?>
        navegar_registro('u',0);
  <? } ?>    
-->
$(document).ready(function(){	   
	  $("#dt_sada").mask("99/99/9999");
	  $("#dt_entr").mask("99/99/9999");
	  $("#edData").mask("99/99/9999");
	  $("#hr_sada").mask("99:99");		  
	  $("#dt_nasc").mask("99/99/9999");		     	
	  $("#nu_cpf").mask("999.999.999-99");   
});
</script>

</body>

<? function campos_form($gdb){ ?>
    <table class="table_interna" >
    <tr><td>
           <table>
           <tr>
            <td>
              <font class="label">T&eacute;cnico :</font><br/>
              <select name="idfun" id="idfun" >
                 <? 
				  $gdb->open(" select idfun,UPPER(nome) as nome from knoll_funcionario where tipo <> 'normal' ");  
				  foreach($gdb->gs['IDFUN'] as $key=>$value){ ?>
   				     <option value=<? print $value; ?> ><? print $gdb->gs['NOME'][$key]; ?></option>	  
	 		   <? } ?>
              </select>
            </td>
            <td>
              <font class="label">Agendamento (Data e Hora) :</font><br/>
              <input type="text" name="dt_sada" id="dt_sada" size="11" maxlength="10" value="<? print $gdb->dt_sada; ?>" >/
              <input type="text" name="hr_sada" id="hr_sada" size="6" maxlength="5" value="<? print $gdb->hr_sada; ?>" >
              <input type="button" value="Agenda" onClick="consultar_agenda();">
            </td>
            <td>
              <font class="label">Dura&ccedil;&atilde;o :</font><br/>
              <select name="hr_serv" id="hr_serv">
                <option value="">00:00</option>              
                <option value="00:30" <? if($gdb->gs['HR_SERV'][$key] == '00:30') print 'selected="selected"'; ?>>00:30</option>
                <option value="01:00" <? if($gdb->gs['HR_SERV'][$key] == '01:00') print 'selected="selected"'; ?>>01:00</option>  
                <option value="01:30" <? if($gdb->gs['HR_SERV'][$key] == '01:30') print 'selected="selected"'; ?>>01:30</option>
                <option value="02:00" <? if($gdb->gs['HR_SERV'][$key] == '02:00') print 'selected="selected"'; ?>>02:00</option>  
                <option value="02:30" <? if($gdb->gs['HR_SERV'][$key] == '02:30') print 'selected="selected"'; ?>>02:30</option>
                <option value="03:00" <? if($gdb->gs['HR_SERV'][$key] == '03:00') print 'selected="selected"'; ?>>03:00</option>  
              </select>
            </td>
            <td>
             <font class="label">Encerramento:</font><br/>
             <input type="text" name="dt_entr" id="dt_entr" size="11" maxlength="10" value="<? print $gdb->dt_entr; ?>" ></td>
            <td>
              <font class="label">Estatus do Servi&ccedil;co :</font><br/>
              <select  name="in_status" id="in_status" >
                 <option value="Aguardando Atendimento">Aguardando Atendimento</option>
                 <option value="Em atendimento">Em atendimento</option>           
                 <option value="Aguardando Peça">Aguardando Peça</option>           
                 <option value="Cancelado">Cancelado</option>           
                 <option value="Encerrado">Encerrado</option>                                 
              </select>						    					  
            </td>
            <td>
              <font class="label">Situa&ccedil;&atilde;o do Servi&ccedil;o :</font><br/>
              <select  name="ds_situa" id="ds_situa" >
                 <option value="Garantia">Garantia</option>
                 <option value="Sem Garantia">Fora da Garantia</option>           
                 <option value="Nossa Garantia">Nossa Garantia</option>           
              </select>						    					  
            </td>
          </tr>
          </table>    
      </td>
      </tr>
      <tr class="sub_titulo"><td align="center">Dados do Cliente</td></tr>
      <!-- Parte  -->           
      <tr>
        <td>
        <table>
        <tr><td>
          <font class="label">Codigo :</font><br/>
          <input type="text" name="codigo" id="codigo" size="8" maxlength="10" value="" >
          <input type="button" value="..." onClick="busca('cliente');" />
        </td>
        <td>
          <font class="label">CPF/CNPJ :</font><br/>
          <input type="text" name="editCPF" id="editCPF" size="15" maxlength="14" value="" >
        </td>        
        <td>
          <font class="label">Nome ou Raz&atilde;o Social :</font><br/>
          <input type="text" name="editNome" id="editNome" size="41" maxlength="80" value="" >
        </td>
        <td>
          <font class="label">Email :</font><br/>
          <input type="text" name="editEmail" id="editEmail" size="21" maxlength="50" value="" >
        </td>        
        <td>
          <font class="label">Contato / Engenheiro :</font><br/>
          <input type="text" name="editContato" id="editContato" size="19" maxlength="18" value="" >
        </td>                      
        </tr> 
        </table>
      </td></tr>
      <!-- Parte  -->     
      <tr>
        <td>
        <table>
        <tr>
        <td>
          <font class="label">CEP :</font><br/>
          <input type="text" name="editCEP" id="editCEP" size="9" maxlength="8" value="" >
          <input type="button" value="..." onClick="buscar_cep(frm.editCEP);" />          
        </td>        
        <td >
          <font class="label">Endere&ccedil;o :</font><br/>
          <input type="text" name="editEndereco" id="editEndereco" size="61" maxlength="120" value="" >
        </td>
        <td >
          <font class="label">Proximidade :</font><br/>
          <input type="text" name="editProximo" id="editProximo" size="32" maxlength="150" value="" >
        </td>        
        </tr>
        </table>
        </td>        
      </tr>            
      <tr>
        <td>
        <table><tr>
        <td>
          <font class="label">Bairro :</font><br/>
          <input type="text" name="editBairro" id="editBairro" size="21" maxlength="30" value="" >
        </td>
        <td>
          <font class="label">Municipío :</font><br/>
          <input type="text" name="editMunicipio" id="editMunicipio" size="21" maxlength="50" value="" >
        </td>
        <td>
          <font class="label">Estado :</font><br/>        
          <select name="editUF" id="editUF" >
             <option value="SC">SC</option>
             <option value="RS">RS</option>           
             <option value="PR">PR</option>           
          </select>
        </td>        
        <td>
          <font class="label">Telefone :</font><br/>
          <input type="text" name="editFone" id="editFone" size="19" maxlength="18" value="" >
        </td>
        <td>
          <font class="label">Celular :</font><br/>
          <input type="text" name="editCelular" id="editCelular" size="19" maxlength="18" value="" >
        </td>
        <td>
          <font class="label">Telefone Trabalho :</font><br/>
          <input type="text" name="editFAX" id="editFAX" size="19" maxlength="18" value="" >
        </td>
        </tr>
        </table>
        </td>
     </tr>            
     <tr class="sub_titulo"><td align="center">Dados do Eletrodoméstico</td></tr>
     <tr><td>
       <table><tr>
       <td>
          <font class="label">Descri&ccedil;&atilde;o :</font><br/>
          <input type="text" name="edDesc" id="edDesc" size="31" maxlength="30" value="" >
          <input type="button" value="..." onClick="busca('produto');"/>
          <input type="hidden" name="cd_eqpm" id="cd_eqpm" value="">
          
        </td>      
        <td>
          <font class="label">Nr. Nota :</font><br/>
          <input type="text" name="edNota" id="edNota" size="11" maxlength="10" value="" >
        </td>
        <td>
          <font class="label">Modelo :</font><br/>
          <input type="text" name="edMod" id="edMod" size="19" maxlength="18" value="" >
        </td>
        <td>
          <font class="label">Data :</font><br/>
          <input type="text" name="edData" id="edData" size="11" maxlength="10" value="" >
        </td>
        <td>
          <font class="label">Serie :</font><br/>
          <input type="text" name="edSerie" id="edSerie" size="21" maxlength="20" value="" >
        </td>
        <td>
          <font class="label">Revenda :</font><br/>
          <input type="text" name="edLoja" id="edLoja" size="19" maxlength="18" value="" >
        </td>
        
        <td><input type="button" value="Salvar"
                   name="btn_incluir_produto" id="btn_incluir_produto"
                   onClick="buscar_itens_produto('S',0);"/></td>        
      </table></td>
     </tr>   
     <tr>
     <td>
       <font class="label">Descri&ccedil;&atilde;o do Defeito :</font><br/>  
       <input type="text" name="defeito" id="defeito" size="111" maxlength="110" value="" >
     </td>
     </tr>
     <tr>
     <td>
     <div id='tabela_produto'></div>
     </td>
     </tr>      
<!--     <tr><td align="center">&nbsp;</td></tr>      -->
     <tr class="sub_titulo"><td align="center">Lan&ccedil;amento de Pe&ccedil;as e Servi&ccedil;os</td></tr>
     <tr><td>
       <table><tr>     
       <td colspan="2"><font class="label">Codigo :</font><br>
           <input type="text" 
                  name="edser" id="edser" 
                  size="5" maxlength="4" value=""
                  onBlur="buscar_produto_itens(this.value);" >           
          <input type="button" value="..." onClick="busca('itens');"/></td>
       <td><font class="label">P/S :</font><br><select name="in_ps"  id="in_ps"><option value="P">P</option><option value="S">S</option></select></td>
       <td><font class="label">Descri&ccedil;&atilde;o :</font><br><input type="text" name="ds_produto" id="ds_produto" size="41" maxlength="40" value="" ></td>
       <td><font class="label">Unidade :</font><br><input type="text" name="ds_unidade" id="ds_unidade" size="4" maxlength="3" value="" ></td>
       <td><font class="label">Quantidade :</font><br>
           <input type="text" style="text-align:right" 
                  name="edqtde" id="edqtde" 
                  size="9" maxlength="8" value=""
                  onKeyPress="return(currencyFormat(this,'.',',',event));"
				  onblur="atualizar_valores();if (this.value == '') this.value = '0,00'; 
                                      else return(currencyFormat(this,'.',',',event));" ></td>
       <td><font class="label">Valor :</font><br>
           <input type="text" style="text-align:right" 
                  name="vl_unitario" id="vl_unitario" 
                  size="9" maxlength="8" value=""
                  onKeyPress="return(currencyFormat(this,'.',',',event)); "
				  onblur="atualizar_valores();if (this.value == '') this.value = '0,00'; 
                                      else return(currencyFormat(this,'.',',',event));" ></td>
       <td ><font class="label">Total :</font><br>
            <input type="text" style="text-align:right" 
                   name="vl_total" id="vl_total" 
                   size="9" maxlength="8" value=""
                   onChange="return(currencyFormat(this,'.',',',event));" 
                   onKeyPress="return(currencyFormat(this,'.',',',event));"
				   onblur="if (this.value == '') this.value = '0,00'; 
                  else return(currencyFormat(this,'.',',',event));" >
            <input type="button" value="Incluir"
                   name="btn_incluir_itens" id="btn_incluir_itens"  
                    onClick="buscar_itens('S',0);"/>
                   </td>

     </tr></table>
     </td></tr>       
     <tr>
     <td>
     <div id='tabela_itens'></div>
     </td>
     </tr> 
     <tr class="sub_titulo"><td align="center">Totais</td></tr>     
     <tr>
        <td>
        <table><tr valign="top">
        <td colspan="2">
          <font class="label">Forma de Pagamento :</font><br/>
          <select name="idpag" id="idpag">
		   <? 
            $gdb->open(" select idpag,UPPER(descricao) as descricao from knoll_pagamento order by idpag  ");  
            foreach($gdb->gs['IDPAG'] as $key=>$value){ ?>
               <option value=<? print $value; ?> ><? print $gdb->gs['DESCRICAO'][$key]; ?></option>	  
         <? } ?>
          </select>
        </td>
        <td>
          <font class="label">Valor do Servi&ccedil;o :</font><br/>
          <input type="text" style="text-align:right"  
                 name="val_ser" id="val_ser" 
                 size="10" maxlength="9" 
                 onKeyPress="return(currencyFormat(this,'.',',',event));"
				 onblur="atualizar_totais(this); if (this.value == '') this.value = '0,00';
          //else return(currencyFormat(this,'.',',',event)); " >
        </td>
        <td>
          <font class="label">Valor do Produto :</font><br/>        
          <input type="text" style="text-align:right"  
                  name="val_pro" id="val_pro" 
                  size="10" maxlength="9"                  
                  onKeyPress="return(currencyFormat(this,'.',',',event));"
				 onblur="atualizar_totais(this); if (this.value == '') this.value = '0,00'; 
         // else return(currencyFormat(this,'.',',',event)); ">
        </td>
        <td>
          <font class="label">Valor do Desconto :</font><br/>
          <input type="text" style="text-align:right"  
                 name="val_des" id="val_des" 
                 size="10" maxlength="9"                  
                 onKeyPress="return(currencyFormat(this,'.',',',event));"
				 onblur="if (this.value == '') this.value = '0,00'; atualizar_totais(this);" >
        </td>                
        <td>
          <font class="label">Valor Total :</font><br/>
          <input type="text" style="text-align:right"  
                 name="val_tot" id="val_tot" 
                 size="10" maxlength="9"                  
                 onKeyPress="return(currencyFormat(this,'.',',',event));"
				 onblur="if (this.value == '') this.value = '0,00';" >
        </td>
       <td ><font class="label">Observa&ccedil;&atilde;o do Fechamento :</font><br>
            <textarea name="servico" id="servico" rows="4" cols="20"></textarea></td>        
       <td ><font class="label">Observa&ccedil;&atilde;o Geral  :</font><br>
            <textarea name="ds_deft" id="ds_deft" rows="4" cols="20"></textarea></td>        
        </tr>
        </table>
        </td>
     </tr>                 
    </table>
<? } ?>      