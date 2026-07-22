<?
   include_once('usuarios.func.php');
   //include_once('clientes.func.php');

   function combo_usuarios( $nome='cd_usrs' , $cd_usrs='' ){
   
       $xgdb = new usuarios();
       
       $xgdb->open(" Select u.cd_usrs, 
	                        u.nm_usrs,
			                d.nm_depr as setor
		               from knoll_usuarios u,
			                knoll_departamento d
		              where u.cd_depr=d.cd_depr
					    and u.in_tipo<>'c'
		           order by d.nm_depr, u.nm_usrs  ");
       
       $vr_totl =0;
       
       print '<select name="'.$nome.'" > \r\n ';
       print '<option value=""></option> \r\n ';
       for ( $vr_totl=0 ; $vr_totl<$xgdb->linhas ; $vr_totl++ ) {
           print "<option value=".$xgdb->gs['CD_USRS'][$vr_totl];
           if($xgdb->gs['CD_USRS'][$vr_totl]==$cd_usrs) print ' selected';
           print "> <b>( ".$xgdb->gs['SETOR'][$vr_totl]." )</b> ".$xgdb->gs['NM_USRS'][$vr_totl]."</option> \r\n ";
       }
       print '</select>';
   }
   
   function combo_solicitante( $nome='cd_usrs_solc',$cd_usrs='' ){
   
       $xgdb = new usuarios();
       
       $xgdb->open(" Select cd_usrs, 
						    nm_usrs,
						    'F' as tipo 
					   from knoll_usuarios
					  where in_tipo<>'c' ");
       
       $vr_totl =0;
       
       print '<select name="'.$nome.'" > \r\n ';
       print '<option value=""></option> \r\n ';
       for ( $vr_totl=0 ; $vr_totl<$xgdb->linhas ; $vr_totl++ ) {
           print "<option ";
		   if($xgdb->gs['TIPO'][$vr_totl]=="c") print "style='background:#FFFF99'";
		   print " value=".$xgdb->gs['TIPO'][$vr_totl].$xgdb->gs['CD_USRS'][$vr_totl];
           if($xgdb->gs['CD_USRS'][$vr_totl]==$cd_usrs) print ' selected';
           print ">".$xgdb->gs['NM_USRS'][$vr_totl]."</option> \r\n ";
       }
       print '</select>';
   }
   

   function combo_usuarios_envio( $nome='cd_usrs' , $cd_usrs='', $cd_solc='' ){
   
       $xgdb = new usuarios();
       
       $xgdb->open("Select u.cd_usrs, 
	                       u.nm_usrs,
						   d.nm_depr as setor
					  from (knoll_usuarios u,
					       knoll_departamento d)
					 where d.cd_depr=u.cd_depr 
					   and u.in_tipo<>'c'					   
				  order by d.nm_depr, u.nm_usrs");
       
       $vr_totl =0;
       
       print '<select id="'.$nome.'" name="'.$nome.'" onchange=envio("'.$nome.'",'.$cd_solc.') > \r\n ';
       print '<option value=""></option> \r\n ';
       for ( $vr_totl=0 ; $vr_totl<$xgdb->linhas ; $vr_totl++ ) {
           print "<option value=".$xgdb->gs['CD_USRS'][$vr_totl];
           if($xgdb->gs['CD_USRS'][$vr_totl]==$cd_usrs) print ' selected';
           print ">(".$xgdb->gs['SETOR'][$vr_totl].") ".$xgdb->gs['NM_USRS'][$vr_totl]."</option> \r\n ";
       }
       print '</select>';
   }
   
   function combo_setor( $nome='cd_setr' , $dado='', $ativar ='' ){
   
       $xgdb = new usuarios();
       
       $xgdb->open('Select d.cd_depr,
                           d.nm_depr
                      From knoll_departamento d');
       
       $vr_totl =0;
       
       print '<select name="'.$nome.'" > \r\n ';
       if( $ativar !='' ) print '<option value="0"><b>Usuário Desativado</b></option> \r\n ';
	   else  print '<option value=""></option> \r\n ';
       for ( $vr_totl=0 ; $vr_totl<$xgdb->linhas ; $vr_totl++ ) {
           print "<option value=".$xgdb->gs['CD_DEPR'][$vr_totl];
           if($xgdb->gs['CD_DEPR'][$vr_totl]==$dado) print ' selected';
           print ">".$xgdb->gs['NM_DEPR'][$vr_totl]."</option> \r\n ";
       }
       print '</select>';
   }

   
   function combo_clientes( $nome='cd_empr' , $cd_empr='' ){

       $xgdb = new clientes();

       $xgdb->open('Select cd_empr, 
	                       nm_empr,
         Case SUBSTRING(in_tipo,1,1) when "N" then "Normal"
			          when "S" then "NF Serviço"					 
					  when "I" then "Impostos (PIS/COFINS/CSLL/IR)"					 						  
					  when "D" then "Declarações (DACON/DCTF/SEFFINET)"				 						  					  
					  when "R" then "Imposto de Renda" end as tipo						   
	                  from knoll_clientes 
			      order by nm_empr ');

       $vr_totl =0;

       print '<select name="'.$nome.'" > \r\n ';
       print '<option value=0></option> \r\n ';
       for ( $vr_totl=0 ; $vr_totl<$xgdb->linhas ; $vr_totl++ ) {
           print "<option value=".$xgdb->gs['CD_EMPR'][$vr_totl];
           if($xgdb->gs['CD_EMPR'][$vr_totl]==$cd_empr) print ' selected';
           print ">".$xgdb->gs['NM_EMPR'][$vr_totl]." ( ".$xgdb->gs['TIPO'][$vr_totl]." )</option> \r\n ";
       }
       print '</select>';
   }

   function combo_estado($nm_uf ='nm_uf', $sg_uf) {
?>
   <select name="<? print $nm_uf;?>">
      <option value=""></option>
      <option <?if($sg_uf=='AC') print 'selected';?> >AC</option>
      <option <?if($sg_uf=='AL') print 'selected';?> >AL</option>
      <option <?if($sg_uf=='AM') print 'selected';?> >AM</option>
      <option <?if($sg_uf=='AP') print 'selected';?> >AP</option>
      <option <?if($sg_uf=='BA') print 'selected';?> >BA</option>
      <option <?if($sg_uf=='CE') print 'selected';?> >CE</option>
      <option <?if($sg_uf=='DF') print 'selected';?> >DF</option>
      <option <?if($sg_uf=='ES') print 'selected';?> >ES</option>
      <option <?if($sg_uf=='GC') print 'selected';?> >GO</option>
      <option <?if($sg_uf=='MA') print 'selected';?> >MA</option>
      <option <?if($sg_uf=='MG') print 'selected';?> >MG</option>
      <option <?if($sg_uf=='MS') print 'selected';?> >MS</option>
      <option <?if($sg_uf=='MT') print 'selected';?> >MT</option>
      <option <?if($sg_uf=='PA') print 'selected';?> >PA</option>
      <option <?if($sg_uf=='PB') print 'selected';?> >PB</option>
      <option <?if($sg_uf=='PE') print 'selected';?> >PE</option>
      <option <?if($sg_uf=='PI') print 'selected';?> >PI</option>
      <option <?if($sg_uf=='PR') print 'selected';?> >PR</option>
      <option <?if($sg_uf=='RJ') print 'selected';?> >RJ</option>
      <option <?if($sg_uf=='RN') print 'selected';?> >RN</option>
      <option <?if($sg_uf=='RO') print 'selected';?> >RO</option>
      <option <?if($sg_uf=='RR') print 'selected';?> >RR</option>
      <option <?if($sg_uf=='RS') print 'selected';?> >RS</option>
      <option <?if($sg_uf=='SC') print 'selected';?> >SC</option>
      <option <?if($sg_uf=='SE') print 'selected';?> >SE</option>
      <option <?if($sg_uf=='SP') print 'selected';?> >SP</option>
      <option <?if($sg_uf=='TO') print 'selected';?> >TO</option>
   </select>
<?
   }
   
   function combo_banco( ){
      $db_list = mysql_list_dbs();
      print '<select name="nm_banc" >';
      while( $row = mysql_fetch_object($db_list) ) {
          print '<option value="'.$row->Database.'">'.$row->Database.'</option>\r\n';
      }
      print '</select>';
   }

   function combo_tabela($nm_banc){
      $db_list = mysql_list_tables($nm_banc);
      print '<select name="nm_tabl" >';
      while( $row = mysql_fetch_row($db_list) ) {
          print '<option value="'.$row[0].'">'.$row[0].'</option>\r\n';
      }
      print '</select>';
   }

   function combo_dia($nm_dia,$nu_valr=''){?>
      <select name=<? print $nm_dia; ?> >
      <? if ($nu_valr=='') print '<option value=""> </option>';
         for ($i=1; $i<=31; $i++) { ?> <option align="right" value="<? print $i; ?>" <?if($nu_valr==$i) print 'selected';?>><? print $i; ?></option>
      <? } ?>
      </select>
<? }

   function combo_mes($nm_mes,$nu_valr=''){ ?>
      <select name=<? print $nm_mes; ?> >
      <? if ($nu_valr=='') print '<option value=""> </option>';
         for ($i=1; $i<=12; $i++) { ?> <option align="right" value="<? print $i; ?>" <?if($nu_valr==$i) print 'selected';?>><? print $i; ?></option>
      <? } ?>
      </select>
<? }

   function combo_ano($nm_ano,$nu_valr=''){ ?>
      <select name=<? print $nm_ano; ?> >
      <? if ($nu_valr=='') print '<option value=""> </option>';
         for ($i=1970; $i<=2040; $i++) { ?> <option align="right" value="<? print $i; ?>" <?if($nu_valr==$i) print 'selected';?>><? print $i; ?></option>
      <? } ?>
      </select>
<? }

   function combo_situacao($campo="in_sitc",$dado=""){ ?>
     <select name=<? print $campo; ?> >
     <option value=""> </option>     
     <option value="0">Nova</option>          
     <option value="1">Aguardando </option>          
     <option value="2">Em Atendimento </option>          
     <option value="3">Encerrada</option>                         
     <option value="4">Reaberta</option>                              
     </select>                        

<? } 
   
   function check_usuarios_envio(){
   
       $xgdb = new usuarios();
       
       $xgdb->open("Select u.cd_usrs, 
	                       u.nm_usrs,
						   d.nm_depr as setor
					  from (knoll_usuarios u,
					       knoll_departamento d)
					 where d.cd_depr=u.cd_depr 
					   and u.in_tipo<>'c'					   
				  order by u.nm_usrs");
       
       $vr_totl =0;
       print "<div name='dvUsuario' style='height:150px;width:100%;overflow:auto'> \n";
       for ( $vr_totl=0 ; $vr_totl<$xgdb->linhas ; $vr_totl++ ) {
 	       print "<input type='checkbox' id='id".$xgdb->gs['CD_USRS'][$vr_totl]."' name='nm".$xgdb->gs['CD_USRS'][$vr_totl]."' >".$xgdb->gs['NM_USRS'][$vr_totl]." (<b> ".$xgdb->gs['SETOR'][$vr_totl]." </b>)<br> \n";
       }
	   print "</div>";
   }
   
 ?>