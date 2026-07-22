<head><meta http-equiv="Content-Type" content="text/html; charset=windows-1252">
<meta http-equiv="Content-Language" content="pt-br" />
<link href="estilo/abertura.css" rel="stylesheet" type="text/css"/>
<title>K N O L L</title>
</head>
<?php
@header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
@header("Expires: Mon, 26 Jul 1997 05:00:00 GMT"); // Date in the past

/*
print '<pre>';
print_r($GLOBALS);
print '</pre>';
*/
   include_once("fontes/usuarios.func.php");
   include_once("../ejc/admin/fontes/sessao.php");  
     
   $gdb      = new usuarios();
   $aviso    = "";
   $situacao = $gdb->vargetpost("situacao","0");
   $usuario  = $gdb->vargetpost("usuario");
   $senha    = $gdb->vargetpost("senha");
   $desligar = $gdb->vargetpost("desligar",0);
   $cd_usrs  = $gdb->vargetpost("cd_usrs",0);

   if( $desligar == 1 ){
	  encerrar_sessao('knoll_', $cd_usrs ); 
   }
   

   if ( isset( $_SERVER["HTTP_X_FORWARDED_FOR"] ) ) $ip = $_SERVER["HTTP_X_FORWARDED_FOR"];
   else $ip = $_SERVER["REMOTE_ADDR"];
   // $ip = split('[.]', $ip );
   $ip = str_split('[.]', $ip );
   
   if($situacao !='0'){   
      $gdb->select("","","",$usuario,$senha,"","");    
      if( $gdb->linhas == '1' ){
		  
		  $hr_matt_entr  = substr($gdb->gs['HR_MATT_ENTR'][0],0,2).substr($gdb->gs['HR_MATT_ENTR'][0],3,2);
		  $hr_matt_saida = substr($gdb->gs['HR_MATT_SAIDA'][0],0,2).substr($gdb->gs['HR_MATT_SAIDA'][0],3,2);
		  $hr_vesp_entr  = substr($gdb->gs['HR_VESP_ENTR'][0],0,2).substr($gdb->gs['HR_VESP_ENTR'][0],3,2);
		  $hr_vesp_saida = substr($gdb->gs['HR_VESP_SAIDA'][0],0,2).substr($gdb->gs['HR_VESP_SAIDA'][0],3,2);				  
		  // print 'Horas da tarde :'.$hr_vesp_entr.' e '.$hr_vesp_saida.'<br>';
		  // print 'Date :'.date('Hi');
		  
		  if( ( $hr_matt_entr<=date('Hi') && $hr_matt_saida>=date('Hi') ) || 
		      ( $hr_vesp_entr<=date('Hi') && $hr_vesp_saida>=date('Hi') ) && 
			  ( date('w') !=0 && date('w') !=6 ) ) $aviso ='ok';  
			  // verificando o hor�rio de trabalho sem o s�bado e domingo.
			  
         else if( $hr_matt_entr<=date('Hi') && $hr_matt_saida>=date('Hi') && date('w') ==6 ) $aviso ='ok'; 	
		      // Verificando o hor�rio de trabalho no Sabado		 
			  
		 else if ($usuario == 'gao' ) $aviso ='ok'; 	
		      // Verificando os usuarios autorizados		
			  
         else $aviso ='O usu�rio est� fora da hora de trabalho !';	
		 
	  }else{ 
 	    $aviso   ="Usuario ou Senha incorreto !! Tente novamente !!";
   		$usuario ="";
   		$senha   ="";
	  }
   }
   /**/
?>
<form  name="frm" method="post" action="">
    <input type="hidden" name="situacao" id="situacao" value="<?PHP print $situacao; ?>">    
    <input type="hidden" name="cd_usrs"  id="cd_usrs"  value="<?PHP if($situacao !='0') print $gdb->cd_usrs; ?>">        
    <input type="hidden" name="cd_clnt"  id="cd_clnt"  value="<?PHP if($situacao !='0') print $gdb->cd_clnt; ?>">            
    <body >    
     <script>
	  <!--
	   <?PHP
	    if( $aviso == 'ok' ){
		    iniciar_sessao('knoll_', $gdb->gs['CD_USRS'][0] );
			?>
	         frm.action ='fontes/novo_layout.php';
	         frm.submit(); 			 
   <?PHP } ?>
	  -->	 	 
	 </script>     
    </body>    
  <div align="center">  
  
    <table width="800">
      <tr>
       <td colspan="4" align="center">
         <img src='imagens/subzeroWolf.png'>
       </td>
      </tr>
      <tr> 
       <td colspan="2" align="center">
         <img src='imagens/viking.png'>
       </td>
    </tr>
    </table>
    <br>
    <table width="800" class="table_externa">  
      <!-- linha de ajuste de distância entre a logo e o usuário e senha -->
      <tr height="50" ><td colspan="4" align="center" style="color:#FF0000" >&nbsp;<?php print $aviso; ?></td></tr>            
      
      <tr>
        <td width="200" >&nbsp;</td>
        <td width="200" align="right">Usuario :</td>
        <td width="200" align="left"> <input type="text" name="usuario" id="usuario" size="9" maxlength="8" value="<?php print $usuario; ?>"/></td>      
        <td>&nbsp;</td>
      </tr>
      <tr > 
        <td width="200" >&nbsp;</td>    
        <td width="200" align="right" >Senha   :</td>
        <td width="200" align="left" >
            <input type="password"  name="senha" id="senha" size="9"  maxlength="8"  value="<?PHP print $senha; ?>"/> 
         	<input type="button"     name="botao" value="OK"  onClick="login()" /> 
         </td>
        <td width="200">&nbsp;</td>                           
      </tr>
    </table>  
    </div>
  </form>  
  
<script>

function login(){
  if(frm.usuario.value == ''){
	 alert('Informe o usuario !');
	 return false; 
  }else if(frm.senha.value == ''){
	 alert('Informe a senha !');
	 return false; 
  }else{	
    frm.situacao.value =frm.situacao.value+1;
    frm.submit();
  }
}

</script>