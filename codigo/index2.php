<head><meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
<meta http-equiv="Content-Language" content="pt-br" />
<link href="estilo/abertura.css" rel="stylesheet" type="text/css"/>
<title>K N O L L</title>
</head>
<?php
   include_once("fontes/usuarios.func.php");
  
   $gdb      = new usuarios();
   $situacao = $gdb->vargetpost("situacao","0");
   $usuario  = $gdb->vargetpost("usuario");
   $senha    = $gdb->vargetpost("senha");
   $aviso    = "";
   
   if($situacao !='0'){   
      $gdb->select("","","",$usuario,$senha,"","");    
      if($gdb->linhas == '1'){
         $aviso ='ok';	
	  }else{ 
 	    $aviso   ="Usuario ou Senha incorreto !! Tente novamente !!";
   		$usuario ="";
   		$senha   ="";
	  }
   }
   /**/
?>
<form  name="frm" method="post">
    <input type="hidden" name="situacao" id="situacao" value="<?PHP print $situacao; ?>">    
    <input type="hidden" name="cd_usrs"  id="cd_usrs"  value="<?PHP if($situacao !='0') print $gdb->cd_usrs; ?>">        
    <input type="hidden" name="cd_clnt"  id="cd_clnt"  value="<?PHP if($situacao !='0') print $gdb->cd_clnt; ?>">            
    <body >    
     <script>
	  <!--
	   <?PHP if($aviso == 'ok'){ ?>
	         frm.action ='fontes/novo_layout.php';
	         frm.submit(); 			 
	   <?PHP } ?>
	  -->	 	 
	 </script>     
    </body>    
  <div align="center">  
  
    <table width="800">
      <tr><td colspan="4" align="center">
      <img src='imagens/frei.png'>
      <!--   
       <div align="center"><font size="+4" color="#FFFFFF" face="Tahoma, Geneva, sans-serif">S I A P I</font></div>
       <br>
       <div align="Center"><font size="-1" color="#FFFFFF" face="Tahoma, Geneva, sans-serif">Sistema de Acompanhamento dos Procedimentos Internos		</font>
       </div>-->
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
  frm.situacao.value =frm.situacao.value+1;
  frm.submit();
}

</script>