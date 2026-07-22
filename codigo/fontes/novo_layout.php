<head>
  <title>M A R L O N</title>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta http-equiv="Content-Language" content="pt-br" /> 
  <link href="../estilo/dropdown_one.css" rel="stylesheet" /> 
</head>
<?
 @header("Cache-Control: no-cache, must-revalidate, "); // HTTP/1.1
 @header("Expires: Mon, 26 Jul 1997 05:00:00 GMT, charset=utf-8"); // Date in the past

  error_reporting(E_ALL);
  ini_set('display_errors', '1');
  
  include_once('gdb.php'); 
  
  $gdb  = new gdb();  
  $sgdb = new gdb();  
    
  $situacao = $gdb->vargetpost("situacao","");  
  $cd_usrs  = $gdb->vargetpost("cd_usrs","");    
  
  $gdb->open(" select a.cd_menu, 
                        a.nm_menu, 
                        a.ds_menu,
			s.nm_usrs, 
   	      case when u.cd_menu is null Then 0
		   else 1 end as tem		  
		   from knoll_menu a 
                   join knoll_menu_usuario u
		     on u.cd_menu=a.cd_menu 
		    and u.cd_usrs=".$cd_usrs." 
                   join knoll_usuarios s
		     on s.cd_usrs=u.cd_usrs
	          where a.cd_menu_pai=0
	       order by a.cd_menu, a.nu_menu ");

?>
<body style="vertical-align:top" bgcolor="#CCC" >
  <div align="center"><br>
   <table border="0" cellspacing="0" align="center" cellpadding="0"  width="90%" >
   <tr><td bgcolor="#09F">   
       <div align="Center"><font size="-1" color="#FFFFFF" face="Tahoma, Geneva, sans-serif"><b>MARLON KNOLL</b> - Sistema de Gerenciamento de Assistência Técnica</font></div>
   </td></tr>
   <tr><td style="background-color:#FFFFFF" >&nbsp;</td></tr>         
   <? menu($cd_usrs,$gdb,$sgdb); ?>
   <tr><td>
<!--   <tr><td style="background-color:#FFFFFF" >&nbsp;</td></tr>-->
   <tr><td><iframe id="iframe_principal" height="500" width="100%" src="principal.php?cd_usrs=<? print $cd_usrs; ?>" style="border:hidden"></iframe></td></tr>   
   <tr><td style="background-color:#FFFFFF" >&nbsp;</td></tr>   
   </td></tr>
   <tr><td style="background-color:#09F" align="center">
      <font size="-1" color="#FFFFFF" face="Tahoma, Geneva, sans-serif">E  J  C   Informática</font>   
       <font size="-1" color="#000000" face="Tahoma, Geneva, sans-serif">
	     <? print ' | Usuário : '.$gdb->gs['NM_USRS'][0].' | Data : '.date('d/m/Y').' | Hora : '.date('H:i').' | IP:'.$_SERVER["REMOTE_ADDR"]; ?>
       </font></td></tr>      
   </table>       
  </div>
</body>

<script>
<!--
  function escolher(opc){
	frm.situacao.value =opc;
	frm.submit();
  }

 function in_frame(opcao,cd_usrs,modulo){
    if (opcao == 1 ) document.getElementById('iframe_principal').src = modulo+"?cd_usrs="+cd_usrs;
 }

function sair(http){
  // self.parent.frames.length =0;
  // self.parent.location.href ='../index.php';     
  //window.parent.frames.length =0;
  parent.parent.location.href = http;
  
}
-->
</script>

 <?
 function menu($cd_usrs, $mgdb, $sgdb ){?>   
  <tr> 
    <td align="center" colspan="4">
      <div class="menu" align="center">
        <ul>
         <? for($x=0;$x<$mgdb->linhas;$x++){ ?>                     
          <li style="text-align:center"><a href="#" ><b><? print $mgdb->gs['NM_MENU'][$x]; ?></b></a><!--[if IE 7]><!--><!--<![endif]-->
  
          <!--[if lte IE 6]><table><tr><td><![endif]-->
               <? $sgdb->open(" select a.cd_menu,
			               a.nm_menu,
				       a.ds_menu,
				       a.nm_modl,
				       a.nm_parm1,
                             case when u.cd_menu is null Then 0
                                  else 1 end as tem		  
	                          from knoll_menu a 
	                          join knoll_menu_usuario u
	                            on u.cd_menu=a.cd_menu 
	                           and u.cd_usrs=".$cd_usrs." 
	                         where a.cd_menu_pai=".$mgdb->gs['CD_MENU'][$x]."    
	                      order by a.nu_menu  ");
          
           if( $sgdb->linhas>0 ){ ?>
              <ul style="text-align:left" >
           <? for($y=0;$y<$sgdb->linhas;$y++){?>                 
               <li>
                 <a href="#" 
                    title="<? print $sgdb->gs['DS_MENU'][$y]; ?>"  
                    onClick="in_frame(1,<? print $cd_usrs; ?>,'<? print $sgdb->gs['NM_MODL'][$y]; ?>' );" >
                    <? print $sgdb->gs['NM_MENU'][$y]; ?>
                 </a>
               </li>
           <? } ?>   
              </ul>             
        <? } ?>                
          <!--[if lte IE 6]></td></tr></table></a><![endif]-->
  
          </li>
    <? } ?>                            
        </ul>
		<ul><li style="text-align:center"><a href="#" onClick="sair('../index.php?desligar=1&cd_usrs=<? print $cd_usrs; ?>');">Sair<!--[if IE 7]><!--></a></li></ul>        
      </div>
    </td>                           
  </tr>
<? } ?>                