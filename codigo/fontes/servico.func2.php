<?

include_once('gdb.php'); 
   
class servico extends gdb { 
   
   function insert(  $idser, 
					 $idcli, 
					 $dt_entr, 
					 $dt_sada, 
					 $val_pro, 
					 $val_tot, 
					 $idpag, 
					 $idfun, 
					 $nome, 
					 $idrp, 
					 $usuario, 
					 $equipamento, 
					 $defeito, 
					 $servico, 
					 $hr_entr, 
					 $hr_sada, 
					 $val_ser, 
					 $documento, 
					 $cd_eqpm, 
					 $cd_agnd, 
					 $tipo, 
					 $idpro, 
					 $in_status,
					 $val_des,
					 $hr_serv = '00:00') {
      $this->parametro('idser' ,'NUMERIC',$idser );
      $this->parametro('idcli' ,'NUMERIC',$idcli );
      $this->parametro('dt_entr' ,'DATA',$dt_entr );
      $this->parametro('dt_sada' ,'DATA',$dt_sada );
      $this->parametro('val_pro' ,'STRING',$val_pro );
      $this->parametro('val_tot' ,'STRING',$val_tot );
	  $this->parametro('val_des' ,'NUMERIC',$val_des );	 	  
      $this->parametro('idpag' ,'NUMERIC',$idpag );
      $this->parametro('idfun' ,'NUMERIC',$idfun );
      $this->parametro('nome' ,'STRING',$nome );
      $this->parametro('idrp' ,'NUMERIC',$idrp );
      $this->parametro('usuario' ,'STRING',$usuario );
      $this->parametro('equipamento' ,'STRING',$equipamento );
      $this->parametro('defeito' ,'STRING',$defeito );
      $this->parametro('servico' ,'STRING',$servico );
      $this->parametro('hr_entr' ,'STRING',$hr_entr );
      $this->parametro('hr_sada' ,'STRING',$hr_sada );
      $this->parametro('hr_serv' ,'STRING',$hr_serv );	  
      $this->parametro('val_ser' ,'STRING',$val_ser );
      $this->parametro('documento' ,'NUMERIC',$documento );
      $this->parametro('cd_eqpm' ,'NUMERIC',$cd_eqpm );
      $this->parametro('cd_agnd' ,'NUMERIC',$cd_agnd );
      $this->parametro('tipo' ,'STRING',$tipo );
      $this->parametro('idpro' ,'NUMERIC',$cd_eqpm );
      $this->parametro('in_status' ,'STRING',$in_status );
   
      $rows = 0; 
      if ($this->open("insert into knoll_servicos ( idser, 
												    idcli, 
												    dt_entr, 
												    dt_sada, 
												    val_pro, 
												    val_tot, 
												    idpag, 
												    idfun, 
												    nome, 
												    idrp, 
												    usuario, 
												    equipamento, 
												    defeito, 
												    servico, 
												    hr_entr, 
												    hr_sada, 
												    val_ser, 
												    cd_eqpm, 
												    cd_agnd, 
												    tipo, 
												    idpro, 
												    in_status,
													in_delt,
													val_des) 
                                    values( :idser, 
										    :idcli, 
										    :dt_entr, 
										    :dt_sada, 
										    :val_pro, 
										    :val_tot, 
										    :idpag, 
										    :idfun, 
										    :nome, 
										    :idrp, 
										    :usuario, 
										    :equipamento, 
										    :defeito, 
										    :servico, 
										    :hr_entr, 
										    :hr_sada, 
										    :val_ser, 
										    :cd_eqpm, 
										    :cd_agnd, 
										    :tipo, 
										    :idpro, 
										    :in_status,
											'N',
											:val_des)")) 
   return 1;
   else return 0;
   } 
   
   function update( 
                 $idser, 
                 $idcli, 
                 $dt_entr, 
                 $dt_sada, 
                 $val_pro = 0, 
                 $val_tot = 0, 
                 $idpag = 0, 
                 $idfun = 0, 
                 $nome, 
                 $idrp = 0, 
                 $usuario, 
                 $equipamento, 
                 $defeito, 
                 $servico, 
                 $hr_entr, 
                 $hr_sada, 
                 $val_ser = 0, 
                 $documento, 
                 $cd_eqpm = 0, 
                 $cd_agnd = 0, 
                 $tipo, 
                 $idpro = 0, 
                 $in_status,
				 $val_des = 0,
				 $hr_serv = '00:00') {
					 
      $this->parametro('idser' ,'NUMERIC',$idser );
      $this->parametro('idcli' ,'NUMERIC',$idcli );
      $this->parametro('dt_entr' ,'DATA',$dt_entr );
      $this->parametro('dt_sada' ,'DATA',$dt_sada );
      $this->parametro('idpag' ,'NUMERIC',$idpag );
      $this->parametro('idfun' ,'NUMERIC',$idfun );
      $this->parametro('nome' ,'STRING',$nome );
      $this->parametro('idrp' ,'NUMERIC',$idrp );
      $this->parametro('usuario' ,'STRING',$usuario );
      $this->parametro('equipamento' ,'STRING',$equipamento );
      $this->parametro('defeito' ,'STRING',$defeito );
      $this->parametro('servico' ,'STRING',$servico );
      $this->parametro('hr_entr' ,'STRING',$hr_entr );
      $this->parametro('hr_sada' ,'STRING',$hr_sada );
      $this->parametro('documento' ,'NUMERIC',$documento );
      $this->parametro('cd_eqpm' ,'NUMERIC',$cd_eqpm );
      $this->parametro('cd_agnd' ,'NUMERIC',$cd_agnd );
	  $this->parametro('val_ser' ,'NUMERIC',$val_ser );
	  $this->parametro('val_pro' ,'NUMERIC',$val_pro );
	  $this->parametro('val_des' ,'NUMERIC',$val_des );	  
	  $this->parametro('val_tot' ,'NUMERIC',$val_tot );	  	  
      $this->parametro('tipo' ,'STRING',$tipo );
      $this->parametro('idpro' ,'NUMERIC',$cd_eqpm );
      $this->parametro('in_status','STRING',$in_status );
      $this->parametro('hr_serv','STRING',$hr_serv );	  
	     
      $rows = 0; 
	  
	  // usuario     = :usuario, 
	  
      if ($this->open(' update knoll_servicos set idcli       = :idcli, 
												  dt_entr     = :dt_entr, 
												  dt_sada     = :dt_sada, 
												  val_pro     = :val_pro, 
												  val_tot     = :val_tot, 
												  idpag       = :idpag, 
												  idfun       = :idfun, 
												  nome        = :nome, 
												  idrp        = :idrp, 												  
												  equipamento = :equipamento, 
												  defeito     = :defeito, 
												  servico     = :servico, 
												  hr_entr     = :hr_entr, 
												  hr_sada     = :hr_sada, 
												  val_ser     = :val_ser,
												  val_des     = :val_des, 
												  cd_eqpm     = :cd_eqpm, 
												  cd_agnd     = :cd_agnd, 
												  tipo        = :tipo, 
												  idpro       = :idpro, 
												  in_status   = :in_status,
												  hr_serv     = :hr_serv
											where idser       = :idser',1)) return 1;
   else return 0;
   } 
   
   function delete() { 
      $this->open(" delete from knoll_servicos  ");    
   return $this->linhas;
   }   
   
   function select( 
                 $idser ='', 
                 $idcli ='', 
                 $dt_entr ='', 
                 $dt_sada ='', 
                 $val_pro ='', 
                 $val_tot ='', 
                 $idpag ='', 
                 $idfun ='', 
                 $nome ='', 
                 $idrp ='', 
                 $usuario ='', 
                 $equipamento ='', 
                 $defeito ='', 
                 $servico ='', 
                 $hr_entr ='', 
                 $hr_sada ='', 
                 $val_ser ='', 
                 $documento ='', 
                 $cd_eqpm ='', 
                 $cd_agnd ='', 
                 $tipo ='', 
                 $idpro ='', 
                 $in_status ='') {
      $where = " where in_delt<>'S' "; 
      if ($idser !='' ){ 
         $this->parametro('idser' ,'NUMERIC',$idser );
         ($where=='')?$where =' Where idser=:idser ':$where .=' and idser=:idser';
      } 
      if ($idcli !='' ){ 
         $this->parametro('idcli' ,'NUMERIC',$idcli );
         ($where=='')?$where =' Where idcli=:idcli ':$where .=' and idcli=:idcli';
      } 
      if ($dt_entr !='' ){ 
      } 
      if ($dt_sada !='' ){ 
      } 
      if ($val_pro !='' ){ 
      } 
      if ($val_tot !='' ){ 
      } 
      if ($idpag !='' ){ 
         $this->parametro('idpag' ,'NUMERIC',$idpag );
         ($where=='')?$where =' Where idpag=:idpag ':$where .=' and idpag=:idpag';
      } 
      if ($idfun !='' ){ 
         $this->parametro('idfun' ,'NUMERIC',$idfun );
         ($where=='')?$where =' Where idfun=:idfun ':$where .=' and idfun=:idfun';
      } 
      if ($nome !='' ){ 
         $this->parametro('nome' ,'CLIKE',$nome );
         ($where=='')?$where =' Where upper( nome) like (:nome) ':$where .=' and upper( nome) like (:nome) ';
      } 
      if ($idrp !='' ){ 
         $this->parametro('idrp' ,'NUMERIC',$idrp );
         ($where=='')?$where =' Where idrp=:idrp ':$where .=' and idrp=:idrp';
      } 
      if ($usuario !='' ){ 
         $this->parametro('usuario' ,'STRING',$usuario );
         ($where=='')?$where =' Where usuario=:usuario ':$where .=' and usuario=:usuario';
      } 
      if ($equipamento !='' ){ 
         $this->parametro('equipamento' ,'CLIKE',$equipamento );
         ($where=='')?$where =' Where upper( equipamento) like (:equipamento) ':$where .=' and upper( equipamento) like (:equipamento) ';
      } 
      if ($defeito !='' ){ 
         $this->parametro('defeito' ,'CLIKE',$defeito );
         ($where=='')?$where =' Where upper( defeito) like (:defeito) ':$where .=' and upper( defeito) like (:defeito) ';
      } 
      if ($servico !='' ){ 
         $this->parametro('servico' ,'CLIKE',$servico );
         ($where=='')?$where =' Where upper( servico) like (:servico) ':$where .=' and upper( servico) like (:servico) ';
      } 
      if ($hr_entr !='' ){ 
         $this->parametro('hr_entr' ,'STRING',$hr_entr );
         ($where=='')?$where =' Where hr_entr=:hr_entr ':$where .=' and hr_entr=:hr_entr';
      } 
      if ($hr_sada !='' ){ 
         $this->parametro('hr_sada' ,'STRING',$hr_sada );
         ($where=='')?$where =' Where hr_sada=:hr_sada ':$where .=' and hr_sada=:hr_sada';
      } 
      if ($val_ser !='' ){ 
      } 
      if ($documento !='' ){ 
         $this->parametro('documento' ,'NUMERIC',$documento );
         ($where=='')?$where =' Where documento=:documento ':$where .=' and documento=:documento';
      } 
      if ($cd_eqpm !='' ){ 
         $this->parametro('cd_eqpm' ,'NUMERIC',$cd_eqpm );
         ($where=='')?$where =' Where cd_eqpm=:cd_eqpm ':$where .=' and cd_eqpm=:cd_eqpm';
      } 
      if ($cd_agnd !='' ){ 
         $this->parametro('cd_agnd' ,'NUMERIC',$cd_agnd );
         ($where=='')?$where =' Where cd_agnd=:cd_agnd ':$where .=' and cd_agnd=:cd_agnd';
      } 
      if ($tipo !='' ){ 
         $this->parametro('tipo' ,'STRING',$tipo );
         ($where=='')?$where =' Where tipo=:tipo ':$where .=' and tipo=:tipo';
      } 
      if ($idpro !='' ){ 
         $this->parametro('idpro' ,'NUMERIC',$idpro );
         ($where=='')?$where =' Where idpro=:idpro ':$where .=' and idpro=:idpro';
      } 
      if ($in_status !='' ){ 
         $this->parametro('in_status' ,'STRING',$in_status );
         ($where=='')?$where =' Where in_status=:in_status ':$where .=' and in_status=:in_status';
      } 
      if($this->open(' select  
                 idser, 
                 idcli, 
                 dt_entr, 
                 dt_sada, 
                 REPLACE(REPLACE(REPLACE(FORMAT(val_pro, 2), ".", "@"), ",", "."), "@", ",") as val_pro, 
                 REPLACE(REPLACE(REPLACE(FORMAT(val_tot, 2), ".", "@"), ",", "."), "@", ",") as val_tot,  
                 idpag, 
                 idfun, 
                 nome, 
                 idrp, 
                 usuario, 
                 equipamento, 
                 defeito, 
                 servico, 
                 hr_entr, 
                 hr_sada, 
                 REPLACE(REPLACE(REPLACE(FORMAT(val_ser, 2), ".", "@"), ",", "."), "@", ",") as val_ser, 
                 documento, 
                 cd_eqpm, 
                 cd_agnd, 
                 tipo, 
                 idpro, 
                 in_status,
				 REPLACE(REPLACE(REPLACE(FORMAT(val_des, 2), ".", "@"), ",", "."), "@", ",") as val_des,
				 hr_serv
		    from knoll_servicos $where ')) { 
   
         $this->idser = $this->gs['IDSER'][0]; 
         $this->idcli = $this->gs['IDCLI'][0]; 
         $this->dt_entr = $this->gs['DT_ENTR'][0]; 
         $this->dt_sada = $this->gs['DT_SADA'][0]; 
         $this->val_pro = $this->gs['VAL_PRO'][0]; 
         $this->val_tot = $this->gs['VAL_TOT'][0]; 
		 $this->val_des = $this->gs['VAL_DES'][0]; 
         $this->idpag = $this->gs['IDPAG'][0]; 
         $this->idfun = $this->gs['IDFUN'][0]; 
         $this->nome = $this->gs['NOME'][0]; 
         $this->idrp = $this->gs['IDRP'][0]; 
         $this->usuario = $this->gs['USUARIO'][0]; 
         $this->equipamento = $this->gs['EQUIPAMENTO'][0]; 
         $this->defeito = $this->gs['DEFEITO'][0]; 
         $this->servico = $this->gs['SERVICO'][0]; 
         $this->hr_entr = $this->gs['HR_ENTR'][0]; 
         $this->hr_sada = $this->gs['HR_SADA'][0]; 
         $this->val_ser = $this->gs['VAL_SER'][0]; 
         $this->documento = $this->gs['DOCUMENTO'][0]; 
         $this->cd_eqpm = $this->gs['CD_EQPM'][0]; 
         $this->cd_agnd = $this->gs['CD_AGND'][0]; 
         $this->tipo = $this->gs['TIPO'][0]; 
         $this->idpro = $this->gs['IDPRO'][0]; 
         $this->in_status = $this->gs['IN_STATUS'][0]; 
      return true; 
      } 
   }
   
   function buscar($tipo, $codigo=''){
	   // and idrp<>CAST(8888 AS INT)
	 if(     $tipo == 'p'     ) $critica = " where in_delt<>'S' order by idser  limit 0, 1";  
	 elseif( $tipo == 'u'     ) $critica = " where in_delt<>'S' order by idser desc  limit 0, 1";  	 
	 elseif( $tipo == 'f'     ) $critica = " where in_delt<>'S' and idser>".$codigo."  order by idser  limit 0, 1";
     elseif( $tipo == 'Buscar') $critica = " where in_delt<>'S' and  idser=".$codigo;	 
	 else $critica = " where idser<".$codigo." and in_delt<>'S' order by idser desc limit 0, 1"; 
	 
     $select  =  " select  idser, 
						   idcli, 
						   DATE_FORMAT(dt_entr, '%d/%m/%Y') as dt_entr, 
						   DATE_FORMAT(dt_sada, '%d/%m/%Y') as dt_sada, 						   
						   REPLACE(REPLACE(REPLACE(FORMAT(val_pro, 2), '.', '@'), ',', '.'), '@', ',') as val_pro, 
						   REPLACE(REPLACE(REPLACE(FORMAT(val_tot, 2), '.', '@'), ',', '.'), '@', ',') as val_tot, 
						   idpag, 
						   s.idfun, 
						   s.nome, 
						   idrp, 
						   usuario, 
						   equipamento, 
						   defeito, 
						   servico, 
						   hr_entr, 
						   hr_sada, 
						   REPLACE(REPLACE(REPLACE(FORMAT(val_ser, 2), '.', '@'), ',', '.'), '@', ',') as val_ser,
						   idpro as cd_eqpm , 
						   cd_agnd, 
						   s.tipo, 
						   idpro, 
						   in_status,
						   f.nome as funcionario,
						   REPLACE(REPLACE(REPLACE(FORMAT(val_des, 2), '.', '@'), ',', '.'), '@', ',') as val_des,
						   hr_serv   
					  from knoll_servicos s	
					  
			     left join knoll_funcionario f
				        on f.idfun = s.idfun ";
					  	 
	$this->open($select.$critica );
	
	if($this->linhas == 0 ){
	   if($tipo =='f') $critica = " where in_delt<>'S' order by idser desc  limit 0, 1"; 
	   else $critica = " where in_delt<>'S' order by idser limit 0, 1"; 
	   $this->open($select.$critica );	
	}
	
   } 
   
   function buscar_itens($codigo=''){
	    
     $this->open(" select IDPRO,
						  PS,	 	 
						  DESCRICAO,
						  UNIDADE,	 
						  REPLACE(REPLACE(REPLACE(FORMAT(QTDE, 2),'.',';'),',','.'),';',',') as  QTDE,
						  REPLACE(REPLACE(REPLACE(FORMAT(VAL_UNI, 2),'.',';'),',','.'),';',',') as  VAL_UNI,
						  REPLACE(REPLACE(REPLACE(FORMAT(VAL_TOT, 2),'.',';'),',','.'),';',',') as  VAL_TOT
					 from knoll_servicos_itens 
					where idser = $codigo  ",0);	 	   
   } 
      
   function buscar_cliente($codigo=''){
 
     $this->open(" select  nome,
						   email, 
						   endereco,
						   complemento,
						   bairro,
						   municipio,
						   estado,
						   cep,
						   telefone,
						   celular,
						   fax,
						   cpf
					  from knoll_clientes 
					 where idcli = $codigo ");	 
	   
   } 
   
   function buscar_produto_cliente($codigo='', $idser=''){
	 
	 if($idser == '') $idser = 0;  
     
     $this->open("  SELECT P.CD_EQPM,
	                       P.DS_EQPM,
						   P.NM_MARC,
						   P.DS_MODL,
						   P.DS_SERI,
						   P.DS_OBSR,
						   P.NU_NOTA,
						   P.NM_SERIE,
						   DATE_FORMAT(P.DT_EMSS, '%d/%m/%Y') as DT_EMSS,	
						   P.NM_REVN,
						   D.DEFEITO 
					  FROM knoll_clientes_produtos P
					  
			  	 LEFT JOIN knoll_servicos_produtos S
				        ON P.IDCLI=S.IDCLI 
					   AND S.IDSER = $idser
					   
					  WHERE cd_eqpm = $codigo ");	 
	   
   }  
    
   function buscar_produto_cliente2($codigo='', $idser=''){
	 
	 if($idser == '') $idser = 0;  
     
     $this->open("  SELECT P.CD_EQPM,
	                       P.DS_EQPM,
						   P.NM_MARC,
						   P.DS_MODL,
						   P.DS_SERI,
						   P.DS_OBSR,
						   P.NU_NOTA,
						   P.NM_SERIE,
						   DATE_FORMAT(P.DT_EMSS, '%d/%m/%Y') as DT_EMSS,	
						   P.NM_REVN,
						   P.DEFEITO 
					  FROM knoll_clientes_produtos P
					 WHERE cd_eqpm = $codigo  
					   AND P.IDSER = $idser ");	 
	   
   }   

   function buscar_equipamento($idser){
	 
	 if($idser == '') $idser = 0;  
     
     $this->open("  SELECT P.CD_EQPM,
	                       P.DS_EQPM,
						   P.NM_MARC,
						   P.DS_MODL,
						   P.DS_SERI,
						   P.NM_SERIE,
						   DATE_FORMAT(P.DT_EMSS, '%d/%m/%Y') as DT_EMSS,	
						   P.NM_REVN,
						   P.DEFEITO,
						   P.NU_NOTA
					  FROM knoll_clientes_produtos P
					  WHERE P.IDSER = $idser ");	 
	   
   }      
   
   function buscar_itens_produto($codigo){
	   
     $this->open(" SELECT distinct idpro, descricao, unidade, venda FROM knoll_produtos where IDPRO = $codigo ");	 
	 
   } 
    
   function buscar_totais($codigo=''){					
  /*    
    $this->open(" select IDPRO,
						 upper(PS) as PS,	 	 
						 DESCRICAO,
						 UNIDADE,	 						  
						 QTDE,
						 VAL_UNI,
						 VAL_TOT
				    from knoll_servicos_itens 
				   where idser = $codigo ");   
					
     if( $this->linhas>0 ){
		 
		 $vl_serv = 0;
		 $vl_totl = 0;
		 $vl_prdt = 0;
		 $vl_desc = 0;
		 
		 foreach($this->gs['VAL_TOT'] as $key=>$value){
		    if( $this->gs['PS'][$key] == 'S' ) $vl_serv = $vl_serv + $value;
			if( $this->gs['PS'][$key] == 'P' ) $vl_prdt = $vl_prdt + $value;
			$vl_totl = $vl_totl + $value;				 
		 }
		 
		 $this->open("select VAL_DES from  knoll_servicos where idser = $codigo ");
		 $vl_desc = $this->gs['VAL_DES'][0];
		 
         $this->open(" select ( REPLACE(REPLACE(REPLACE(FORMAT(  $vl_totl , 2),'.',';'),',','.'),';',',')  ) as VAL_TOT,
		                      ( REPLACE(REPLACE(REPLACE(FORMAT(  $vl_serv , 2),'.',';'),',','.'),';',',')   ) as VAL_SER, 
							  ( REPLACE(REPLACE(REPLACE(FORMAT(  $vl_prdt , 2),'.',';'),',','.'),';',',')   ) as VAL_PRO,
							  ( REPLACE(REPLACE(REPLACE(FORMAT(  $vl_desc , 2),'.',';'),',','.'),';',',')   ) as VAL_DES  ");
	 }
*/	

	
	$this->open("UPDATE knoll_servicos s 
				   SET VAL_PRO= ( select  FORMAT(sum(VAL_TOT),2)  from  knoll_servicos_itens 
								  where idser = s.idser and upper(ps)= 'P' ) ,
      				   VAL_SER=( select  FORMAT( sum(VAL_TOT),2)  from  knoll_servicos_itens 
								 where idser = s.idser and upper(ps)= 'S' ),
      					VAL_TOT=( select  FORMAT(sum(VAL_TOT),2)  from  knoll_servicos_itens 
								  where idser = s.idser  )
						  WHERE idser = $codigo ");
	
     $this->open(" select 
				  ( select REPLACE(REPLACE(REPLACE(FORMAT( ( sum(VAL_TOT) ), 2),'.',';'),',','.'),';',',') from  knoll_servicos_itens 
					where idser = $codigo and upper(ps)= 'S' )  as VAL_SER,
				  ( select REPLACE(REPLACE(REPLACE(FORMAT( ( sum(VAL_TOT) ), 2),'.',';'),',','.'),';',',') from  knoll_servicos_itens 
					where idser = $codigo and upper(ps)= 'P' )  as  VAL_PRO,
					( select REPLACE(REPLACE(REPLACE(FORMAT( ( sum(VAL_TOT) ), 2),'.',';'),',','.'),';',',') from  knoll_servicos_itens 
					where idser = $codigo )  as  VAL_TOT,
				  ( select REPLACE(REPLACE(REPLACE(FORMAT(VAL_DES, 2),'.',';'),',','.'),';',',') from  knoll_servicos
					where idser = $codigo )  as  VAL_DES ");	
	   	 			 	   
   } 
   
   function procurar_produto_cliente($codigo=''){
 
     $this->open("  SELECT CD_EQPM,
	                       DS_EQPM,
						   NM_MARC,
						   DS_MODL,
						   DS_SERI,
						   DS_OBSR,
						   NU_NOTA,
						   NM_SERIE,
						   DATE_FORMAT(DT_EMSS, '%d/%m/%Y') as DT_EMSS,	
						   NM_REVN 
					  FROM knoll_clientes_produtos WHERE idcli = $codigo ");	 
					     
   } 

   function procurar_servico_cliente($in_tipo,$ds_dado){
	   
      $ds_dado = trim( $ds_dado );
	  
	  $campo_equipamento = ", p.ds_eqpm as produto	"; 
      $join_equipamento  = " left join knoll_clientes_produtos p on p.idser=s.idser 	";
	  
	  if( $in_tipo == 0 ){	
	      // print 'Passou pelo 0';
	      $where = " and s.idser = $ds_dado ";
		  // $campo_equipamento = '';
		  // $join_equipamento  = '';
	   }
	   elseif( $in_tipo == 1 ){
		      $where = " and s.idcli = $ds_dado ";
		      // $campo_equipamento = '';
		      // $join_equipamento  = '';
	  }
	  elseif( $in_tipo == 2 ) $where = " and upper(c.nome) like upper('%$ds_dado%') ";  
	  elseif( $in_tipo == 3 ) $where = " and upper(c.endereco) like upper('%$ds_dado%') ";  
	  elseif( $in_tipo == 4 ) $where = " and ( upper(c.telefone) like upper('%$ds_dado%') or upper(c.celular) like upper('%$ds_dado%') ) ";  
	  
	  $select = " select s.idser as codigo, 
	                       c.nome as cliente,
						   DATE_FORMAT(s.dt_sada, '%d/%m/%Y') as Saida,						   
						   DATE_FORMAT(s.dt_entr, '%d/%m/%Y') as Entrada, 
						   c.Endereco,
						   c.bairro,
						   c.municipio,
						   c.telefone,
						   c.celular
						   $campo_equipamento				   
				      from ( knoll_servicos s, knoll_clientes c )
				   
				    $join_equipamento 
					
				     where  s.idcli=c.idcli and s.in_delt<>'S'  $where 
					 
				  order by c.nome, s.idser desc ";
	  // print $select;			  
      $this->open( $select );	 
	   
   } 

   function procurar_cliente($in_tipo,$ds_dado){
	   
     if($in_tipo == 0){
		$where = " where c.idcli = $ds_dado ";  
	  } 

	  if($in_tipo == 1){
		$where = " where upper(c.nome) like upper('%$ds_dado%') ";  
	  } 
	
	  if($in_tipo == 2){
		$where = " where upper(c.endereco) like upper('%$ds_dado%') ";  
	  } 

	  if($in_tipo == 3){
		$where = " where ( upper(c.telefone) like upper('%$ds_dado%') or  upper(c.celular) like upper('%$ds_dado%') ) ";  
	  } 

 
      $this->open(" select c.idcli as codigo, 
	                       c.nome as cliente,
						   c.Endereco,
						   c.bairro,
						   c.municipio,
						   c.telefone,
						   c.celular						   
				      from knoll_clientes c $where order by c.nome " );	 
   } 
   
   function procurar_produto($in_tipo, $ds_dado=''){
	   
     if($in_tipo == 0){
		$where = " where IDPRO = $ds_dado ";  
	 } 
	 if($in_tipo == 1){
		$where = " where upper(DESCRICAO) like upper('%$ds_dado%') ";  
	 } 
     $this->open("SELECT distinct idpro, descricao, unidade, venda FROM knoll_produtos $where");	 
	   
   } 
   
   function insert_item($idser='',$codigo='',$descricao='',$unidade='',$qtde='',$vl_unitario='',$vl_total=''){
	   
	 if($codigo == ''){
		$this->open('SELECT ( max(idpro) + 1 ) as codigo FROM knoll_produtos');
	    $codigo = $this->gs['CODIGO'][0];
	 }
	 
     $this->open(" INSERT INTO knoll_servicos_itens( IDSER,
	                                                 IDPRO,
													 QTDE,
													 VAL_UNI,
													 VAL_TOT,
													 DESCRICAO,
													 UNIDADE,
													 PS) 
											VALUES ( $idser,
													 $codigo,
													 $qtde,
													 $vl_unitario,
													 $vl_total,
													 '$descricao',
													 '$unidade',
													 'P') ");	   
	
	$this->open("SELECT distinct idpro FROM knoll_produtos where IDPRO = $codigo");
	
	if( $this->linhas == 0 ){
	   $this->open(" INSERT INTO knoll_produtos(idpro, descricao, unidade, venda ) 
	                  SELECT distinct idpro, descricao, unidade, val_tot as venda  
					    FROM knoll_servicos_itens where idpro = $codigo ");
	}												 
													 
													 
   }
   
   function excluir_item($idser='',$codigo=''){
     $this->open(" DELETE FROM knoll_servicos_itens WHERE idser=$idser AND idpro=$codigo");	   
   }
   
} 
 ?>