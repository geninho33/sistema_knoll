<?
include_once('gdb.php'); 
   
class acesso_sistema extends gdb { 
   
   function insert( $cd_acss ='', 
                    $cd_usrs ='', 
					$dt_acss ='',  
					$hr_acss ='', 
					$nu_ip   ='' ) {	  				
					
      $this->parametro('cd_usrs' ,'NUMERIC',$cd_usrs );
      $this->parametro('dt_acss' ,'STRING',$dt_acss );
      $this->parametro('hr_acss' ,'STRING',$hr_acss );
      $this->parametro('nu_ip' ,'STRING',$nu_ip );
   
      $rows = 0; 
      if ($this->open('insert into acessos_sistema ( cd_usrs,
	                                                 dt_acss,
													 hr_acss,
													 nu_ip) 
                                            values( :cd_usrs,
									                :dt_acss,
											        :hr_acss,
											        :nu_ip)') ) 
   return 1;
   else return 0;
   } 
   
   function update( $cd_acss, 
                    $cd_usrs, 
					$dt_acss, 
					$hr_acss, 
					$nu_ip) {
					
      $this->parametro('cd_acss' ,'NUMERIC',$cd_acss );
      $this->parametro('cd_usrs' ,'NUMERIC',$cd_usrs );
      $this->parametro('dt_acss' ,'STRING',$dt_acss );
      $this->parametro('hr_acss' ,'STRING',$hr_acss );
      $this->parametro('nu_ip' ,'STRING',$nu_ip );
   
            $rows = 0; 
      if ($this->open('update acessos_sistema set   
                              cd_usrs=:cd_usrs, 
                              dt_acss=:dt_acss, 
                              hr_acss=:hr_acss, 
                              nu_ip=:nu_ip 
                        where cd_acss=:cd_acss    ')) return 1;
      else return 0;
   } 
   
   function delete($cd_acss) { 
      $this->parametro('cd_acss' ,'NUMERIC',$cd_acss );
      $this->open(' delete from acessos_sistema  where cd_acss=:cd_acss '); 
   return $this->linhas;
   }   
   
   function select( $cd_acss ='',
                    $cd_usrs ='',
					$dt_incl ='',
					$dt_finl ='',
					$hr_incl ='',
					$hr_finl ='',					
					$nu_ip ='') {
      $where = ''; 
	  
      if ($cd_acss !='' ){ 
         $this->parametro('cd_acss' ,'NUMERIC',$cd_acss );
         $where =' and cd_acss=:cd_acss ';
      } 	  
      if ($cd_usrs !='' ){ 
         $this->parametro('cd_usrs' ,'NUMERIC',$cd_usrs );
         $where .=' and a.cd_usrs=:cd_usrs';
      } 	  
      if ($dt_incl !='' && $dt_finl !=''  ){ 	  
         $this->parametro('dt_incl' ,'STRING',$dt_incl );
         $this->parametro('dt_finl' ,'STRING',$dt_finl );	  		 
		 $where .=' and a.dt_acss BETWEEN :dt_incl AND :dt_finl'; 
      } 
      if ($hr_incl !='' && $hr_finl !=''  ){ 	  
         $this->parametro('hr_incl' ,'STRING',$hr_incl );
         $this->parametro('hr_finl' ,'STRING',$hr_finl );	  		 
		 $where .=' and a.hr_acss BETWEEN :hr_incl AND :hr_finl'; 
      } 
      if ($nu_ip !='' ){ 
         $this->parametro('nu_ip' ,'STRING',$nu_ip );
         $where =' and nu_ip=:nu_ip';
      } 
      if($this->open(" select a.cd_acss,
	                          a.cd_usrs,
							  u.nm_usrs as nome,
							  a.dt_acss,
							  a.hr_acss,
							  a.nu_ip  
					     from acessos_sistema a, 
						      usuarios u
						where u.cd_usrs=a.cd_usrs ".$where )) { 
   
         $this->cd_acss = $this->gs['CD_ACSS'][0]; 
         $this->cd_usrs = $this->gs['CD_USRS'][0]; 
         $this->nome    = $this->gs['NOME'][0]; 		 
         $this->dt_acss = $this->gs['DT_ACSS'][0]; 
         $this->hr_acss = $this->gs['HR_ACSS'][0]; 
         $this->nu_ip = $this->gs['NU_IP'][0]; 
      return true; 
      } 
   } 
   
   function acesso_modulo($cd_usrs,$cd_menu){       
	 
	  $this->open(" select max(cd_acss) as acesso 
							   from acessos_sistema 
							  where cd_usrs=".$cd_usrs );
							  
	  $acesso =$this->gs['ACESSO'][0];						  
	  
	  $this->parametro('cd_acss','NUMERIC',$acesso);
	  $this->parametro('cd_menu','NUMERIC',$cd_menu);  
	  
	  $this->open("select cd_acss 
	                    from acessos_modulo 
					   where cd_acss=:cd_acss 
					     and cd_menu=:cd_menu ");
	  if($this->linhas == 0){ 					 
	      $this->open(" insert into acessos_modulo( cd_acss,
	                                                cd_menu) 
										    values(:cd_acss,
										           :cd_menu) ");}
   }   
} 
?>