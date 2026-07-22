<?
include_once("gdb.php");

class usuarios extends gdb {

   function insert( $nm_usrs,
                    $cd_acss,
                    $nm_logn,
                    $cd_pass,
                    $in_tipo,
					$ds_email,
					$hr_matt_entr,
					$hr_matt_saida,
					$hr_vesp_entr,
					$hr_vesp_saida,
					$cd_depr ) {
                    
      $this->parametro("nm_usrs","STRING"  ,$nm_usrs );
      $this->parametro("ds_email","STRING"  ,$ds_email );	  
      $this->parametro("cd_acss","NUMERICO",$cd_acss );
      $this->parametro("cd_depr","NUMERICO",$cd_depr );	  
      $this->parametro("nm_logn","STRING"  ,$nm_logn );
      $this->parametro("cd_pass","STRING"  ,$cd_pass );
      $this->parametro("in_tipo","STRING"  ,$in_tipo );
      $this->parametro("hr_matt_entr" ,"STRING"  ,$hr_matt_entr );	  
      $this->parametro("hr_matt_saida","STRING"  ,$hr_matt_saida );	  	  
      $this->parametro("hr_vesp_entr","STRING"  ,$hr_vesp_entr );	  	  
      $this->parametro("hr_vesp_saida","STRING"  ,$hr_vesp_saida );	  	  

      $rows = 0;
      if ($this->open("insert into knoll_usuarios (nm_usrs,
                                             cd_acss,
                                             nm_logn,
                                             cd_pass,
                                             in_tipo,
											 ds_email,
											 hr_matt_entr,
											 hr_matt_saida,
											 hr_vesp_entr,
											 hr_vesp_saida,
											 cd_depr )
                   values (:nm_usrs,
                           :cd_acss,
                           :nm_logn,
                           :cd_pass,
                           :in_tipo,
						   :ds_email,
						   :hr_matt_entr,
						   :hr_matt_saida,
						   :hr_vesp_entr,
						   :hr_vesp_saida,
						   :cd_depr )")) return 1;
      else return 0;
   }

   function update( $cd_usrs,
                    $nm_usrs,
                    $cd_acss,
                    $nm_logn,
                    $cd_pass,
                    $in_tipo,
					$ds_email,
					$hr_matt_entr,
					$hr_matt_saida,
					$hr_vesp_entr,
					$hr_vesp_saida,
					$cd_depr 	 ){

      $this->parametro("cd_usrs","NUMERIC",$cd_usrs );
      $this->parametro("nm_usrs","STRING"  ,$nm_usrs );
      $this->parametro("cd_acss","NUMERIC",$cd_acss );
      $this->parametro("cd_depr","NUMERIC",$cd_depr );	  
      $this->parametro("nm_logn","STRING"  ,$nm_logn );
      $this->parametro("cd_pass","STRING"  ,$cd_pass );
      $this->parametro("in_tipo","STRING"  ,$in_tipo );
      $this->parametro("ds_email","STRING"  ,$ds_email );	  
      $this->parametro("hr_matt_entr" ,"STRING"  ,$hr_matt_entr );	  
      $this->parametro("hr_matt_saida","STRING"  ,$hr_matt_saida );	  	  
      $this->parametro("hr_vesp_entr","STRING"  ,$hr_vesp_entr );	  	  
      $this->parametro("hr_vesp_saida","STRING"  ,$hr_vesp_saida );	  	  
	  
      // atualizamos com as novas informações
      if( $this->open("update knoll_usuarios set nm_usrs=:nm_usrs,
                                           nm_logn=:nm_logn,
                                           cd_pass=:cd_pass,
                                           cd_depr=:cd_depr,								   
                                           in_tipo=:in_tipo,
										   ds_email=:ds_email,
										   hr_matt_entr=:hr_matt_entr,
										   hr_matt_saida=:hr_matt_saida,
										   hr_vesp_entr=:hr_vesp_entr,
										   hr_vesp_saida=:hr_vesp_saida
                                     where cd_usrs = :cd_usrs") ) return 1;
      else return 0;
   }

   function delete($cd_usrs) {

      $this->parametro("cd_usrs","NUMERICO",$cd_usrs );

      $this->open(" delete from knoll_usuarios
                     where cd_usrs = :cd_usrs ");
      return $this->linhas;

   }

   function select(  $cd_usrs = "",
                     $nm_usrs = "",
                     $cd_acss = "",
                     $nm_logn = "",
                     $cd_pass = "",
                     $in_tipo = "",
                     $cd_modl = ""  ) {

      $where = "";

      if ($cd_usrs!="" ){
          $this->parametro("cd_usrs","NUMERIC",$cd_usrs );
          $where =" Where cd_usrs=:cd_usrs ";
      }
      if ($nm_usrs!="" ){
          $this->parametro("nm_usrs","CLIKE",$nm_usrs );
          ($where=="")?$where =" Where upper( nm_usrs) like (:nm_usrs) ":$where .=" and upper( nm_usrs) like (:nm_usrs) ";
      }
      if ($cd_acss!="" ){
          $this->parametro("cd_acss","NUMERIC",$cd_acss );
          ($where=="")?$where =" Where cd_acss=:cd_acss ":$where .=" and cd_acss=:cd_acss";
      }
      if ($nm_logn!="" ){
          $this->parametro("nm_logn","STRING"  ,$nm_logn );
          ($where=="")?$where =" Where nm_logn=:nm_logn ":$where .=" and nm_logn=:nm_logn";
      }
      if ($cd_pass!="" ){
          $this->parametro("cd_pass","STRING"  ,$cd_pass );
          ($where=="")?$where =" Where cd_pass=:cd_pass ":$where .=" and cd_pass=:cd_pass";
      }
      if ($cd_modl!="" ){
          $this->parametro("cd_modl","NUMERIC",$cd_modl );
          ($where=="")?$where =" Where CD_MODL_CLNT=:cd_modl ":$where .=" and CD_MODL_CLNT=:cd_modl";
      }
      if ($in_tipo!="" ){
          $this->parametro("in_tipo","STRING"  ,$in_tipo );
          ($where=="")?$where =" Where in_tipo=:in_tipo ":$where .=" and in_tipo=:in_tipo";
      }

      //  if ($this->orderby=="") $this->orderby("");
         if ($this->open("select cd_usrs,
                                 nm_usrs,
                                 nm_logn,
                                 cd_acss,
                                 cd_pass,
                                 cd_modl_clnt as cd_modl,
								 ds_email,
					   case when in_tipo ='C' Then 'Cliente' 
						    else 'Funcionário' end as Tipo,
						         in_tipo,
								 hr_matt_entr,
								 hr_matt_saida,
								 hr_vesp_entr,
								 hr_vesp_saida,
								 cd_depr 
                            from knoll_usuarios ".$where)) {

           $this->cd_usrs       = $this->gs["CD_USRS"][0];
           $this->nm_usrs       = $this->gs["NM_USRS"][0];
           $this->cd_acss       = $this->gs["CD_ACSS"][0];
           $this->nm_logn       = $this->gs["NM_LOGN"][0];
           $this->cd_pass       = $this->gs["CD_PASS"][0];
           $this->cd_modl       = $this->gs["CD_MODL"][0];
		   $this->in_tipo       = $this->gs["IN_TIPO"][0];	  
		   $this->cd_depr       = $this->gs["CD_DEPR"][0];	  		   
		   $this->ds_email      = $this->gs["DS_EMAIL"][0];	  
		   $this->hr_matt_entr  = $this->gs["HR_MATT_ENTR"][0];
		   $this->hr_matt_saida = $this->gs["HR_MATT_SAIDA"][0];
 		   $this->hr_vesp_entr  = $this->gs["HR_VESP_ENTR"][0];
		   $this->hr_vesp_saida = $this->gs["HR_VESP_SAIDA"][0]; 		   		   

         }
      return $this->linhas;
   }
   
   function gravar_acesso($cd_usrs,$cd_menu,$in_tipo='i'){
   
      $this->parametro("cd_usrs","NUMERIC",$cd_usrs );
      $this->parametro("cd_menu","NUMERIC",$cd_menu );	  
	  
	  if($in_tipo == 'd') $this->open("delete from knoll_menu_usuario where cd_usrs=:cd_usrs");	    	
	  else $this->open("insert into knoll_menu_usuario(cd_usrs,cd_menu) values(:cd_usrs,:cd_menu) ");
	  
	  return $this->rows;   
  }
   
}
?>
