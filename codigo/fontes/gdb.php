<?
///////////////////////////////////////////////////////////////////////////////
// Arquivo de fun��es desenvolvida para qualquer sistema feito em PHP        //
// Fun��es para manipula��o de Banco de Dados                                //
// Desenvolvedor : Eug�nio Jos� da Costa                                     //
// Cria��o : 24/10/2006                                                      //
// Empresa: EJC Inform�tica                                                  //
///////////////////////////////////////////////////////////////////////////////

class gdb {
 
     // variavel para titulo de campo
     var $titulo_campo;
     
     // variavel para formato de campo
     var $formato_campo;
     
     // variavel para visibilidade do campo
     // V - Visivel | N - N�o Visivel
     var $visivel_campo;
     
     // variavel para alinhamento do campo
     // E - esquerda | D - Direita | C - Centro
     var $alinha_campo;
	 
     // variavel para largura da tabela 
	   var $largura; 
     
     // variavel para retornar o campo chave
     var $chave_campo;

     // variavel para guardar mensagens de erro de transa��o
     var $erro_bd;

     // variavel com a estru��o SQL
     var $sql_list;
      
      // variavel para a coenxao com o banco
     var $conexao_lg = 0;
	  
	   var $tabela = array(); 
	  
	   var $ds_sql_open;
	  
	   var $vt_parm;

     var $campos;
     
     
     var $lg_resl;
	  
	   var $linhas;	  
     
     // Fun��o para conex�o ao banco de dados
     function conexao($banco ='nffac617_marlon',
                       $servidor='localhost',
                       $usuario='nffac617_nff',
                       $senha='eugenio@48' ){
     
        $resultado = 0;
        $resultado = mysqli_connect( $servidor , $usuario , $senha, $banco );
        $this->conexao_lg=$resultado;

        if ( $resultado && $banco !='' ){
             if( !mysqli_select_db($this->conexao_lg,$banco) ){
                 mysqli_close($this->conexao_lg);
                 print "N�o Acessou o banco !!";
             }		 
        }
        return $resultado;
     }
     
     function parametro( $vr_sql,
                         $vr_tipo,
                         $vr_valor ){
              
		if( $vr_valor ==''){
		    $vr_valor = 'null';
        $vr_tipo  = 'NUMERIC';		   
		}	             
        $this->vt_parm[$vr_sql]['TIPO']=$vr_tipo;
        $this->vt_parm[$vr_sql]['VALOR']=$vr_valor;
                         
    }
     
     // funcao para execucao de comandos SQL
     function open( $ds_sql='',
                    $nu_linh=0,
									  $utf8 = 1 ){

        if( !$this->conexao_lg ){
           // $this->conexao('formula1');  		   
           $this->conexao('nffac617_marlon','localhost','nffac617_nff','eugenio@48');
        }
        
        $this->erro_bd=0;
        
        

        // Passando para o parametro para o SQL
        if ( is_array( $this->vt_parm ) ){
           $vr_camp =array_keys( $this->vt_parm );
           
           // procurando os parametros no vetor
           for( $vr_index=0 ;
                $vr_index<count( $this->vt_parm ) ;
                $vr_index++ ){
				
             if( $this->vt_parm[$vr_camp[$vr_index]]['VALOR'] !="" ){ 
                // preparando os valores de acordo com o tipo
                if( strtoupper( $this->vt_parm[$vr_camp[$vr_index]]['TIPO'] )=="STRING"  )
                  $vr_valr="'".$this->vt_parm[$vr_camp[$vr_index]]['VALOR']."'";
                  
                elseif( strtoupper( $this->vt_parm[$vr_camp[$vr_index]]['TIPO'] )=="NUMERIC"  ){
   				      $vr_valr =str_replace(".","", $this->vt_parm[$vr_camp[$vr_index]]['VALOR'] );
	                  $vr_valr =str_replace(",",".",$vr_valr);                       				  
					                        
                }elseif( strtoupper( $this->vt_parm[$vr_camp[$vr_index]]['TIPO'] )=="ELIKE"  )
                      $vr_valr="'%".$this->vt_parm[$vr_camp[$vr_index]]['VALOR']."'";
                      
                elseif( strtoupper( $this->vt_parm[$vr_camp[$vr_index]]['TIPO'] )=="DLIKE"  )
                      $vr_valr="'".$this->vt_parm[$vr_camp[$vr_index]]['VALOR']."%'";
                      
                elseif( strtoupper( $this->vt_parm[$vr_camp[$vr_index]]['TIPO'] )=="CLIKE"  )
                      $vr_valr="'%".$this->vt_parm[$vr_camp[$vr_index]]['VALOR']."%'";
                      
                elseif( strtoupper( $this->vt_parm[$vr_camp[$vr_index]]['TIPO'] )=="DATA"  )
                      $vr_valr="'".$this->vt_parm[$vr_camp[$vr_index]]['VALOR']."'";
					  
                elseif( strtoupper( $this->vt_parm[$vr_camp[$vr_index]]['TIPO'] )=="IDATA"  )
                      $vr_valr="'".date("Y-m-d H:i:s",strtotime( $this->vt_parm[$vr_camp[$vr_index]]['VALOR']))."'";
					  
                elseif( strtoupper( $this->vt_parm[$vr_camp[$vr_index]]['TIPO'] )=="DIDATE" || 
				        strtoupper( $this->vt_parm[$vr_camp[$vr_index]]['TIPO'] )=="DIDATA"  ){
				        $vr_valr=$this->vt_parm[$vr_camp[$vr_index]]['VALOR'];
		                $vr_valr=substr($vr_valr,6,4)."-".substr($vr_valr,3,2)."-".substr($vr_valr,0,2);		
                        $vr_valr="'".$vr_valr." 00:00'";
				    }		
				elseif( strtoupper( $this->vt_parm[$vr_camp[$vr_index]]['TIPO'] )=="DTDATE" ||
               			strtoupper( $this->vt_parm[$vr_camp[$vr_index]]['TIPO'] )=="DTDATA" ){
				        $vr_valr=$this->vt_parm[$vr_camp[$vr_index]]['VALOR'];
		                $vr_valr=substr($vr_valr,6,4)."-".substr($vr_valr,3,2)."-".substr($vr_valr,0,2);		
                        $vr_valr="'".$vr_valr." 23:59'";
				    }
				elseif( strtoupper( $this->vt_parm[$vr_camp[$vr_index]]['TIPO'] )=="PDATE" ||
               			strtoupper( $this->vt_parm[$vr_camp[$vr_index]]['TIPO'] )=="PDATA" ){
				        $vr_valr=$this->vt_parm[$vr_camp[$vr_index]]['VALOR'];
		                $vr_valr=substr($vr_valr,6,4).substr($vr_valr,3,2).substr($vr_valr,0,2);
				    }
				elseif( strtoupper( $this->vt_parm[$vr_camp[$vr_index]]['TIPO'] )=="NDATE" || 
				        strtoupper( $this->vt_parm[$vr_camp[$vr_index]]['TIPO'] )=="NDATA" ){
				        $vr_valr=$this->vt_parm[$vr_camp[$vr_index]]['VALOR'];
		                $vr_valr="'".substr($vr_valr,6,4)."-".substr($vr_valr,3,2)."-".substr($vr_valr,0,2)."'";		
				    }					
                elseif( strtoupper( $this->vt_parm[$vr_camp[$vr_index]]['TIPO'] )=="DATE"  )
                      $vr_valr="'".$this->vt_parm[$vr_camp[$vr_index]]['VALOR']."'";
					  
                elseif( strtoupper( $this->vt_parm[$vr_camp[$vr_index]]['TIPO'] )=="IDATE"  )
                      $vr_valr="'".date("Y-d-m H:i:s",strtotime( $this->vt_parm[$vr_camp[$vr_index]]['VALOR']))."'";						  					  
					  
              }  
              $ds_sql =str_replace(":".$vr_camp[$vr_index],$vr_valr,$ds_sql);
            }
        }
			 
        if( $utf8 ){ 
					$this->lg_resl = mysqli_query($this->conexao_lg, "SET NAMES 'utf8'" );
				}	
       
        $this->lg_resl = mysqli_query($this->conexao_lg, $ds_sql );
        
        
         $select =strstr( strtoupper( $ds_sql ), strtoupper( "select" ) );
		
		if( strstr( strtoupper( $ds_sql ), strtoupper( "insert" ) ) !='' || 
		    strstr( strtoupper( $ds_sql ), strtoupper( "delete" ) ) !='' ||
			strstr( strtoupper( $ds_sql ), strtoupper( "update" ) ) !='' ) $select = '';
		
		
		 
        if( $this->lg_resl ){ // Se o resultado do query for verdadeiro, pode criar o vetor com a tabela
          if ( $select !='' ) {
            $this->campos  = mysqli_num_fields( $this->lg_resl ) ; // total de campos da tabela
            
            $this->linhas  = mysqli_num_rows( $this->lg_resl );
            if ( $nu_linh>1 && $this->linhas>$nu_linh ) $this->linhas =$nu_linh;
            if ( $this->linhas>0 && $this->campos>0 ){
               for( $xlinhas=0;
                    $xlinhas<$this->linhas ;
                    $xlinhas++ ){
                    $registro = mysqli_fetch_row( $this->lg_resl );
                    for( $xcampos=0;
                         $xcampos<$this->campos;
                         $xcampos++ ){
                         
                         $nameField = mysqli_fetch_field_direct( $this->lg_resl, $xcampos);
                       
                         $this->gs[ strtoupper( $nameField->name  ) ][$xlinhas]=$registro[$xcampos];
                         
			 if($xlinhas == 0){
			   $this->tabela[] = strtoupper($nameField->name  ); 
			 }	
			  			
                         /*
                         $this->gs[ strtoupper( mysql_field_name( $ds_sql ,$xcampos ) ) ][$xlinhas]=$registro[$xcampos];
						 if($xlinhas == 0) $this->tabela[] = strtoupper( mysql_field_name( $ds_sql ,$xcampos )); 
			 */						 
                    }
               }
            }
          }
        } else $this->erro_bd=1;

        if( $nu_linh==1 ) print '<BR>'.$ds_sql.'<BR>';
        
        // $this->lg_resl  =$lg_resl;
        $this->sql_list =$ds_sql;
                  
        return $this->lg_resl;
     }
     
     function formato($vr_varv,$vr_form){

        $vr_form =strtoupper($vr_form);
        $vr_resl =$vr_varv;
        
        switch($vr_form){
            case "DD/MM/YY":
                  if( count($vr_varv)==10 ) $vr_resl=substr($vr_varv,0,2)."/".
                                                      substr($vr_varv,3,2)."/".
                                                      substr($vr_varv,8,2);
                  else $vr_resl=substr($vr_varv,0,2)."/".
                                substr($vr_varv,3,2)."/".
                                substr($vr_varv,6,2);
                 break;
            case "YYYY/MM":
                  if( count($vr_varv)==10 ) $vr_resl=substr($vr_varv,6,4)."/".
                                                      substr($vr_varv,3,2);
                  else $vr_resl='20'.substr($vr_varv,6,2)."/".substr($vr_varv,3,2);
                 break;
            case "DD/MM/YYYY":
                  if( count($vr_varv)==12 ) $vr_resl=substr($vr_varv,0,2)."/".
                                                      substr($vr_varv,3,2)."/".
                                                      substr($vr_varv,8,4);
                  else $vr_resl=substr($vr_varv,0,2)."/".
                                substr($vr_varv,3,2)."/".
                                substr($vr_varv,6,4);
                 break;
            case "MM/YYYY":
                  if( count($vr_varv)==10 ) $vr_resl=substr($vr_varv,3,2)."/".
                                                      substr($vr_varv,6,4);
                  else $vr_resl='20'.substr($vr_varv,3,2)."/".substr($vr_varv,6,4);
                 break;				 
			case "VALOR":
			     $vr_resl =number_format($vr_varv, 2, ',', '.');
				 break; 	 
			case "MOEDA":
			     $vr_resl ="R$ ".number_format($vr_varv, 2, ',', '.');
				 break;
        }
		
     return $vr_resl;
     }
     
     function print_tabela( $titulo = "", 
                            $in_incl = 1, 
                            $tem_botao_novo = 1, 
                            $nomeBotaoConsulta = 'Nova Consulta'  ){
          //  Montagem do vetor titulo
          $this->vt_titl =explode(",", $this->titulo_campo );
          
          //  Montagem do vetor formato
          $this->vt_form =explode(",", $this->formato_campo );

          //  Montagem do vetor visibilidade
          $this->vt_visv =explode(",", strtoupper( $this->visivel_campo ) );

         //  Montagem do vetor de alinhamento
          $this->vt_alnh =explode(",", strtoupper( $this->alinha_campo ) );
		  
          // Montagem do Cabe�alho
          $cl_visb =array_count_values($this->vt_visv);
          
          ?>
          <div class="container">  
          <div class="row">
          <div class="col-lg-<? print (2 * $cl_visb["V"]); ?>">
          <div class="well">
		  <table class="table table-striped table-bordered table-hover "
                 width="<? print $this->largura; ?>" border=1 cellpadding="<? print $cl_visb["V"]; ?>" cellspacing='0' >
          <tr align="center"  >
          <td colspan="<? print $cl_visb["V"]; ?>">                                                       
               <a href="#" class="list-group-item active">
              <b><?	if( !$in_incl ) print utf8_encode($titulo); 
					else print $titulo; 
				?></b>
              </a>
           </td>
          </tr>
          <tr>
          <?
          for( $xcol=0;
               $xcol<=$this->campos;
               $xcol++ ){
                       
                       if ( isset( $this->vt_visv[$xcol] )  &&  strtoupper( $this->vt_visv[$xcol] ) =="V" ) {
												    $nameField = mysqli_fetch_field_direct( $this->lg_resl, $xcol);
                            if ($this->vt_titl[$xcol]!="") $xcoluna =$this->vt_titl[$xcol];
                            else $xcoluna = $nameField->name; 
          ?> <th class=titulo onMouseOver="this.style.cursor='pointer';" 
                              OnClick="OrdemColuna(<? print $xcol; ?>);"  ><? if( !$in_incl ) print utf8_encode($xcoluna); 
							                                                  else print $xcoluna;  ?></th>
           <?
                       }
          }
         ?>
           </tr><?
              // onMouseOver="this.style.background-image=url('../images/botao1.jpg');              // onMouseOver="this.style.cursor='hand'";
              // onMouseOut="this.style.background-image=url('../images/botao3.jpg')"
			  
		 // Setor de configura��o da fun��o escolher.	  
          for( $xlin=0 ;$xlin<$this->linhas ; $xlin++ ){
			  
                  $dado =""; 					  
		  if( $this->chave_campo !="" ){				      
			  $xcampo =explode(",",$this->chave_campo);	
			  
			  // for( $xchave =0;$xchave<count($xcampo); $xchave++ ){				  
			  foreach( $xcampo as $xchave=>$value){		
			        $nameField = mysqli_fetch_field_direct( $this->lg_resl, $xchave);			  
			     
			     if( $dado == "" ) $dado ="'".$this->gs[ strtoupper($nameField->name ) ][$xlin]."'"; 
				 else $dado .=",'".$this->gs[ strtoupper( $nameField->name ) ][$xlin]."'";
			  }
		  }
		  // print 'Dados :'.$dado;?>	 
               
               <tr 
                   OnClick="escolher(<? print $dado; ?>);" 
                   onMouseOver="this.style.cursor='pointer';" >
               <?
                for( $xcol=0 ;
                     $xcol<$this->campos ;
                     $xcol++ ){
                     if ( $this->vt_visv[$xcol]=="V" ) {
                       ?><td align=<? if ($this->vt_alnh[$xcol]=="C")     print "center";
                                        elseif ($this->vt_alnh[$xcol]=="D") print "right";
                                        else print "left"; ?> >&nbsp;<? 	
                        $nameField = mysqli_fetch_field_direct( $this->lg_resl, $xcol);                					  				  				
                       if( !$in_incl ) print utf8_encode($this->formato($this->gs[ strtoupper( $nameField->name ) ][$xlin],$this->vt_form[$xcol]) );
						  else print $this->formato($this->gs[ strtoupper( $nameField->name  ) ][$xlin],$this->vt_form[$xcol]);
                     ?></td>
                <?   }
                }?>
             </tr>
       <? } ?>
          <tr><td  colspan="<? print $cl_visb["V"]; ?>"><b><? print "Total de Registro : ".$this->linhas; ?></b></td></tr>
          <tr align="left"  >
            <td colspan="<? print $cl_visb["V"]; ?>">                                                       
             <input type=button class="btn btn-default btn-small" value="<? print $nomeBotaoConsulta; ?>" onclick="consultar(0)">
             <? if( $tem_botao_novo == 1  ){ ?>
                    <input type=button class="btn btn-danger btn-small"  value="Novo" onclick="escolher('-1')">
              <? } ?>
            </td>
          </tr>
          </table>
          </div>
          </div>
          </div>
          </div>
       <?
	   // Verifica��o da open
       if( $this->sql_list != '' && $in_incl ){		  		  
	       if( file_exists('../../biblioteca/php/sql.txt') ){		      
               $fp = fopen('../../biblioteca/php/sql.txt','w');
               fwrite($fp, $this->sql_list ); // grava a string no arquivo. Se o arquivo n�o existir ele ser� criado
               fclose($fp);		   
		   }
	    } 	  

	   
     }
     
     
     function print_tabela_especial( $titulo = "" ){
          //  Montagem do vetor titulo
          $this->vt_titl = explode (",", $this->titulo_campo );
          
          //  Montagem do vetor formato
          $this->vt_form = explode (",", $this->formato_campo );

          //  Montagem do vetor visibilidade
          $this->vt_visv = explode (",", strtoupper( $this->visivel_campo ) );

         //  Montagem do vetor de alinhamento
          $this->vt_alnh =explode (",", strtoupper( $this->alinha_campo ) );

          // Montagem do Cabe�alho
          $cl_visb =array_count_values($this->vt_visv);
          
          ?>
          <table class="table_interna" border=1 cellpadding="<? print $cl_visb["V"]; ?>" cellspacing='0' >
          <tr align="center" >
          <td  colspan="<? print $cl_visb["V"]; ?>"><b><? print $titulo; ?></b>
          </td>
          </tr>
          <tr><b>
          <?
          for( $xcol=0 ;
               $xcol<$this->campos ;
               $xcol++ ){
               
               $nameField = mysqli_fetch_field_direct( $this->lg_resl, $xcol);	
                
                       if ( $this->vt_visv[$xcol]=="V" ) {
                          if ($this->vt_titl[$xcol]!="") $xcoluna =$this->vt_titl[$xcol];
                          else $xcoluna = $nameField->name;
          ?> <th class="sub_titulo" ><? print $xcoluna;  ?></th>
           <?
                       }
          }
         ?></b>
           </tr><?
             // onMouseOver="this.style.cursor='pointer';
             // this.style.cursor='hand'"
             // onMouseOut="this.style.background-image=url('../images/botao3.jpg')"
			 
		  $cor = '#FFFFFF'; 	 
		
          for( $xlin=0 ;
               $xlin<$this->linhas ;
               $xlin++ ){
               
               $nameFieldTitulo = mysqli_fetch_field_direct( $this->lg_resl, $xchave );	
               
               
               ?>
               <tr OnClick="escolher('<? print $this->gs[ strtoupper( $nameFieldTitulo->name )][$xlin]; ?>')" 
                   bgcolor=<? print $cor; ?> onMouseOver="this.style.cursor='pointer';" onMouseOut="this.style.cursor='';" >
               <?
                for( $xcol=0 ;
                     $xcol<$this->campos ;
                     $xcol++ ){
                    
                     $nameField = mysqli_fetch_field_direct( $this->lg_resl, $xcol );	
                      
                     if ( $this->vt_visv[$xcol]=="V" ) {
                          ?><td align=<? if ($this->vt_alnh[$xcol]=="C")     print "center";
                                          elseif ($this->vt_alnh[$xcol]=="D") print "right";
                                          else print "left"; ?> ><font class="label"><?
                          print $this->gs[ strtoupper( $nameField->name ) ][$xlin];
                     ?></font></td>
                <?   }
                }
				
				if($cor =='#FFFFFF' ) $cor = '#CCCCCC';
				else $cor = '#FFFFFF';
				
				?>
                
             </tr>
       <? } ?>
          <td  colspan="<? print $cl_visb["V"]; ?>"><b><font class="label"><? print "Total de Registro : ".$this->linhas; ?></font></b></td>
          </table> <?
     }     
 
   function vargetpost($chave, $padrao = "") {
      $retornar ="";
	  /*
	  print '<pre>';
	  print 'Vetor POST<br>';
	  print_r( $_POST );
	  print '</pre>';	  
	  print '<pre>';	  	  	  
	  print 'Vetor GET<br>';	  
	  print_r( $_GET );	  
	  print '</pre>';	  
	  */
      if (isset($_POST[$chave]) ){
		 if( $_POST[$chave] !='' ) $retornar= $_POST[$chave];
	  } 	  
	  if (isset($_GET[$chave]) && $retornar == '' ){
	     if( $_GET[$chave] !='' ) $retornar= $_GET[$chave];	  
	  } 
      
	  if(  $retornar == '' ) $retornar =$padrao;
	  
	  return $retornar;
   }
   
   function print_erro(){
      echo 'erro n. '.mysql_errno().': '.mysql_error().'<BR>';
      print 'Comando SQL :';
      print_r( $this->sql_list );
   }

   function retorno($links, $parametros=array(), $janela="") {
      $strx = "";
      foreach ($parametros as $key => $value)
         $strx .= urlencode($key) . "=" . urlencode($value) . "&";
      $strx = substr($strx, 0, count($strx) - 1);
      if     ($janela == "")  print "<script> document.location.href=\"$links?$strx\"</script>";
	  else if($janela == "D") print "<script>document.location.href=\"$links\"</script>";	 
      else                    print '<script> window.open("'.$links.'?'.$strx.'", "",'."'directories=0,location=0,menubar=0,resizable=1,scrollbars=1,status=0,toolbar=0,left=100,top=50,width=800,height=600');</script>";
   }

  function AdcionarDiasNaData($date,$days) {	   
       //print "Date :".$date."<br>";
	   $thisyear = substr ( $date, 0, 4 );
	   $thismonth = substr ( $date, 5, 2 );
	   $thisday =  substr ( $date, 8, 2 );
	   //print "Dias :".$thisday;
	   $nextdate = mktime ( 0, 0, 0, $thismonth, $thisday + $days, $thisyear );
	   return strftime("%Y-%m-%d", $nextdate).' 00:00:00';
  }

  function SubtrairDiasNaData($date,$days) {	   
       //print "Date :".$date."<br>";
	   $thisyear = substr ( $date, 0, 4 );
	   $thismonth = substr ( $date, 5, 2 );
	   $thisday =  substr ( $date, 8, 2 );
	   //print "Dias :".$thisday;
	   $nextdate = mktime ( 0, 0, 0, $thismonth, $thisday - $days, $thisyear );
	   return strftime("%Y-%m-%d", $nextdate).' 00:00:00';
  }

  function vencimento( $dia ){	  
	if( date('d')<$dia ){
		$mes = date('m');
		$ano = date('Y');
	}else{
	  if( date('m') == 12 ){
		$mes = 1;
		$ano = date('Y') + 1;		
	  }else{
		$mes  = date('m')+1;
		$ano = date('Y');
	  }
	}	
	$vencimento = $dia.'/'.$mes.'/'.$ano; 	
	return $vencimento;
  }
   
  function ajustar_valores( $valor ){
    if( strlen( $valor )>6 ) $valor = str_replace('.','',$valor);
    $valor = str_replace(',','.',$valor);
	return $valor;
  }

  function selectDados( $select ){
                        
      $this->open( $select );                 

      if( $this->linhas>0 ){

         for( $xlin=0 ;  $xlin< $this->linhas ; $xlin++ ){
             for( $xcol=0 ;$xcol<$this->campos; $xcol++ ){
                 $xcoluna = strtoupper( mysqli_field_name( $this->lg_resl , $xcol ) );
                 $value = $this->gs[$xcoluna][$xlin];
                 $dadosAux[$xcoluna ] = $value;
            }
            $dadosUsuario[] = $dadosAux;
         }

         array_walk_recursive( 
              $dadosUsuario,
              function (&$value){ 
                if ( is_string($value) ){
                     $value = utf8_encode($value); 
                }     
          } );
         
         echo json_encode($dadosUsuario);

      }else{
         print 0; 
      }
  }

  function dados( $gdb ){
                        
       $gdb->open( $select );                 

      if( $gdb->linhas>0 ){

         for( $xlin=0 ;  $xlin< $gdb->linhas ; $xlin++ ){
             for( $xcol=0 ;$xcol<$gdb->campos; $xcol++ ){
                 $xcoluna = strtoupper( mysqli_field_name( $gdb->lg_resl , $xcol ) );
                 $value = $gdb->gs[$xcoluna][$xlin];
                 $dadosAux[$xcoluna ] = $value;
            }
            $dadosUsuario[] = $dadosAux;
         }

         array_walk_recursive( 
              $dadosUsuario,
              function (&$value){ 
                if ( is_string($value) ){
                     $value = utf8_encode($value); 
                }     
          } );
         
         echo json_encode($dadosUsuario);

      }else{
         print 0; 
      }
  }


 } ?>