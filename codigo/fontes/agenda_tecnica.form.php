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
?>

<form name="frm" id="frm" method="post">
   <input type="hidden" name="acao" id="acao" value="n">
   <input type="hidden" name="ultimo_servico" id="ultimo_servico" value="">
   <input type="hidden" name="usuario" id="usuario" value="<? print $usuario; ?>">
   
<table class="table_externa" >
  <tr>
    <td colspan="4">
    <? abertura('Agenda do(s) Técnico(s)','',0); ?>
    </td> 
  </tr>  
  <tr  height="150%">
    <!-- Area dos botões de operações -->  
    <td valign="middle">
    <? botoes_consulta(); ?>
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
<script language="javascript" src="../js/agenda_tecnica.js"></script>

<script>
$(document).ready(function(){	   
	  $("#dt_sada_inic").mask("99/99/9999");
	  $("#dt_sada_term").mask("99/99/9999");
});
</script>

</body>
<? function campos_form($gdb){ ?>
    <table class="table_interna" >
    <tr><td>
           <table width="500">
           <tr>
            <td colspan="2">
              <font class="label">T&eacute;cnico :</font><br/>
              <select name="idfun" id="idfun" >
                 <option value=''>Todos</option>	  
                 <? 
				  $gdb->open(" select idfun,UPPER(nome) as nome from knoll_funcionario where tipo <> 'normal' ");  
				  foreach($gdb->gs['IDFUN'] as $key=>$value){ ?>
   				     <option value=<? print $value; ?> ><? print $gdb->gs['NOME'][$key]; ?></option>	  
	 		   <? } ?>
              </select>
            </td>
            <td colspan="3">
              <font class="label">Periodo de Agendamento de :</font><br/>
              <input type="text" name="dt_sada_inic" id="dt_sada_inic" size="11" maxlength="10" value="" >
              <font class="label"> a </font>
              <input type="text" name="dt_sada_term" id="dt_sada_term" size="11" maxlength="10" value="" >
              <input value="Buscar" onClick="buscar_agenda();" type="button">
              
            </td>
          </tr>
          </table>    
      </td>
      </tr>
      <tr>
       <td>
        <div id='tabela_agendamento'></div>
       </td>
      </tr> 
        </table>
        </td>
     </tr>            
     </td></tr>       
    </table>
<? } ?>      