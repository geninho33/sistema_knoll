<?
   include_once("abertura.php");
   include_once("usuarios.func.php");
   print "<title> </title>\r\n";
   print "<h3> Usuários ( Consulta ) </h3><hr>";
   print "<p class=atencao>".$msg."</p>";

   $gdb = new usuarios();
   
   $situacao  = $gdb->vargetpost("situacao","0");
   $xcd_usrs  = $gdb->vargetpost("xcd_usrs");
   $xnm_usrs  = $gdb->vargetpost("xnm_usrs");
   $xcd_acss  = $gdb->vargetpost("xcd_acss");
   $xnm_logn  = $gdb->vargetpost("xnm_logn");
   $xcd_pass  = $gdb->vargetpost("xcd_pass");
   $xin_tipo  = $gdb->vargetpost("xin_tipo");
   $titulo    =  'Listagem de Usuários';   

   if ($situacao == "1") {

      $gdb->titulo_campo  ="Codigo,Nome,Usuário,,,,,Tipo,";      
      $gdb->visivel_campo ="v,v,v,f,f,f,f,v,f";      
      $gdb->alinha_campo ="c,e,e,,,,,c,";      
      $gdb->chave_campo ="0";      
      $gdb->select( $xcd_usrs,
                    $xnm_usrs,
                    $xcd_acss,
                    $xnm_logn,
                    $xcd_pass,
                    $xin_tipo  );
                    
      $gdb->print_tabela( $titulo );
   }

?>

<form name=frm method=post>
   <input type=hidden name=cd_usrs>
   <input type=hidden name=xgdb>
   <input type=hidden name=msg>
   <input type=hidden name=situacao value="<? print $situacao; ?>">
   <input type="hidden" name="ds_camh"       value="../../siapi/fontes/" >   
   <input type="hidden" name="visivel_campo" value="<? print $gdb->visivel_campo; ?>" >               
   <input type="hidden" name="alinha_campo"  value="<? print $gdb->alinha_campo; ?>" >                  
   <input type="hidden" name="chave_campo"   value="<? print $gdb->chave_campo; ?>" >                  
   <input type="hidden" name="titulo_campo"  value="<? print $gdb->titulo_campo; ?>" >                        
   <input type="hidden" name="titulo"        value="<? print $titulo; ?>" >                           
   
   <? if ($situacao == "0") { ?>
      <table cellspacing=0 class='text'>
         <tr><td colspan="2" class="titulo"><b>Informe os dados para consulta:</b></td></tr>
         <tr>
           <td align=right >Codigo : </td>
           <td><input type=text 
                      name=xcd_usrs size="7" 
                      maxlength="6" value="<? print $xcd_usrs; ?>" ></td>
         </tr>
         <tr>
           <td align=right>Usuário :</td>
           <td><input type=text 
                      name=xnm_logn  size="11" 
                      maxlength="10"  value="<? print $xnm_logn; ?>" >
         </tr>
         <tr>
           <td align=right>Nome :</td>
           <td><input type=text 
                      name=xnm_usrs  size="51" 
                      maxlength="50"  value="<? print $xnm_usrs; ?>" >
         </tr>
         <tr>
           <td align=right>Tipo :</td>
           <td>
             <select name="xin_tipo">
                <option value=''> </option>
                <option value='C'>Cliente</option>
                <option value='F'>Funcionário</option>
             </Select>
           </td>
            </tr>
      </table>
      <br>
     <input type=button value=Consultar        onclick="consultar(1)">
      <input type=button value="Novo Usuário"  onclick="escolher('-1')">
   <? } else { ?>
      <br>
      <input type=hidden name=xcd_usrs         value="<? print $xcd_usrs; ?>">
      <input type=hidden name=xnm_usrs         value="<? print $xnm_usrs; ?>">
      <input type=hidden name=xcd_acss         value="<? print $cd_acss;  ?>">
      <input type=hidden name=xnm_logn         value="<? print $xnm_logn; ?>">
      <input type=hidden name=xcd_pass         value="<? print $xcd_pass; ?>">
      <input type=hidden name=xin_tipo         value="<? print $xin_tipo; ?>">
      <input type=button value="Nova Consulta" onclick="consultar(0)">
      <input type=button value=Novo            onclick="escolher('-1')">
   <? } ?>
</form>
   <script  src="../../biblioteca/js/ajax.js"  ></script>
   <script> 
    <!--
   function OrdemColuna(ordem ){
      var nm_div  = 'id_tabela';
	  var ds_camh = frm.ds_camh.value;
      var ajax    = new AJAX(); 
	  var visivel_campo =frm.visivel_campo.value;
	  var alinha_campo  =frm.alinha_campo.value;	  
	  var chave_campo   =frm.chave_campo.value;	  
	  var titulo_campo  =frm.titulo_campo.value;	  
	  var titulo        =frm.titulo.value;	  	  
	  
	  ajax.Updater("../../biblioteca/php/print_tabela.manutencao.php?ordem="+ordem+"&ds_camh="+ds_camh+"&titulo_campo="+titulo_campo+"&alinha_campo="+alinha_campo+"&chave_campo="+chave_campo+"&visivel_campo="+visivel_campo+"&titulo="+titulo,nm_div,"get","Aguarde ...");
	  
   }
   
function escolher() {
   frm.cd_usrs.value = escolher.arguments[0];
   frm.action = "usuarios.cad.php";
   frm.submit();
}
function consultar() {
   frm.situacao.value = consultar.arguments[0];
   frm.submit();
}
//-->
</script>

