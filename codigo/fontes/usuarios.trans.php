<?
   include_once("abertura.php");
   include_once("usuarios.func.php");

   $gdb = new usuarios;

   $cd_usrs       = $gdb->vargetpost("cd_usrs");
   $nm_usrs       = $gdb->vargetpost("nm_usrs");
   $cd_acss       = $gdb->vargetpost("cd_acss");
   $nm_logn       = $gdb->vargetpost("nm_logn");
   $cd_pass       = $gdb->vargetpost("cd_pass");
   $cd_depr       = $gdb->vargetpost("cd_depr");   
   $cd_modl       = $gdb->vargetpost("cd_modl");
   $in_tipo       = $gdb->vargetpost("in_tipo");
   $ds_email      = $gdb->vargetpost("ds_email");
   $acao          = $gdb->vargetpost("acao");
   $hr_matt_entr  = $gdb->vargetpost("hr_matt_entr");
   $hr_matt_saida = $gdb->vargetpost("hr_matt_saida");
   $hr_vesp_entr  = $gdb->vargetpost("hr_vesp_entr");
   $hr_vesp_saida = $gdb->vargetpost("hr_vesp_saida");
   $menu 		  = $_POST["NM_MENU"];   
   $sub_menu 	  = $_POST["SB_MENU"];      
   
   /*
   print '<pre>';
   print_r($_GET);
   print '</pre>';   

   print '<pre>';
   print_r($_POST);
   print '</pre>';      
   */
   
   switch ($acao) {
      case 'i':
         if ($gdb->insert( $nm_usrs,
                           $cd_acss,
                           $nm_logn,
                           $cd_pass,
                           $in_tipo,
						   $ds_email,
						   $hr_matt_entr,
						   $hr_matt_saida,
						   $hr_vesp_entr,
						   $hr_vesp_saida,
						   $cd_depr ) )
            $msg = "Inclusão";
         break;
      case 'u':
         if ($gdb->update( $cd_usrs,
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
						   $cd_depr  ) ){						   
						   
			$gdb->gravar_acesso($cd_usrs,'','d');			   
			$value =0;
			
			if( count($menu)>0 ){
				foreach($menu as $value){
					$gdb->gravar_acesso($cd_usrs,$value,'i');
				}						   
				foreach($sub_menu as $value){
					$gdb->gravar_acesso($cd_usrs,$value,'i');				
				}						   			
			}
			
            $msg = "Alteração";			
		 }
         break;
      case 'u2':
         if ($gdb->update( $cd_usrs,
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
						   $cd_depr  ) ) $msg = "Alteração";			
         break;		 
      case 'd':
         if ( $gdb->delete($cd_usrs) ){
			$gdb->gravar_acesso($cd_usrs,'','d');			   		 
            $msg = "Exclusão";
		 }	
         break;
   }
  
   if ($gdb->erro_bd) {
      $gdb->print_erro();
   } else {
      if($acao =='u2') 
         $gdb->retorno("usuarios.cad2.php",array("msg" => $msg." efetuada com sucesso!!!","cd_usrs" =>$cd_usrs) );
	  else
         $gdb->retorno("usuarios.cons.php",array("msg" => $msg." efetuada com sucesso!!!") );	  
   }
   
   return true;
  

?>
