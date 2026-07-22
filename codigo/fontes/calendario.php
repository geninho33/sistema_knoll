<?php

  ini_set('display_errors', 1);
  error_reporting(E_ALL);

  include_once('abertura.php');   
  include_once('gdb.php');     
  setlocale (LC_ALL, 'ptb_ptb');
  print "<title >Calendario</title>";    
  
  //  O formato é  mês/dia/ano
  $gdb  = new gdb(); 
  $gdb2 = new gdb();
  
  $dt_date =$gdb->vargetpost("date_sistema");  
  $cd_usrs =$gdb->vargetpost("cd_usrs");  

  
  $gdb2->open(" SELECT s.idser AS codigo, 
                       c.nome AS cliente, 
					   DATE_FORMAT( s.dt_sada,  '%d/%m/%Y' ) AS Saida, 
					   DATE_FORMAT( s.dt_entr,  '%d/%m/%Y' ) AS Entrada, 
					   c.bairro,
					   c.municipio,
					   f.nome as tecnico
				 FROM ( knoll_servicos s, knoll_clientes c, knoll_usuarios u,knoll_funcionario f )
				WHERE s.idcli = c.idcli
				  AND s.in_delt <>  'S'
				  AND u.cd_usrs= $cd_usrs
				  AND s.usuario=u.nm_logn	
				  AND f.idfun=s.idfun
			 ORDER BY s.idser DESC 
			    LIMIT 0 , 10 ");  
  

  if( $dt_date =="" ){
      $dt_date =substr(date("d/m/Y"),3,2)."/01/".substr(date("d/m/Y"),6,4);
	  
	  if(date("m")=='12') $dt_prxm ="01/01/".(date("Y")+1);
	  else (date("m")<9)?$dt_prxm ='0'.(date("m")+1)."/01/".(date("Y")):$dt_prxm =(date("m")+1)."/01/".(date("Y")); 
	  
	  if(date("m")=='01') $dt_antr =(date("m")-1)."/01/".(date("Y")-1);
	  else (date("m")<10)?$dt_antr ='0'.(date("m")-1)."/01/".(date("Y")):$dt_antr =(date("m")-1)."/01/".(date("Y"));	  
	  
  }else{
  
	  if(date("m",strtotime($dt_date))=='12') $dt_prxm ="01/01/".(date("Y",strtotime($dt_date))+1);
	  else (date("m",strtotime($dt_date))<9)?$dt_prxm ='0'.(date("m",strtotime($dt_date))+1)."/01/".(date("Y",strtotime($dt_date))):$dt_prxm =(date("m",strtotime($dt_date))+1)."/01/".(date("Y",strtotime($dt_date))); 
	  
	  if(date("m",strtotime($dt_date))=='01') $dt_antr ="12/01/".(date("Y",strtotime($dt_date))-1);
	  else (date("m",strtotime($dt_date))<10)?$dt_antr ='0'.(date("m",strtotime($dt_date))-1)."/01/".(date("Y",strtotime($dt_date))):$dt_antr =(date("m",strtotime($dt_date))-1)."/01/".(date("Y",strtotime($dt_date)));	  
  
  }
  
  $dia_semana = date("w", strtotime($dt_date));   
  
  $nm_mes     = array("Meses",
                      "Janeiro",
                      "Fevereiro",
					  "Marco",
					  "Abril",
					  "Maio",
					  "Junho",
					  "Julho",
					  "Agosto",
					  "Setembro",
					  "Outubro",
					  "Novembro",
					  "Dezembro");
					   
  $mes        = substr($dt_date,0,2);
  $ano        = substr($dt_date,6,4);
  $n_dias     = "1";
  
  $dia =array();
  $efeito =array();  
  
  for($d=0; $d<42; $d++){
  
     if( $d>=$dia_semana && $n_dias<32 ){
	 
		   if(strlen($n_dias)==1) $dias ="0".$n_dias;	   
		   else $dias =$n_dias;
		   
		   $dt_teste =date("l",strtotime($mes."/".$dias."/".$ano) ); 
		   
		   if( ( $mes == "01" || 
		         $mes == "03" || 
				 $mes == "05" || 
			     $mes == "07" || 
				 $mes == "08" || 
				 $mes == "10" || 
				 $mes == "12" ) || 
			    ($dias<29 && $mes =="02") || 
				($dias<31 && $mes !="02" )  ) {				
				    
				$gdb->open( "SELECT cli.NOME as assunto, 
				                    cli.BAIRRO as descricao 
				               FROM knoll_servicos as ser, 
				                    knoll_clientes as cli 
				              WHERE ser.idcli = cli.idcli 
				                AND IDFUN = '$cd_usrs' 
				                AND DT_ENTR ='$ano-$mes-$dias' " );

			    if( $dt_teste == 'Sunday' || $dt_teste == 'Saturday' ) $efeito[$d] =" bgcolor='#33CCFF' "; 	   		   
			    
			    //if( $dt_teste == 'Saturday' ) $efeito[$d] =" bgcolor='#33CCFF' "; 
			    
			    if( date("m/d/Y")==($mes."/".$dias."/".$ano) ) $efeito[$d] =" bgcolor='#FFFF00' ";
			    
				if( $gdb->linhas>0 ){
				    $efeito[$d] =" bgcolor='#FFCC66' title='Assunto : ".$gdb->gs['ASSUNTO'][0]." |  Descricao :".$gdb->gs['DESCRICAO'][0]."'";
				}else{
				    $efeito[$d] = " bgcolor='#FFCC66' ";
				} 
				$dia[$d] ="<b>".$dias."</b>";	
				
				
		   } else {
		       $dia[$d] ="";		   
		       $efeito[$d] = " bgcolor='#FFCC66' ";
		   }
		   
		   $n_dias++;	   		   
     }
  }
?>

<form name="frm" method="post" >
  <input type="hidden" name="dt_prxm" value="<? print $dt_prxm; ?>" >
  <input type="hidden" name="dt_antr" value="<? print $dt_antr; ?>">  
  <input type="hidden" name="date_sistema" >  
  <input type="hidden" name="cd_usrs" value="<? print $cd_usrs; ?>" >      
  <table>
    <tr><td>
    <table>
         <tr>
             <td colspan="3" 
                   align="center"
                   width="75" 
                   onClick="anterior_mes()"               
                   onMouseOver="mOvr(this,'#e9e9e9');"
                   onMouseOut="mOut(this,'white');" 
                   align="right" ><img src="../imagens/Seta_voltar.jpg" /> </td>                     
           <td align="center" width="85"><b><? print $nm_mes[date("n", strtotime($dt_date))]."/".$ano;?></b></td> 
          <td colspan="3" 
                   align="center" 
                   width="75" 
                    onMouseOver="mOvr(this,'#e9e9e9');"
                    onMouseOut="mOut(this,'white');"
                   onClick="proximo_mes();" align='left'><img src="../imagens/Seta_frente.jpg"/></td> 
         </tr>
         <tr><td colspan="7" align="center"><b>Dias da Semana</b></td></tr>
	<!-- </table><table>-->
    <tr bgcolor="#CCCCCC">
       <td align="center" width="30" ><b>DOM</b></td>
       <td align="center" width="30"><b>SEG</b></td>
       <td align="center" width="30"><b>TER</b></td>
       <td align="center" width="30"><b>QUA</b></td>
       <td align="center" width="30"><b>QUI</b></td>
       <td align="center" width="30"><b>SEX</b></td>
       <td align="center" width="30"><b>SAB</b></td>                     
    </tr>     
    <tr>
       <td align="center" id="d1" <? if( isset( $efeito[0] ) ) print $efeito[0];?> >&nbsp;<? if( isset( $dia[0] ) ) print $dia[0];?></td>
       <td align="center" id="d2" <? if( isset( $efeito[1] ) ) print $efeito[1];?> >&nbsp;<? if( isset( $dia[1] ) ) print $dia[1];?></td>
       <td align="center" id="d3" <? if( isset( $efeito[2] ) ) print $efeito[2];?> >&nbsp;<? if( isset( $dia[2] ) ) print $dia[2];?></td>
       <td align="center" id="d4" <? if( isset( $efeito[3] ) ) print $efeito[3];?> >&nbsp;<? if( isset( $dia[3] ) ) print $dia[3];?></td>
       <td align="center" id="d5" <? if( isset( $efeito[4] ) ) print $efeito[4];?> >&nbsp;<? if( isset( $dia[4] ) ) print $dia[4];?></td>
       <td align="center" id="d6" <? if( isset( $efeito[5] ) ) print $efeito[5];?> >&nbsp;<? if( isset( $dia[5] ) ) print $dia[5];?></td>
       <td align="center" id="d7" <? if( isset( $efeito[6] ) ) print $efeito[6];?> >&nbsp;<? if( isset( $dia[6] ) ) print $dia[6];?></td>
    </tr>     
    <tr>
       <td align="center" id="d8" <? print $efeito[7];?>  >&nbsp;<? print $dia[7];?></td>
       <td align="center" id="d9" <? print $efeito[8];?> >&nbsp;<? print $dia[8];?></td>
       <td align="center" id="d10" <? print $efeito[9];?> >&nbsp;<? print $dia[9];?></td>
       <td align="center" id="d11" <? print $efeito[10];?> >&nbsp;<? print $dia[10];?></td>
       <td align="center" id="d12" <? print $efeito[11];?> >&nbsp;<? print $dia[11];?></td>
       <td align="center" id="d13" <? print $efeito[12];?> >&nbsp;<? print $dia[12];?></td>
       <td align="center" id="d14" <? print $efeito[13];?> >&nbsp;<? print $dia[13];?></td>
    </tr>     
    <tr>
       <td align="center" id="d15" <? print $efeito[14];?> >&nbsp;<? print $dia[14];?></td>
       <td align="center" id="d16" <? print $efeito[15];?> >&nbsp;<? print $dia[15];?></td>
       <td align="center" id="d17" <? print $efeito[16];?> >&nbsp;<? print $dia[16];?></td>
       <td align="center" id="d18" <? print $efeito[17];?> >&nbsp;<? print $dia[17];?></td>
       <td align="center" id="d19" <? print $efeito[18];?> >&nbsp;<? print $dia[18];?></td>
       <td align="center" id="d20" <? print $efeito[19];?>  >&nbsp;<? print $dia[19];?></td>
       <td align="center" id="d21" <? print $efeito[20];?> >&nbsp;<? print $dia[20];?></td>
    </tr>     
    <tr>
       <td align="center" id="d22" <? print $efeito[21];?> >&nbsp;<? print $dia[21];?></td>
       <td align="center" id="d23" <? print $efeito[22];?> >&nbsp;<? print $dia[22];?></td>
       <td align="center" id="d24" <? print $efeito[23];?> >&nbsp;<? print $dia[23];?></td>
       <td align="center" id="d25" <? print $efeito[24];?> >&nbsp;<? print $dia[24];?></td>
       <td align="center" id="d26" <? print $efeito[25];?> >&nbsp;<? print $dia[25];?></td>
       <td align="center" id="d27" <? print $efeito[26];?> >&nbsp;<? print $dia[26];?></td>
       <td align="center" id="d28" <? print $efeito[27];?> >&nbsp;<? print $dia[27];?></td>
    </tr>     
    <tr>
       <td align="center" id="d29" <? if( isset( $efeito[28] ) ) print $efeito[28];?> >&nbsp;<? if( isset( $dia[28] ) ) print $dia[28];?></td>
       <td align="center" id="d30" <? if( isset( $efeito[29] ) ) print $efeito[29];?> >&nbsp;<? if( isset( $dia[29] ) ) print $dia[29];?></td>
       <td align="center" id="d31" <? if( isset( $efeito[30] ) ) print $efeito[30];?> >&nbsp;<? if( isset( $dia[30] ) ) print $dia[30];?></td>
       <td align="center" id="d32" <? if( isset( $efeito[31] ) ) print $efeito[31];?> >&nbsp;<? if( isset( $dia[31] ) ) print $dia[31];?></td>
       <td align="center" id="d33" <? if( isset( $efeito[32] ) ) print $efeito[32];?> >&nbsp;<? if( isset( $dia[32] ) ) print $dia[32];?></td>
       <td align="center" id="d34" <? if( isset( $efeito[33] ) ) print $efeito[33];?> >&nbsp;<? if( isset( $dia[33] ) ) print $dia[33];?></td>
       <td align="center" id="d35" <? if( isset( $efeito[34] ) ) print $efeito[34];?> >&nbsp;<? if( isset( $dia[34] ) ) print $dia[34];?></td>
    </tr>     
    <tr>
       <td align="center" id="d36" <? if( isset( $efeito[35] ) ) print $efeito[35];?> >&nbsp;<? if( isset( $dia[35] ) ) print $dia[35];?></td>
       <td align="center" id="d37" <? if( isset( $efeito[36] ) ) print $efeito[36];?> >&nbsp;<? if( isset( $dia[36] ) ) print $dia[36];?></td>
       <td align="center" id="d38" <? if( isset( $efeito[37] ) ) print $efeito[37];?> >&nbsp;<? if( isset( $dia[37] ) ) print $dia[37];?></td>
       <td align="center" id="d39" <? if( isset( $efeito[38] ) ) print $efeito[38];?> >&nbsp;<? if( isset( $dia[38] ) ) print $dia[38];?></td>
       <td align="center" id="d40" <? if( isset( $efeito[39] ) ) print $efeito[39];?> >&nbsp;<? if( isset( $dia[39] ) ) print $dia[39];?></td>
       <td align="center" id="d41" <? if( isset( $efeito[40] ) ) print $efeito[40];?> >&nbsp;<? if( isset( $dia[40] ) ) print $dia[40];?></td>
       <td align="center" id="d42" <? if( isset( $efeito[41] ) ) print $efeito[41];?> >&nbsp;<? if( isset( $dia[41] ) ) print $dia[41];?></td>
    </tr>     
    <!-- </table><br><table>-->
     <tr>
       <td width="30" bgcolor="#33CCFF" ></td>
       <td colspan="6" align="left" width="205"><b>Sabado e Domigo</b></td>                         
     </tr>
     <tr>
       <td width="30"  bgcolor="#33CC33" ></td>
       <td colspan="6" align="left" width="205"><b>Feriado ou Folga</b></td>                 
     </tr>     
     <tr>
       <td width="30"  bgcolor="#FFCC66" ></td>
       <td colspan="6" align="left" width="205"><b>Eventos ou Agenda</b></td>
     </tr>
    </table> 
   </td>
   <td valign="top">
    <table style="background-color:#FFF" >
      <tr><td colspan="7" align="center"><b>Suas 10 &uacute;ltimas ordens de servi&ccedil;os</b></td></tr>
      <tr style="background-color:#CCC">
        <td align="center">Servico</td>
        <td align="center">Cliente</td>
        <td align="center">Data</td>        
        <td align="center">Bairro</td>                
        <td align="center">Municipio</td>             
        <td align="center">Tecnico</td>                                
      </tr>               
      <? foreach( $gdb2->gs['CODIGO'] as $key=>$value ){ ?>      
          <tr>
            <td align="center"><a href="servico.form.php?nu_serv=<? print $value; ?>" >
              <b><? print $value; ?></b></a>
            </td>
            <td align="left"><? print $gdb2->gs['CLIENTE'][$key]; ?></td>
            <td align="center"><? print $gdb2->gs['SAIDA'][$key]; ?></td>        
            <td align="left"><? print $gdb2->gs['BAIRRO'][$key]; ?></td>                
            <td align="left"><? print $gdb2->gs['MUNICIPIO'][$key]; ?></td>                        
            <td align="left"><? print $gdb2->gs['TECNICO'][$key]; ?></td>                                        
          </tr>   
      <? } ?>
    </table>      
   </td>
   </tr>   
   </table> 
</form>

<script>
<!--
  function proximo_mes(){
     frm.date_sistema.value =frm.dt_prxm.value;
	 frm.submit();
  }
  
  function anterior_mes(){
     frm.date_sistema.value =frm.dt_antr.value;
	 frm.submit();  
  }  

  function mOvr(src,clrOver) {
    src.style.cursor = 'pointer';
    src.style.color ='#FF0000';
  }

  function mOut(src,clrIn) {
    src.style.cursor = 'pointer';
	src.style.color ='';
  }  
-->
</script>