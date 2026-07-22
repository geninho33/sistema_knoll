<?
   include_once("abertura.php");
   include_once("usuarios.func.php");
   include_once("combos.php");   
   print "<title> </title>\r\n";
   print "<h3>Usuários ( Manutenção )</h3><hr>";
   
   $gdb = new usuarios();
   $msg    = $gdb->vargetpost("$msg");
   print "<p class=msg>$msg</p>";
      
   $cd_usrs = $gdb->vargetpost("cd_usrs");
   $gdb->select($cd_usrs);
   
   $mgdb = new gdb();    
   $sgdb = new gdb();      
   $mgdb->open(" select a.cd_menu, 
                        a.nm_menu, 
						a.ds_menu, 
			   case when u.cd_menu is null Then 0
					else 1 end as tem		  
					from knoll_menu a 
			   left join knoll_menu_usuario u
					  on u.cd_menu=a.cd_menu 
					 and u.cd_usrs=".$cd_usrs." 						
				  where a.cd_menu_pai=0    
				  order by a.cd_menu,
				  a.nu_menu ");
?>
<form name="frm" method="post" action="usuarios.trans.php" onsubmit='return validarform(this);'>
<input type=hidden name=acao value="<? print ($gdb->linhas ==0) ? 'i' : 'u'; ?>">
<input type="hidden" name="vl_menu"   value=""/>
<input type="hidden" name="vl_sbmenu" value=""/>


<table cellpadding="0" cellspacing="0" >
   <input type=hidden name=cd_usrs value="<? @print $gdb->cd_usrs; ?>"   >
   <tr>
      <td colspan=2 class="titulo" ><b>Informacoes do Usuario</b></td></tr>
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
     <td>
       <textarea rows="2" cols="75" name="ds_email"><? @print trim($gdb->ds_email); ?></textarea><br/>
       <b>Obs.: Para cadastrar varios emails, basta separar, por (;).</b><br/> Ex.: nome1@provedor1.com; nome2@provedor2.com 
     </td>
  </tr>
  <tr>
    <td align=left colspan="2">Tipo :
      <select name="in_tipo">
          <option value='C' <? if($gdb->in_tipo == 'C') print 'Selected'; ?> >Cliente</option>
          <option value='F' <? if($gdb->in_tipo == 'F') print 'Selected'; ?>>Funcion�rio</option>
      </Select>
   |&ensp;&ensp;Setor ou Desativacao :<? combo_setor('cd_depr',$gdb->cd_depr,'desativa'); ?></td>
   </tr>           
 <tr>
  <td colspan="2" class="titulo"><b>Horario de Trabalho</b></td>
 </tr> 
 <tr>
  <td colspan="2">Periodo Matutino das: <input type="text"  name="hr_matt_entr" id="hr_matt_entr"
                       size="6" maxlength="5" 
                       value="<? print $gdb->hr_matt_entr;?>"/>
       às <input type="text"  name="hr_matt_saida" id="hr_matt_saida"
                       size="6" maxlength="5" 
                       value="<? print $gdb->hr_matt_saida;?>"/>                        
  |&ensp;&ensp;Periodo Vespertino das: <input type="text"  name="hr_vesp_entr" id="hr_vesp_entr"
                       size="6" maxlength="5" 
                       value="<? print $gdb->hr_vesp_entr;?>"/>
       às<input type="text"  name="hr_vesp_saida" id="hr_vesp_saida"
                       size="6" maxlength="5" 
                       value="<? print $gdb->hr_vesp_saida;?>"/>                        
  </td>
 </tr> 
 <tr>
  <td colspan="2" class="titulo"><b>Dados para Acesso</b></td>
 </tr> 
   <tr>   
     <td align=left colspan="2">Usuário :
         <input type=text 
                name=nm_logn  
                size="11" maxlength="10" 
                value="<? @print trim($gdb->nm_logn); ?>" >|&ensp;&ensp;Senha :
         <input type="password" 
                name=cd_pass  
                size="7" maxlength="6" 
                value="<? @print trim($gdb->cd_pass); ?>">  Repita a Senha :
         <input type="password" 
                name=xcd_pass  
                size="7" maxlength="6" 
                value="<? @print trim($gdb->cd_pass); ?>"></td>
  </tr>
  <tr>
   <td colspan="2" class="titulo"><b>Acessos do Usuário</b></td>
  </tr>  
  <tr>
  <td colspan="2">
<? 
for($x=0;$x<$mgdb->linhas;$x++){
    $sgdb->open(" select a.cd_menu, 
						 a.nm_menu,
						 a.ds_menu,
						 a.nm_modl,
						 a.nm_parm1,
			   case when u.cd_menu is null Then 0
					else 1 end as tem		  
					from knoll_menu a 
			   left join knoll_menu_usuario u
					  on u.cd_menu=a.cd_menu 
					 and u.cd_usrs=".$cd_usrs." 
				   where a.cd_menu_pai=".$mgdb->gs['CD_MENU'][$x]."    
				order by a.nu_menu ");
?>   
        <table border="0" cellspacing="0" align="center" cellpadding="0" width="100%">
        <tr bordercolor="#FFFFFF" >
            <td background="../imagens/botao1.jpg" 
                style="border:#FFFFFF;cursor:pointer;" >
             	<img src='../imagens/fechar.bmp' 
                     onClick="submenu('<? print $mgdb->gs['NM_MENU'][$x]; ?>');"
                     id='img<? print $mgdb->gs['NM_MENU'][$x]; ?>' 
                     border=0><input type="checkbox"                      
                                     <? if($mgdb->gs['TEM'][$x] == 1) print 'checked="checked"';  ?> 
                                     id="<? print 'NM_MENU['.$x.']'; ?>" 
                                     name="<? print 'NM_MENU['.$x.']'; ?>"
                                     value="<? print $mgdb->gs['CD_MENU'][$x]; ?>"
                                     onclick="check_menu('<? print $x; ?>',
                                                         '<? print $sgdb->linhas; ?>');"/>
                                     &nbsp;<? print $mgdb->gs['NM_MENU'][$x].' ( '.$mgdb->gs['DS_MENU'][$x].' )'; ?>
             </td>
         </tr>
         </table> 
         <? 
		    if($sgdb->linhas>0){?>
              <div id='div<? print $mgdb->gs['NM_MENU'][$x]; ?>' 
                   style='display<? if( $mgdb->gs['TEM'][$x]==0) print ':none'; ?>'>
               <table border="0" cellspacing="0" align="center" cellpadding="0" width="100%">
			<? for($y=0;$y<$sgdb->linhas;$y++){?>                           
                  <tr bordercolor="#FFFFFF">
                     <td background="../imagens/botao3.jpg" 
                         bgcolor="white" style="border:#FFFFFF"
                         onMouseOver="mOvr(this,'#e9e9e9');" onMouseOut="mOut(this,'white');"
                         onClick=""
                      >&nbsp&nbsp <img src='<? if( ($y+1)==$sgdb->linhas ) 
					                              print "../imagens/final.gif";
					                           else print "../imagens/divisor.gif"; 
											?>' 
                                   border=0><input type="checkbox" 
                                     			   <? if($sgdb->gs['TEM'][$y]) print 'checked="checked"'; ?>
                                     			   id="<? print 'SB_MENU['.$x.$y.']'; ?>" 
                                                   name="<? print 'SB_MENU['.$x.$y.']'; ?>"
												   value="<? print $sgdb->gs['CD_MENU'][$y]; ?>"
                                                   onclick="check_sub('<? print $x.$y; ?>','<? print $x; ?>')"/>&nbsp;<? print $sgdb->gs['NM_MENU'][$y].' ( '.$sgdb->gs['DS_MENU'][$y].' )'; ?></td>
                  </tr>
            <? } ?>
             </table>
            </div>         
		<? } ?>
                 
   <? }?>    
   </td>
  </tr>
</table><br>
<input type=submit value="Gravar">
<input type="button" onclick="excluir()"  value="Excluir">
<input type="button" onclick="history.back()" value="Retornar">
</form>

<script>
$(document).ready(function(){	   
      $("#hr_matt_entr").mask("99:99");   	
	  $("#hr_matt_saida").mask("99:99");   
      $("#hr_vesp_entr").mask("99:99");   	
	  $("#hr_vesp_saida").mask("99:99");   
	  
});    	
</script>


<script>
<!--
function submenu(id){
  if (document.all['div'+id].style.display == 'none'){
    eval('div'+id).style.display = '';
    document.all['img'+id].src = "../imagens/abrir.bmp";
  }
  else {
    eval('div'+id).style.display = 'none';
    document.all['img'+id].src = "../imagens/fechar.bmp";
  }
}

function mOvr(src,clrOver) {
    src.style.cursor = 'pointer;';
    src.style.color ='#FF0000';
}

function mOut(src,clrIn) {
    src.style.cursor = 'pointer;';
	src.style.color ='';
}

function check_menu(menu,nsub){
  var x=0; 
  var submenu ='';
  var menus ='NM_MENU['+menu+']';
  
  if (document.getElementById(menus).checked ){
    document.getElementById(menus).checked='checked';
	 for(x=0;x<nsub;x++){
	   submenu ='SB_MENU['+menu+x+']';
	   document.getElementById(submenu).checked='checked';
	}
  }
  else {
    document.getElementById(menus).checked='';
	for(x=0;x<nsub;x++){
	   submenu ='SB_MENU['+menu+x+']';	
	   document.getElementById(submenu).checked='';
	}	
  }
}

function check_sub(submenu,menu){
  menu    ='NM_MENU['+menu+']';  
  submenu ='SB_MENU['+submenu+']';  

  if ( document.getElementById(submenu).checked !='' ){
    if (document.getElementById(menu).checked =='' ) 
	    document.getElementById(menu).checked='checked';
  }	
}

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
      alert('Informe o nome completo do usuariorio !');
      return (false);
      }
   else if (frm.nm_logn.value==''){
      alert('Informe o usuario !');
      return (false);
      }
   else if (frm.cd_pass.value==''){
      alert('Informe a senha !');
      return (false);
      }
   else if (frm.xcd_pass.value==''){
      alert('Informe a repeticao da senha !');
      return (false);
      }
   else if (frm.xcd_pass.value!=frm.cd_pass.value){
      alert('As senhas sao diferentes!');
      return (false);
      }
   else return (true);
}

function excluir() {
   if (confirm("Nao sera possivel desfazer essa operecao. Tem certeza que deseja excluir?")) {
      frm.acao.value = 'd';
      frm.action = 'usuarios.trans.php';
      frm.submit();
   }
}
//-->
</script>