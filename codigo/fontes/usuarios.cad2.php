<?
   include_once("abertura.php");
   include_once("usuarios.func.php");
   print "<title> </title>\r\n";
   print "<h3>Usuários ( Manutenção ) </h3><hr>";
   print "<p class=msg>$msg</p>";
   
   $gdb = new usuarios();
   $cd_usrs  = $gdb->vargetpost("cd_usrs");
   $gdb->select($cd_usrs);  
   $sgdb = new gdb();      
?>
<form name="frm" method="post" action="usuarios.trans.php" onsubmit='return validarform(this);'>
<input type=hidden name=acao value="<? print 'u2'; ?>">
<input type="hidden" name="vl_menu"   value=""/>
<input type="hidden" name="vl_sbmenu" value=""/>

<table cellpadding=0 cellspacing=0>
   <input type=hidden name="cd_usrs" value="<? @print $gdb->cd_usrs; ?>"   >
   <tr>
      <td colspan=2 ><b>Informações do Usuário</b></td></tr>
   <tr>
     <td align=left>Codigo:</td>
     <? if (!$gdb->eof) { ?>
     <td>
        <b><? @print $gdb->cd_usrs; ?></b>
        <input type=hidden 
               name=cd_usrs 
               value="<? @print $gdb->cd_usrs; ?>"></td>
     <? } else { ?>
     <td><? @print "0" ; ?></td>
     <? } ?>
  </tr>
   <tr>
     <td align=left>Nome Completo :</td>
     <td><input type=text 
                name=nm_usrs  size="61" maxlength="80" 
                value="<? @print trim($gdb->nm_usrs); ?>" ></td>
  </tr>
   <tr>
     <td align=left>Email :</td>
     <td><textarea rows="3" cols="50" name="ds_email"><? @print trim($gdb->ds_email); ?></textarea></td>
  </tr>
  
   <tr>
     <td align=left>Tipo :</td>
     <td><? if($gdb->in_tipo == 'C') print 'Cliente'; 
	        else print 'Funcionário'; ?></td>
  </tr>
 <tr>
  <td colspan="2" class="titulo"><b>Horario de Trabalho</b></td>
 </tr> 
 <tr>
  <td >Matutino :</td>
  <td >Entrada: <input type="text"  name="hr_matt_entr"
                       size="6" maxlength="5"  readonly="readonly"
                       value="<? print $gdb->hr_matt_entr;?>"/>
       Saida: <input type="text"  name="hr_matt_saida"
                       size="6" maxlength="5"  readonly="readonly"
                       value="<? print $gdb->hr_matt_saida;?>"/>                        
  </td>
 </tr>   
 <tr>
  <td>Vespertino :</td>   
  <td >Entrada: <input type="text"  name="hr_vesp_entr"
                       size="6" maxlength="5"  readonly="readonly"
                       value="<? print $gdb->hr_vesp_entr;?>"/>
       Saida: <input type="text"  name="hr_vesp_saida"
                       size="6" maxlength="5"  readonly="readonly"
                       value="<? print $gdb->hr_vesp_saida;?>"/>                        
  </td>
 </tr> 
 <tr>
  <td colspan="2" class="titulo"><b>Dados para Acesso</b></td>
 </tr> 
   <tr>   
     <td align=left>Usuário :</td>
     <td><input type=text 
                name=nm_logn  
                size="11" maxlength="10" 
                value="<? @print trim($gdb->nm_logn); ?>" ></td>
  </tr>
   <tr>
     <td align=left>Senha :</td>
     <td><input type="password" 
                name=cd_pass  
                size="7" maxlength="6" 
                value="<? @print trim($gdb->cd_pass); ?>"></td>
  </tr>
   <tr>
     <td align=left>Repita a Senha :</td>
     <td><input type="password" 
                name=xcd_pass  
                size="7" maxlength="6" 
                value="<? @print trim($gdb->cd_pass); ?>"></td>
  </tr>
</table><br>
<input type=submit value="Gravar">
<input type=button onclick=history.back() value="Retornar">
</form>

<script>
<!--

function validarform(frm) {
   var i=0;
   var menus='NM_MENU';
   /*
   alert(frm.NM_MENU.length);   
   for (i = 0 ; i <frm.NM_MENU.length ; i++) {
       menus ='NM_MENU['+i+']';
       if(document.getElementById(menus).checked !="") 
	      frm.vl_menu.value =frm.vl_menu.value+document.getElementById(menus).value+',';
   }   
   for (i = 0 ; i <frm.SB_MENU.length ; i++) {
       if(frm.SB_MENU[i].checked !="")
	      frm.vl_sbmenu.value =frm.vl_sbmenu.value+frm.SB_MENU[i].value+',';
   }      
   */
   if (frm.nm_usrs.value==''){
      alert('Informe o nome completo do usuário !');
      return (false);
      }
   else if (frm.nm_logn.value==''){
      alert('Informe o usuário !');
      return (false);
      }
   else if (frm.cd_pass.value==''){
      alert('Informe a senha !');
      return (false);
      }
   else if (frm.xcd_pass.value==''){
      alert('Informe a repetição da senha !');
      return (false);
      }
   else if (frm.xcd_pass.value!=frm.cd_pass.value){
      alert('As senhas são diferentes!');
      return (false);
      }
   else return (true);
}
//-->
</script>