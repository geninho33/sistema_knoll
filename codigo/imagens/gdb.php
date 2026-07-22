<?

///////////////////////////////////////////////////////////////////////////////
// Arquivo de funções desenvolvida para qualquer sistema feito em PHP        //
// Funções para manipulação de Banco de Dados                                //
// Desenvolvedor : Eugênio José da Costa                                     //
// Criação : 24/10/2006                                                      //
// Empresa: EJC Informática                                                  //
///////////////////////////////////////////////////////////////////////////////

 class gdb {
 
     // Variavel para titulo de campo
     var $titulo_campo;
     
     // Variavel para formato de campo
     var $formato_campo;
     
     // Variavel para visibilidade do campo
     // V - Visivel | N - Não Visivel
     var $visivel_campo;
     
     // Variavel para visibilidade do campo
     // E - esquerda | D - Direita | C - Centro
     var $alinha_campo;
     
     // Variavel para pegar o campo chave
     var $chave_campo;

     // Variavel para guardar mensagens de erro de transação
     var $erro_bd;

     // Variavel com a estrução SQL
      var $sql_list;
      
      // Variavel para a coenxao com o banco
      var $conexao=0;
	
      // Variavel para a estrutura das tabelas	  
	  var $tabela = array();
     
	  var $vt_parm = array();

     // Função para conexão ao banco de dados
      function conexao($banco ='f133043_ejc',
                       $servidor='localhost',
                       $usuario='f133043_ejc',
                       $senha='eugenio@48' ){
					   
     
        $resultado=0;
        $resultado=mysql_connect( $servidor ,
                                  $usuario ,
                                  $senha );
        $this->conexao_lg=$resultado;

        if ( $resultado && $banco !='' ){
             if( !mysql_select_db($banco) ) mysql_close();
             // else print "conexao1 : ".$conexao."<br>";
		     // mysql_query("SET NAMES utf8");
             // mysql_query("SET CHARACTER_SET utf8");			 
        }
        return $resultado;
     }
     
     function parametro( $vr_sql,
                         $vr_tipo,
                         $vr_valor ){
                         
        $this->vt_parm[$vr_sql]['TIPO']=$vr_tipo;
        $this->vt_parm[$vr_sql]['VALOR']=$vr_valor;
                         
    }
     
     // função para execução de comandos SQL
     function open( $ds_sql='',
                    $nu_linh=0,
					$nm_banc='' ){
		
        if($this->conexao==0){
           /* $this->conexao('freiluca_BD');
           $this->conexao('f133043_ejc',
		                  'localhost',
						  'f133043_ejc',
						  '91193901');		   
			*/	
					  		   
           $this->conexao('f133043_ejc',
		                  'localhost',
						  'f133043_ejc',
						  'eugenio@48');		   
        }
        
        $this->erro_bd=0;

        // Passando para o parametro para o SQL
        if ( is_array( $this->vt_parm ) ){
           $vr_camp =array_keys( $this->vt_parm );
           
           // procurando os parametros no vetor
           for( $vr_index=0 ;
                $vr_index<count( $this->vt_parm ) ;
                $vr_index++ ){

                // preparando os valores de acordo com o tipo
                if( strtoupper( $this->vt_parm[$vr_camp[$vr_index]]['TIPO'] )=="STRING"  )
                  $vr_valr="'".$this->vt_parm[$vr_camp[$vr_index]]['VALOR']."'";
                  
                elseif( strtoupper( $this->vt_parm[$vr_camp[$vr_index]]['TIPO'] )=="NUMERIC"  ){
					  if( $this->vt_parm[$vr_camp[$vr_index]]['VALOR'] == '') $vr_valr = 0;
                      else $vr_valr=$this->vt_parm[$vr_camp[$vr_index]]['VALOR'];
				}
                  
                elseif( strtoupper( $this->vt_parm[$vr_camp[$vr_index]]['TIPO'] )=="MOEDA"  ){
					if( $this->vt_parm[$vr_camp[$vr_index]]['VALOR'] == '') $vr_valr = 0;
                    else $vr_valr='REPLACE(REPLACE(REPLACE(FORMAT("'.$this->vt_parm[$vr_camp[$vr_index]]['VALOR'].'", 2), ".", "@"), ",", "."), "@", ",")';
				}
				elseif( strtoupper( $this->vt_parm[$vr_camp[$vr_index]]['TIPO'] )=="ELIKE"  )
                      $vr_valr="'%".$this->vt_parm[$vr_camp[$vr_index]]['VALOR']."'";
                      
                elseif( strtoupper( $this->vt_parm[$vr_camp[$vr_index]]['TIPO'] )=="DLIKE"  )
                      $vr_valr="'".$this->vt_parm[$vr_camp[$vr_index]]['VALOR']."%'";
                      
                elseif( strtoupper( $this->vt_parm[$vr_camp[$vr_index]]['TIPO'] )=="CLIKE"  )
                      $vr_valr="'%".$this->vt_parm[$vr_camp[$vr_index]]['VALOR']."%'";
                      
                elseif( strtoupper( $this->vt_parm[$vr_camp[$vr_index]]['TIPO'] )=="DATA"  ){
					$vr_valr="'".substr($this->vt_parm[$vr_camp[$vr_index]]['VALOR'],6,4)."-".substr($this->vt_parm[$vr_camp[$vr_index]]['VALOR'],3,2)."-".substr($this->vt_parm[$vr_camp[$vr_index]]['VALOR'],0,2)." 00:00:00'";
				}
                elseif( strtoupper( $this->vt_parm[$vr_camp[$vr_index]]['TIPO'] )=="NDATA"  ){
					$vr_valr="'".substr($this->vt_parm[$vr_camp[$vr_index]]['VALOR'],6,4)."-".substr($this->vt_parm[$vr_camp[$vr_index]]['VALOR'],3,2)."-".substr($this->vt_parm[$vr_camp[$vr_index]]['VALOR'],0,2)."'";
				}
                      
                $ds_sql =str_replace(":".strtolower($vr_camp[$vr_index]),$vr_valr,$ds_sql );
            }
        }
		
        $lg_resl =mysql_query( $ds_sql );

        $select =strstr( strtoupper( $ds_sql ),strtoupper( "select" ) );
		$operacao =( strlen(strstr( strtoupper( $ds_sql ),strtoupper( "update" ) )) + strlen(strstr( strtoupper( $ds_sql ),strtoupper( "insert" ) ) ) );
						 
		
        if( $lg_resl ){ // Se o resultado do query for verdadeiro, pode criar o vetor com a tabela
          if ( strlen($select)>0 && $operacao == 0 ) {
            $this->campos  = mysql_num_fields( $lg_resl ) ; // total de campos da tabela
            $this->linhas  = mysql_num_rows( $lg_resl );
            if ( $nu_linh>1 && $this->linhas>$nu_linh ) $this->linhas =$nu_linh;
            if ( $this->linhas>0 && $this->campos>0 ){
				
               for( $xlinhas=0;
                    $xlinhas<$this->linhas ;
                    $xlinhas++ ){
                    $registro = mysql_fetch_row( $lg_resl );
                    for( $xcampos=0;
                         $xcampos<$this->campos;
                         $xcampos++ ){
                         $this->gs[ strtoupper( mysql_field_name( $lg_resl ,$xcampos ) ) ][$xlinhas]=$registro[$xcampos];
						 if($xlinhas == 0 ) $this->tabela[] = strtoupper( mysql_field_name( $lg_resl ,$xcampos ) ) ; 						 
                    }
               }
            }
          }
        } else $this->erro_bd=1;

        if( $nu_linh==1 ) print '<BR>'.$ds_sql.'<BR>';
        
        $this->lg_resl  =$lg_resl;
        $this->sql_list =$ds_sql;
        
        return $lg_resl;
     }
     
     function formato($vr_varv,$vr_form){

        $vr_form =strtoupper($vr_form);
        $vr_resl ="";
        
        switch($vr_form){
            case "DD/MM/YY":
                  if( strlen($vr_varv)==10 ) $vr_resl=substr($vr_varv,0,2)."/".
                                                      substr($vr_varv,3,2)."/".
                                                      substr($vr_varv,8,2);
                  else $vr_resl=substr($vr_varv,0,2)."/".
                                substr($vr_varv,3,2)."/".
                                substr($vr_varv,6,2);
                 break;
            case "YYYY/MM":
                  if( strlen($vr_varv)==10 ) $vr_resl=substr($vr_varv,6,4)."/".
                                                      substr($vr_varv,3,2);
                  else $vr_resl='20'.substr($vr_varv,6,2)."/".substr($vr_varv,3,2);
                 break;
        }
     return $vr_resl;
     }
     
     function print_tabela( $titulo = "" ){
          //  Montagem do vetor titulo
          $this->vt_titl =split(",", $this->titulo_campo );
          
          //  Montagem do vetor formato
          $this->vt_form =split(",", $this->formato_campo );

          //  Montagem do vetor visibilidade
          $this->vt_visv =split(",", strtoupper( $this->visivel_campo ) );

         //  Montagem do vetor de alinhamento
          $this->vt_alnh =split(",", strtoupper( $this->alinha_campo ) );

          // Montagem do Cabeçalho
          $cl_visb =array_count_values($this->vt_visv);
          
          ?>
          <table border=1 cellpadding="<? print $cl_visb["V"]; ?>" cellspacing='0' >
          <tr align="center" >
          <td  colspan="<? print $cl_visb["V"]; ?>"><b><? print $titulo; ?></b>
          </td>
          </tr>
          <tr><b>
          <?
          for( $xcol=0 ;
               $xcol<$this->campos ;
               $xcol++ ){
                       if ( $this->vt_visv[$xcol]=="V" ) {
                          if ($this->vt_titl[$xcol]!="") $xcoluna =$this->vt_titl[$xcol];
                          else $xcoluna =mysql_field_name( $this->lg_resl , $xcol );
          ?> <th class=titulo ><? print $xcoluna;  ?></th>
           <?
                       }
          }
         ?></b>
           </tr><?
             // onMouseOver="this.style.background-image=url('../images/botao1.jpg');
             // this.style.cursor='hand'"
             // onMouseOut="this.style.background-image=url('../images/botao3.jpg')"
          for( $xlin=0 ;
               $xlin<$this->linhas ;
               $xlin++ ){?>
               <tr OnClick="escolher('<? print $this->gs[ strtoupper( mysql_field_name( $this->lg_resl , $this->chave_campo ) ) ][$xlin]; ?>')" >
               <?
                for( $xcol=0 ;
                     $xcol<$this->campos ;
                     $xcol++ ){
                     if ( $this->vt_visv[$xcol]=="V" ) {
                          ?><td align=<? if ($this->vt_alnh[$xcol]=="C")     print "center";
                                          elseif ($this->vt_alnh[$xcol]=="D") print "right";
                                          else print "left"; ?> ><?
                          print $this->gs[ strtoupper( mysql_field_name( $this->lg_resl ,$xcol ) ) ][$xlin];
                     ?></td>
                <?   }
                }?>
             </tr>
       <? } ?>
          <td  colspan="<? print $cl_visb["V"]; ?>"><b><? print "Total de Registro : ".$this->linhas; ?></b></td>
          </table> <?
     }

     function print_tabela_especial( $titulo = "" ){
          //  Montagem do vetor titulo
          $this->vt_titl =split(",", $this->titulo_campo );
          
          //  Montagem do vetor formato
          $this->vt_form =split(",", $this->formato_campo );

          //  Montagem do vetor visibilidade
          $this->vt_visv =split(",", strtoupper( $this->visivel_campo ) );

         //  Montagem do vetor de alinhamento
          $this->vt_alnh =split(",", strtoupper( $this->alinha_campo ) );

          // Montagem do Cabeçalho
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
                       if ( $this->vt_visv[$xcol]=="V" ) {
                          if ($this->vt_titl[$xcol]!="") $xcoluna =$this->vt_titl[$xcol];
                          else $xcoluna =mysql_field_name( $this->lg_resl , $xcol );
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
               $xlin++ ){?>
               <tr OnClick="escolher('<? print $this->gs[ strtoupper( mysql_field_name( $this->lg_resl , $this->chave_campo ) ) ][$xlin]; ?>')" 
                   bgcolor=<? print $cor; ?> onMouseOver="this.style.cursor='pointer';" onMouseOut="this.style.cursor='';" >
               <?
                for( $xcol=0 ;
                     $xcol<$this->campos ;
                     $xcol++ ){
                     if ( $this->vt_visv[$xcol]=="V" ) {
                          ?><td align=<? if ($this->vt_alnh[$xcol]=="C")     print "center";
                                          elseif ($this->vt_alnh[$xcol]=="D") print "right";
                                          else print "left"; ?> ><font class="label"><?
                          print $this->gs[ strtoupper( mysql_field_name( $this->lg_resl ,$xcol ) ) ][$xlin];
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


   function vargetpost($chave, $default = "") {
      if (isset($_POST[$chave])) {
         if (is_array($_POST[$chave]))
            return $_POST[$chave];
         else
            return trim($_POST[$chave]);
      }
      elseif (isset($_GET[$chave])) {
         if (is_array($_GET[$chave]))
            return $_GET[$chave];
         else
            return trim($_GET[$chave]);
      }
      else
         return $default;
   }
   
   function print_erro(){
      echo 'erro n. '.mysql_errno().': '.mysql_error().'<BR>';
      print 'Comando SQL :';
      print_r( $this->sql_list );
   }

   function retorno($target, $parameters=array(), $window="") {
      $strx = "";
      foreach ($parameters as $key => $value)
         $strx .= urlencode($key) . "=" . urlencode($value) . "&";
      $strx = substr($strx, 0, strlen($strx) - 1);
      if ($window == "")
         print "<script> document.location.href=\"$target?$strx\"; </script>";
      else
         print '<script> window.open("'.$target.'?'.$strx.'", "",'."'directories=0,location=0,menubar=0,resizable=1,scrollbars=1,status=0,toolbar=0,left=100,top=50,width=800,height=600');</script>";
   }
   
 }

?>