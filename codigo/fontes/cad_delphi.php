<!--Funcoes para montagem do cadastro-->

<? function abertura($titulo,$campo='idser',$in_navg = 1 ){ ?>
    <table class="limpa" width="100%">
    <tr class="titulo"> 
      <td colspan="3" width="80%"><? print $titulo; ?></td>
  <? if( $in_navg == 1 ) { ?>
        <td>
          <table>
          <tr><td>
          <input type="button" class="navegar" 
                 name="btn_primeiro" id="btn_primeiro" 
                 onclick="navegar_registro('p');" 
                 title="Primeiro" value="|<" />
           </td></tr>      
           </table>
         </td>  
         <td>
          <table>
          <tr><td>
          <input type="button" class="navegar" 
                 name="btn_atras" id="btn_atras" 
                 onclick="navegar_registro('a');"
                 title="Para Tras" value="<" />
          </td></tr>      
           </table>
         </td>  
         
         <td>
          <table>
          <tr><td>
              <div id="<? print $campo; ?>" class="label"></div>
              <input type="hidden" name="nu_serv" id="nu_serv" value="" />
          </td></tr>      
           </table>
         </td>  
         
         <td>
          <table>
          <tr><td>               
                 <!--<div id="nu_regs" class="div_codigo">1</div>-->               
          <input type="button" class="navegar" 
                 name="btn_frente" id="btn_frente" 
                 onclick="navegar_registro('f');" 
                 title="Para Frente"  value=">" />
          </td></tr>      
           </table>
         </td>  
         <td>
          <table>
          <tr><td>               
          <input type="button" class="navegar" 
                 name="btn_ultimo" id="btn_ultimo" 
                 onclick="navegar_registro('u');" 
                 title="Ultimo" value=">|" />
          </td></tr>      
           </table>               
        </td>
  <? } ?>            
    </tr>
    </table>
<? } ?>

<? function botoes_procura($ativar){ ?>
    <table class="limpa">    
  <? if( $ativar == 'n'){ ?>
        <tr><td align="left" >
          <img src="../imagens/btn_novo.jpg" onclick="pesquisar(0);" width="110" height="40"/>
        </td></tr>
        <tr><td>&nbsp;</td></tr>      
  <? }else if( $ativar == 'p'){ ?>    
        <tr><td align="left" >  
          <img src="../imagens/btn_procurar.jpg" onclick="pesquisar(1);"  width="110" height="40"/>                       
        </td></tr>
        <tr><td>&nbsp;</td></tr>      
<?   } ?>      
      <tr><td align="left" >  
        <img src="../imagens/btn_sair.jpg" onclick="sair();"  width="110" height="40" />                                  
      </td>
	  </tr>
        <tr><td>&nbsp;</td></tr>            
    </table>
<? } ?>

<? function botoes_operacao(){ ?>
    <table class="limpa">
    <tr> 
      <td align="left" >
        <img src="../imagens/btn_novo.jpg" onclick="operacao('n','');" />
      </td></tr>
      <tr><td>&nbsp;</td></tr>
      <tr><td align="left" >  
        <img src="../imagens/btn_excluir.jpg" onclick="operacao('e','');"  />   
      </td></tr>
      <tr><td>&nbsp;</td></tr>      
      <tr><td align="left" >  
        <img src="../imagens/btn_cancelar.jpg" onclick="operacao('c','');"  />                  
      </td></tr>
      <tr><td>&nbsp;</td></tr>      
      <tr><td align="left" >  
        <img src="../imagens/btn_gravar.jpg" onclick="operacao('g','');"  />                 
      </td></tr>
	  <tr><td>&nbsp;</td></tr>            
      <tr><td align="left" >  
        <img src="../imagens/btn_imprimir.jpg" onclick="operacao('i');" />                 
      </td></tr>      
      <tr><td>&nbsp;</td></tr>      
      <tr><td align="left" >  
        <img src="../imagens/btn_procurar.jpg" onclick="operacao('p','servico');"  />                       
      </td></tr>
      <tr><td>&nbsp;</td></tr>      
      <tr><td align="left" >  
        <img src="../imagens/btn_ajuda.jpg" onclick="operacao('a','');"  />
      </td></tr>
      <tr><td>&nbsp;</td></tr>      
      <tr><td align="left" >  
        <img src="../imagens/btn_sair.jpg" onclick="operacao('s','');"  />                                  
      </td>
	  </tr>
    </table>
<? } ?>

<? function botoes_consulta(){ ?>
    <table class="limpa">
    <tr> 
      <td align="left" >
        <!--<img src="../imagens/btn_novo.jpg" onclick="operacao('n','');" />-->
      </td></tr>
      <tr><td>&nbsp;</td></tr>
      <tr><td align="left" >  
        <!--<img src="../imagens/btn_excluir.jpg" onclick="operacao('e','');"  />  --> 
      </td></tr>
      <tr><td>&nbsp;</td></tr>      
      <tr><td align="left" >  
        <!--<img src="../imagens/btn_cancelar.jpg" onclick="operacao('c','');"  /> -->                 
      </td></tr>
      <tr><td>&nbsp;</td></tr>      
      <tr><td align="left" >  
        <!--<img src="../imagens/btn_gravar.jpg" onclick="operacao('g','');"  />  -->               
      </td></tr>
	  <tr><td>&nbsp;</td></tr>            
      <tr><td align="left" >  
        <img src="../imagens/btn_imprimir.jpg" onclick="operacao('i');" />                 
      </td></tr>      
      <tr><td>&nbsp;</td></tr>      
      <tr><td align="left" >  
        <img src="../imagens/btn_procurar.jpg" onclick="operacao('p','servico');"  />                       
      </td></tr>
      <tr><td>&nbsp;</td></tr>      
      <tr><td align="left" >  
        <img src="../imagens/btn_ajuda.jpg" onclick="operacao('a','');"  />
      </td></tr>
      <tr><td>&nbsp;</td></tr>      
      <tr><td align="left" >  
        <img src="../imagens/btn_sair.jpg" onclick="operacao('s','');"  />                                  
      </td>
	  </tr>
    </table>
<? } ?>


<? function campos_busca_servico(){ ?>
    <table class="table_interna" >
    <tr>
      <td>
        <font class="label">Buscar por  :</font><br/>
        <select name="in_tipo">
           <option value=0>Codigo do Servico</option>
           <option value=1>Codigo do Cliente</option>
           <option value=2 selected="selected">Nome do Cliente</option>
           <option value=3>Endereco do Cliente</option>                      
           <option value=4>Telefone do Cliente</option>
           <option value=5>Bairro</option>                      
           <option value=6>Municipio</option>           
           <option value=7>Produto</option>                      
         </select>          
      </td>
      <td>
        <font class="label">Contem na Busca :</font><br/>
        <input type="text" class="edit" name="ds_dado" id="ds_dado" size="61" maxlength="60" value=""  onkeyup="if((event.keyCode==13)||(window.event.keyCode==13)) pesquisar(1); " />
      </td>
    </tr>
    </table>
<? } ?>      

<? function campos_busca_cliente(){ ?>
    <table class="table_interna" >
    <tr>
      <td>
        <font class="label">Buscar por  :</font><br/>
        <select name="in_tipo">
           <option value=0>Codigo do Cliente</option>
           <option value=1 selected="selected">Nome do Cliente</option>
           <option value=2>Endereco do Cliente</option>
           <option value=3>Telefone do Cliente</option>
           <option value=4>Bairro</option>                      
           <option value=5>Municipio</option>
         </select>          
      </td>
      <td>
        <font class="label">Contem na Busca :</font><br/>
        <input type="text" class="edit" name="ds_dado" id="ds_dado" size="61" maxlength="60" value="" onkeyup="if((event.keyCode==13)||(window.event.keyCode==13)) pesquisar(1); "  />
      </td>
    </tr>
    </table>
<? } ?>      

<? function campos_busca_produto(){ ?>
    <table class="table_interna" >
    <tr>
      <td>
        <font class="label">Buscar por  :</font><br/>
        <select name="in_tipo">
           <option value=0>Codigo do Produto</option>
           <option value=1 selected="selected">Nome do Produto</option>
         </select>          
      </td>
      <td>
        <font class="label">Contem na Busca :</font><br/>
        <input type="text" class="edit" name="ds_dado" id="ds_dado" size="61" maxlength="60" value="" onkeyup="if((event.keyCode==13)||(window.event.keyCode==13)) pesquisar(1); " />
      </td>
    </tr>
    </table>
<? } ?>      


<? function campos(){ ?>
    <table class="table_interna" >
    <tr>
      <td>
        <font class="label">Nome :</font><br/>
        <input type="text" class="edit" name="nm_nome" id="nm_nome" size="51" maxlength="50" value="" />
      </td>
      <td>
        <font class="label">Nascimento :</font><br/>
        <input type="text" class="edit" name="dt_nasc" id="dt_nasc" size="11" maxlength="10" value="" />
      </td>
      <td>
       <font class="label">CPF :</font><br/>
       <input type="text" class="edit" name="nu_cpf" id="nu_cpf" size="12" maxlength="11" value="" />
      </td>
      <td>
        <font class="label">Identidade :</font><br/>
        <input type="text" class="edit" name="nu_idnt" id="nu_idnt" size="11" maxlength="10" value="" />
      </td>
    </tr>
    </table>
<? } ?>      