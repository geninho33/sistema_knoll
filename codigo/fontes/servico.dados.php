<?php

// ini_set('display_errors', 1);
// error_reporting(E_ALL);

@header("Content-Type: text/html; charset=utf-8");
@header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
@header("Expires: Mon, 26 Jul 1997 05:00:00 GMT"); // Date in the past



include_once('servico.func.php'); 

$gdb = new servico();

/*
  print '<pre>';
  print_r($_GET); 
  print '</pre>';
  
  print '<pre>';
  print_r($_POST); 
  print '</pre>';
*/

foreach($_GET as $campo=>$valor){
	$$campo = $valor;
}

foreach($_POST as $campo=>$valor){
	$$campo = $valor;
}

$campo = '';

if( $navegar == 'u'  || 
	$navegar == 'a'  || 
	$navegar == 'f'  || 
	$navegar == 'p'  ||  
	$navegar == 'Buscar' ){
	$gdb->buscar($navegar,$codigo);
	foreach($gdb->tabela as $value){
	  $campo =$campo.$gdb->gs[$value][0].'|';
	}		
}else if($navegar == 'pc'){
	     $gdb->buscar_produto_cliente( $codigo, $idser,1 );
		 foreach($gdb->tabela as $value){
		    $campo =$campo.$gdb->gs[$value][0].'|';
		 }		
}else if( $navegar == 'itens') tabela_itens( $codigo, $gdb, $in_status );
 else if( $navegar == 'produtos'){
  	    $gdb->buscar_equipamento($codigo,1); 
	    tabela_produtos($gdb, $in_status);
}else if( $navegar == 'insert_item'){
	    $gdb->insert_item($idser,$codigo,$descricao,$unidade,$qtde,$vl_unitario,$vl_total);
		tabela_itens( $idser, $gdb, $in_status );
}else if( $navegar == 'excluir_item'){
	     $vetor = explode('_',$dados);
	     if( $dados<>'' ){ 
		    $gdb->excluir_item($vetor[0],$vetor[1]);
		    tabela_itens( $vetor[0], $gdb,$in_status );
		 }
}else if($navegar == ''){		
		$gdb->buscar_cliente( $codigo ,1);
		foreach($gdb->tabela as $value){
		  $campo =$campo.$gdb->gs[$value][0].'|';
		}		
}else if($navegar == 'itens_produto'){		
		 $gdb->buscar_itens_produto( $codigo, 1);
		 foreach($gdb->tabela as $value){
		   $campo =$campo.$gdb->gs[$value][0].'|';
		 }		
}else if( $navegar == 'insert_produto'){
	
	      // Salvando os dados do equipamento do Cliente
		  $gdb->open("SELECT idser FROM knoll_clientes_produtos WHERE cd_eqpm = '$cd_eqpm' AND  idser=$idser ");
 		  $gdb->parametro('dt_emss' ,'DATA',$edData );			  		 
		  if( $gdb->LINHAS == 0 ){
			 $gdb->open(" SELECT ( max( cd_eqpm ) + 1 ) as codigo FROM knoll_clientes_produtos ");
			 $cd_eqpm = $gdb->gs['CODIGO'][0];
  	         $gdb->open(" INSERT INTO knoll_clientes_produtos ( idcli,cd_eqpm,ds_eqpm,ds_modl,ds_seri,nm_revn,dt_emss,defeito,idser,nu_nota )
								 VALUES( $idcli,'$cd_eqpm','$edDesc','$edMod','$edSerie','$edLoja',:dt_emss,'$defeito',$idser,'$edNota') ");
		   }else{
  	         $gdb->open(" UPDATE knoll_clientes_produtos 
			                 SET ds_eqpm = '$edDesc', 
							     ds_modl = '$edMod',
								 ds_seri = '$edSerie',
								 nm_revn = '$edLoja',
								 dt_emss = :dt_emss,
								 defeito = '$defeito',
								 nu_nota = '$edNota'
						   WHERE cd_eqpm = '$cd_eqpm' AND  idser=$idser ");
		   
		   }						 
     	   $gdb->buscar_equipamento($idser,1);
		   tabela_produtos( $gdb, $in_status );

}else if($navegar == 'excluir_produto'){	
	      // Excluindo os dados do equipamento do Cliente
		  if( $cd_eqpm !='' ){
			  $gdb->open(" DELETE FROM knoll_clientes_produtos WHERE cd_eqpm = $cd_eqpm AND idser=$idser ");
			  $gdb->buscar_equipamento($idser,1);
		      tabela_produtos( $gdb, $in_status );
		  }
}else if($navegar == 'atualizar_produto'){	
	      // Excluindo os dados do equipamento do Cliente
		  $gdb->buscar_produto_cliente2($cd_eqpm, $idser,1);
		  foreach($gdb->tabela as $value){
			 $campo =$campo.$gdb->gs[$value][0].'|';
			 
		   }		

}else if($navegar == 'totais'){		
		 $gdb->buscar_totais( $codigo );
		 foreach($gdb->tabela as $value){
		   $campo =$campo.$gdb->gs[$value][0].'|';
		 }		
}else if($navegar == 'codigo_novo'){		
		 $gdb->open("update knoll_configuracao set ultimo_servico = ultimo_servico + 1");
		 $gdb->open("select ultimo_servico as codigo from knoll_configuracao limit 0,1");
		 $campo =$gdb->gs['CODIGO'][0];	
}else if($navegar == 'excluir_servico'){
	     $gdb->open("update knoll_servicos set in_delt = 'S' where idser = $idser");
}else if($navegar == 'salvar_servico'){
	
	   // Salvando os dados do Cliente
	    if( $idcli !='' ){
			$gdb->open(" UPDATE knoll_clientes 
							SET nome       = '$nome',
								email      = '$email',
								complemento= '$proximo',
								endereco   = '$endereco',
								bairro     = '$bairro',
								municipio  = '$municipio',
								cep        = '$cep',
								telefone   = '$fone',
								celular    = '$celular',	
								cpf        = '$cpf',
								fax        = '$fax'														     
						  WHERE idcli = $idcli ");
		 }else{
				$gdb->open(" SELECT ( max( idcli ) + 1 ) as codigo FROM knoll_clientes ");
				$idcli = $gdb->gs['CODIGO'][0];
				$gdb->open(" INSERT INTO knoll_clientes (idcli,nome,email,complemento,endereco,bairro,municipio,cep,telefone,celular,cpf,fax)              
							 VALUES($idcli,'$nome','$email','$proximo','$endereco','$bairro','$municipio','$cep','$fone','$celular','$cpf','$fax' ) ");
		 }
		 
         
	     // Salvando os dados do Serviço
	     $gdb->open("SELECT idser FROM knoll_servicos WHERE idser = $idser");
		 if( $gdb->linhas == 0 ){
			   $gdb->insert( $idser,$idcli,$dt_entr,$dt_sada,$val_pro,$val_tot,$idpag,$idfun,$contato,$idrp,$usuario,$equipamento,$ds_deft, 
                 		  $servico,$hr_entr,$hr_sada,$val_ser,$documento,$cd_eqpm,$cd_agnd,$tipo,$idpro,$in_status,$val_des,$hr_serv); 
			$gdb->open(" UPDATE knoll_clientes_produtos  SET idcli = $idcli WHERE idser = $idser ");			  
		 }else{
			  $gdb->update( $idser,$idcli,$dt_entr,$dt_sada,$val_pro,$val_tot,$idpag,$idfun,$contato,$idrp,$usuario,$equipamento,$ds_deft, 
                 		  $servico,$hr_entr,$hr_sada,$val_ser,$documento,$cd_eqpm,$cd_agnd,$tipo,$idpro,$in_status,$val_des,$hr_serv);		 
		 }
}

if( $navegar !='itens' && $navegar != 'excluir_servico' && $navegar !='salvar_servico' &&  $navegar !='produtos'  ) print $campo;

function tabela_itens( $codigo, $gdb,$in_status ){	
  $gdb->buscar_itens( $codigo,1);	
  if( $gdb->linhas>0 ){ ?>
     <table class="table_interna">
       <tr>
         <td align="center"class="table_interna"><font class="label">Codigo</font></td>
         <td align="center"class="table_interna"><font class="label">PS</font></td>           
         <td align="center"class="table_interna"><font class="label">Descri&ccedil;&atilde;o</font></td>           
         <td align="center"class="table_interna"><font class="label">UN</font></td>                                 
         <td align="center"class="table_interna"><font class="label">Qtde</font></td>                                            
         <td align="center"class="table_interna"><font class="label">Vlr Unit&aacute;rio</font></td>                                                       
         <td align="center"class="table_interna"><font class="label">Total</font></td> 
         <td align="center"class="table_interna"><font class="label">Opera&ccedil;&atilde;o</font></td>                                      
       </tr>
	<?php foreach( $gdb->gs['IDPRO'] as $key=>$value ){ ?>
         <tr>
           <td align="left"class="table_interna"><font class="edit"><?php print $gdb->gs['IDPRO'][$key]; ?></font></td>
           <td align="center"class="table_interna"><font class="edit"><?php print $gdb->gs['PS'][$key]; ?></font></td>
           <td align="left"class="table_interna"><font class="edit"><?php print $gdb->gs['DESCRICAO'][$key]; ?></font></td>     
           <td align="center"class="table_interna"><font class="edit"><?php print $gdb->gs['UNIDADE'][$key]; ?></font></td>          
           <td align="right"class="table_interna"><font class="edit"><?php print $gdb->gs['QTDE'][$key]; ?></font></td>               
           <td align="right"class="table_interna"><font class="edit"><?php print $gdb->gs['VAL_UNI'][$key]; ?></font></td>                    
           <td align="right"class="table_interna"><font class="edit"><?php print $gdb->gs['VAL_TOT'][$key]; ?></font></td> 
           <td align="center"class="table_interna">
        <?php if($in_status !='Encerrado' ){ ?>
              <input type="button" value="Excluir" onclick="buscar_itens('E',<?php print $gdb->gs['IDPRO'][$key]; ?>);" />
        <?php } ?>
           </td>                         
        </tr>	   
    <?php } ?>
     </table>    
<?php 
  }
}

function tabela_produtos( $gdb,$in_status ){	
  if( $gdb->linhas>0 ){ ?>
     <table class="table_interna">
       <tr>
         <td align="center"class="table_interna"><font class="label">Descri&ccedil;&atilde;o</font></td>           
         <td align="center"class="table_interna"><font class="label">Nr. Nota</font></td>                          
         <td align="center"class="table_interna"><font class="label">Modelo</font></td>                                 
         <td align="center"class="table_interna"><font class="label">Data</font></td>                                            
         <td align="center"class="table_interna"><font class="label">S&eacute;rie</font></td>                                                       
         <td align="center"class="table_interna"><font class="label">Revenda</font></td> 
        <td align="center"class="table_interna"><font class="label">Defeito</font></td>          
         <td align="center"class="table_interna"><font class="label">Opera&ccedil;&atilde;o</font></td>                                                                 
       </tr>
	<?php foreach( $gdb->gs['CD_EQPM'] as $key=>$value ){ ?>
         <tr>
           <td align="left"class="table_interna"><font class="edit"><?php print $gdb->gs['DS_EQPM'][$key]; ?></font></td>
           <td align="left"class="table_interna"><font class="edit"><?php print $gdb->gs['NU_NOTA'][$key]; ?></font></td>           
           <td align="left"class="table_interna"><font class="edit"><?php print $gdb->gs['DS_MODL'][$key]; ?></font></td>
           <td align="left"class="table_interna"><font class="edit"><?php print $gdb->gs['DT_EMSS'][$key]; ?></font></td>     
           <td align="left"class="table_interna"><font class="edit"><?php print $gdb->gs['DS_SERI'][$key]; ?></font></td>          
           <td align="left"class="table_interna"><font class="edit"><?php print $gdb->gs['NM_REVN'][$key]; ?></font></td>    
        <td align="justify"  width="330"class="table_interna"><font class="edit"><?php print $gdb->gs['DEFEITO'][$key]; ?></font></td>        
           <td align="center"class="table_interna">
        <?php if($in_status !='Encerrado' ){ ?>
              <input type="button" value="Alterar"  onclick="buscar_itens_produto('U',<?php print $value; ?>);" />
              <input type="button" value="Excluir"  onclick="buscar_itens_produto('E',<?php print $value; ?>);" />              
        <?php } ?>
           </td>                         
        </tr>	   
    <?php } ?>
     </table>    
<?php 
  }
}
?> 