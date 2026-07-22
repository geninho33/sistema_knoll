<?php

require_once('abertura_pdf.php'); 
include_once("servico.func.php");     
require_once("../../biblioteca/pdf/pdf.php");

$gdb 	   = new servico();
$dbempresa = new servico();
   
foreach($_GET as $campo=>$valor){
	$$campo = $valor;
}

$gdb->buscar('Buscar', $idser, 0  );

$pdf = new PDF('P'); // relatorio em orientação "Paisagem"
$pdf->setHeader("");
$pdf->Open();

PDFServico($pdf, $gdb, $dbempresa, $ds_situa );

$dateServico = date('Ymdis');

$pdf->Output('SF'.$dateServico.'_n_'.$idser.'.pdf', 'D');

function PDFServico( $pdf, $db, $dbempresa, $ds_situa) {
   $xlinha =0;
   corpo( $pdf, $db, $dbempresa, $ds_situa );
}

function corpo($pdf, $db, $dbempresa, $ds_situa ) {
	
   $tecnico = $db->gs['FUNCIONARIO'][0];	
   $dbempresa->open('Select * from knoll_configuracao ',0,0);
   $pdf->SetMargins(40,40);
   $pdf->AddPage();
   // $pdf->Image('http://www.ejc.eti.br/siapi/imagens/logofundo.jpg', 20, 65, 180, 180); // importa uma imagem
   
   $pdf->Image('../imagens/subzeroWolf.png',5,0,40,15); // importa uma imagem
   
   $pdf->Image('../imagens/viking.png',5,16,40,14); // importa uma imagem
   
   $pdf->SetFont('Arial', 'B', 12);

   $pdf->SetFillColor(225,225,225);
   $pdf->Rect(45,0,160,7,'F');

   $pdf->SetXY(45, 2);
   $pdf->Cell(135, 3,iconv("UTF-8", "CP1252", $dbempresa->gs['NM_EMPR'][0] ),0,0,'C' );
  
   $pdf->SetFont('Arial', '', 8);
    
   $pdf->SetXY(45, 10);
   $pdf->Cell(135, 3, iconv("UTF-8", "CP1252","RUA : ".$dbempresa->gs['NM_LOGR'][0]." - N.: ".$dbempresa->gs['NU_LOGR'][0] ),0,0,'C' );

   $pdf->SetXY(45, 15);
   $pdf->Cell(135, 3,iconv("UTF-8", "CP1252", "BAIRRO: ".$dbempresa->gs['NM_BARR'][0]."  MUNICIPIO: ".$dbempresa->gs['NM_MUNC'][0]."  ESTADO: ".$dbempresa->gs['SG_ESTD'][0]." CEP: ".$dbempresa->gs['NU_CEP'][0] ),0,0,'C');

   $pdf->SetXY(45, 20);
   $pdf->Cell(135, 3, 'TELEFONES: '.$dbempresa->gs['NU_TELF'][0].'  '.$dbempresa->gs['NU_TELF2'][0].'  EMAIL: '.$dbempresa->gs['DS_EMAIL'][0],0,0,'C' );
   
   $pdf->SetFont('Arial', 'B', 10);
   $pdf->SetXY(45, 25);
   $pdf->Cell(135, 3, iconv("UTF-8", "CP1252","Relatório de Atendimento Técnico"),0,0,'C' );
   
   $pdf->SetFillColor(225,225,225);
   $pdf->Rect(170,7,0,22,'D');   

   $pdf->SetFont('Arial', '', 8);   
   
   $pdf->SetXY(172, 9);
   $pdf->Cell(30, 3, 'OS n. : '.$db->gs['IDSER'][0] );

   $pdf->SetXY(172, 14);
   $pdf->Cell(30, 3, 'Operador : '.$db->gs['USUARIO'][0] );

   $pdf->SetXY(172, 19);
   $pdf->Cell(30, 3, 'Agendado: '.$db->gs['DT_SADA'][0] );

   $pdf->SetXY(172, 24);
   $pdf->Cell(30, 3, 'hora : '.$db->gs['HR_SADA'][0] );

   $pdf->SetFillColor(225,225,225);
   $pdf->Rect(5,0,200,30,'D');   
   
   $idcli     = $db->gs['IDCLI'][0];
   $idser     = $db->gs['IDSER'][0];
   $cd_eqpm   = $db->gs['CD_EQPM'][0];
   $ds_obsr   = $db->gs['DEFEITO'][0];     
   $servico   = $db->gs['VAL_SER'][0];
   $produto   = $db->gs['VAL_PRO'][0];
   $total     = $db->gs['VAL_TOT'][0];
   $desconto  = $db->gs['VAL_DES'][0];
   $totalProdutos = 0;

   // AREA DO CLIENTE
   $dbempresa->buscar_cliente( $idcli, 0 );
   $cleinte = $dbempresa->gs['NOME'][0];
    
   $y = 35; 	
   $pdf->SetXY(2, $y);
   $pdf->Cell(185, 3,iconv("UTF-8", "CP1252","Cliente : ".$idcli." - ".$dbempresa->gs['NOME'][0]) );
   
   $pdf->SetXY(125, $y);
   $pdf->Cell(80, 3, 'Email : '.$dbempresa->gs['EMAIL'][0]);

   $pdf->SetXY(2, $y + 5);
   $pdf->Cell(185, 3,iconv("UTF-8", "CP1252","Endereco : ".$dbempresa->gs['ENDERECO'][0]."    Complemento: ".$dbempresa->gs['COMPLEMENTO'][0] )  );
   
   $pdf->SetXY(2, $y + 10);
   $pdf->Cell(80, 3, iconv("UTF-8", "CP1252","Bairro : ".$dbempresa->gs['BAIRRO'][0]) );
   
   $pdf->SetXY(100, $y + 10);
   $pdf->Cell(80, 3,iconv("UTF-8", "CP1252","Municipio : ".$dbempresa->gs['MUNICIPIO'][0]) );

   $pdf->SetXY(2, $y + 15);
   $pdf->Cell(100, 3, 'Telefones / Celular : '.$dbempresa->gs['TELEFONE'][0].'    '.$dbempresa->gs['CELULAR'][0].'    '.$dbempresa->gs['FAX'][0]  );

   $pdf->SetXY(105, $y + 15);
   $pdf->Cell(90, 3,iconv("UTF-8", "CP1252","Contato : ".$db->gs['NOME'][0] ) );
   

   // AREA DO PRODUTO
   // AREA DO PRODUTO
   $dbempresa->buscar_produto_cliente($cd_eqpm, $idser, 0);
   $y = 55;

   $pdf->SetFont('Arial', 'B', 10);
   $pdf->SetXY(45, $y + 5);
   $pdf->Cell(135, 3, 'Dados do Produto',0,0,'C' );
   $pdf->SetFont('Arial','B', 8);

   $pdf->SetXY(2,   $y + 9);
   $pdf->Rect( 2,   $y + 9, 36, 5, 'D');
   $pdf->Rect( 38,  $y + 9, 14, 5, 'D');			   	
   $pdf->Rect( 52,  $y + 9, 20, 5, 'D');		
   $pdf->Rect( 72,  $y + 9, 20, 5, 'D');		   
   $pdf->Rect( 92,  $y + 9, 20, 5, 'D');		      
   $pdf->Rect( 112, $y + 9, 20, 5, 'D');		         
   $pdf->Rect( 132, $y + 9, 70, 5, 'D');		            
	
   $pdf->SetXY(2, $y + 10);
   $pdf->Cell(36, 3, 'Produto');

   $pdf->SetXY(38, $y + 10);
   $pdf->Cell(14, 3, 'Nr. Nota');
   
   $pdf->SetXY(52, $y + 10);
   $pdf->Cell(20, 3, 'Data');
   
   $pdf->SetXY(72, $y + 10);
   $pdf->Cell(20, 3, iconv("UTF-8", "CP1252","Série"));
   
   $pdf->SetXY(92, $y + 10);
   $pdf->Cell(20, 3, 'Revenda');
	
   $pdf->SetXY(112, $y + 10);
   $pdf->Cell(20, 3, 'Modelo');
   
   $pdf->SetXY(132, $y + 10);
   $pdf->Cell(70, 3,iconv("UTF-8", "CP1252","Situação do Equipamento") );

   $y = $y + 14;
   
   $dbempresa->buscar_equipamento($idser,0); 
   if( $dbempresa->linhas>0 ){
	   foreach($dbempresa->gs['DS_EQPM'] as $key => $value ) {
		   $pdf->SetXY(2,   $y );
           $pdf->Rect( 2,   $y , 36, 7, 'D');
           $pdf->Rect( 38,  $y , 14, 7, 'D');			   	
		   $pdf->Rect( 52,  $y , 20, 7, 'D');		
		   $pdf->Rect( 72,  $y , 20, 7, 'D');		   
		   $pdf->Rect( 92,  $y , 20, 7, 'D');		      
		   $pdf->Rect( 112, $y , 20, 7, 'D');		         
		   $pdf->Rect( 132, $y , 70, 7, 'D');		            

           $pdf->SetFont('Arial','', 6);
	
		   $pdf->SetXY(4, $y + 1);
		   $pdf->MultiCell(36, 3, $value,0,"J","L");		

		   $pdf->SetXY(40, $y + 1);
		   $pdf->MultiCell(12, 3, $dbempresa->gs['NU_NOTA'][$key],0,"J","L");		
			   
		   $pdf->SetXY(54, $y + 1);
		   $pdf->Cell(18, 3, $dbempresa->gs['DT_EMSS'][$key],0,0,'C' );
		
		   $pdf->SetXY(74, $y + 1);
           $pdf->MultiCell(18, 3,iconv("UTF-8", "CP1252", $dbempresa->gs['DS_SERI'][$key]),0,"J",'L' );		
		
		   $pdf->SetXY(94, $y + 1);
		   $pdf->MultiCell(18, 3,iconv("UTF-8", "CP1252", $dbempresa->gs['NM_REVN'][$key]),0,"J",'L' );
		   
   	       $pdf->SetXY(114, $y + 1);
		   $pdf->MultiCell(18, 3,iconv("UTF-8", "CP1252",$dbempresa->gs['DS_MODL'][$key]),0,"J","L");		
	
	       $pdf->SetFont('Arial','', 5);
	
		   $pdf->SetXY(134, $y + 1);
		   $pdf->MultiCell(68, 3, $dbempresa->gs['DEFEITO'][$key],0,"J",'L' );
		   
		   $y = $y + 7;	            
	   }
   }
   
   $pdf->SetFont('Arial','B', 8);
   $pdf->SetXY(02, $y + 5);
   $pdf->Cell(30, 3,iconv("UTF-8", "CP1252","Situação do Serviço : "),0,0,'L' ); 

   $pdf->SetFont('Arial','', 8);     
   $pdf->SetXY(32, $y + 5);
   $pdf->Cell(20, 3,iconv("UTF-8", "CP1252",$db->gs['EQUIPAMENTO'][$key]) ,0,0,'L' );   

   $y = $y + 7;	    
   
   // Grade para os vendedores informarem o produto     
   $pdf->SetFont('Arial', 'B', 10);
   $pdf->SetXY(45, $y + 4);
   $pdf->Cell(135, 3,iconv("UTF-8", "CP1252","Serviços Executados"),0,0,'C' );
   $pdf->SetFont('Arial','B', 8);
	
   $pdf->SetXY(2,   $y + 11);
   $pdf->Rect( 2,   $y + 9, 20, 5, 'D');	
   $pdf->Rect( 22,  $y + 9, 80, 5, 'D');		
   $pdf->Rect( 102, $y + 9, 20, 5, 'D');		   
   $pdf->Rect( 122, $y + 9, 25, 5, 'D');		      
   $pdf->Rect( 147, $y + 9, 25, 5, 'D');		         
   $pdf->Rect( 172, $y + 9, 30, 5, 'D');		            
	
   $pdf->SetXY(2, $y + 10);
   $pdf->Cell(20, 3, iconv("UTF-8", "CP1252","Código"),0,0,'C' );
   
   $pdf->SetXY(22, $y + 10);
   $pdf->Cell(80, 3,iconv("UTF-8", "CP1252","Descrição"),0,0,'C' );
   
   $pdf->SetXY(102, $y + 10);
   $pdf->Cell(20, 3, 'Unidade',0,0,'C' );

   $pdf->SetXY(122, $y + 10);
   $pdf->Cell(25, 3, 'Quantidade',0,0,'C' );

   $pdf->SetXY(147, $y + 10);
   $pdf->Cell(25, 3, 'Valor',0,0,'C' );

   $pdf->SetXY(172, $y + 10);
   $pdf->Cell(30, 3, 'Total',0,0,'C' );
   
   $db->buscar_itens( $idser,0);
   
   $j = $y + 14;
   $pdf->SetFont('Arial','', 8);
   
   foreach($db->gs['IDPRO'] as $key => $value ) {
	   $pdf->Rect( 2,   $j, 20, 8, 'D');	
	   $pdf->Rect( 22,  $j, 80, 8, 'D');		
	   $pdf->Rect( 102, $j, 20, 8, 'D');		   
	   $pdf->Rect( 122, $j, 25, 8, 'D');		      
	   $pdf->Rect( 147, $j, 25, 8, 'D');		         
	   $pdf->Rect( 172, $j, 30, 8, 'D');	

	   $pdf->SetXY(4, $j + 2);
	   $pdf->Cell(20, 3, $value,0,0,'L' );
	   
	   $pdf->SetXY(24, $j + 2);
	   $pdf->Cell(80, 3, iconv("UTF-8", "CP1252", $db->gs['DESCRICAO'][$key]),0,0,'L' );
	   
	   $pdf->SetXY(104, $j + 2);
	   $pdf->Cell(20, 3, iconv("UTF-8", "CP1252", $db->gs['UNIDADE'][$key]),0,0,'C' );
	
	   $pdf->SetXY(124, $j + 2);
	   $pdf->Cell(22, 3, $db->gs['QTDE'][$key],0,0,'R' );
	
	   $pdf->SetXY(149, $j + 2);
	   $pdf->Cell(22, 3,$db->gs['VAL_UNI'][$key],0,0,'R' );
	
	   $pdf->SetXY(174, $j + 2);
	   $pdf->Cell(27, 3, $db->gs['VAL_TOT'][$key],0,0,'R' );

      $totalProdutos += $db->gs['TOTAL'][$key];
	   
	   $j = $j + 8;	            
   }
   
   $i = 0; 
   
   for ($i = $j; $i < 181; $i=$i+8 ) {
	   $pdf->Rect(   2, $i, 20, 8, 'D');	
	   $pdf->Rect(  22, $i, 80, 8, 'D');		
	   $pdf->Rect( 102, $i, 20, 8, 'D');		   
	   $pdf->Rect( 122, $i, 25, 8, 'D');		      
	   $pdf->Rect( 147, $i, 25, 8, 'D');		         
	   $pdf->Rect( 172, $i, 30, 8, 'D');		            
   }
   
   $j = $i;

   // $db->buscar_totais( $idser );

   $pdf->Rect( 2,   $j, 170, 8, 'D');	   
   $pdf->Rect( 172, $j, 30, 8, 'D');		                  
   $pdf->SetXY(2, $j + 3);   
   $pdf->Cell(170, 3,iconv("UTF-8", "CP1252","Total de Produto e Serviços ====>>"),0,0,'R' );   
   $pdf->SetXY(174, $j + 3);
   $pdf->Cell(27, 3, number_format($totalProdutos, 2, ',', '.'),0,0,'R' );
  

   $j = $j + 8;	 

   $pdf->Rect( 2,   $j, 170, 8, 'D');	   
   $pdf->Rect( 172, $j, 30, 8, 'D');		                  
   $pdf->SetXY(2, $j + 3);   
   $pdf->Cell(170, 3, 'Desconto ====>>',0,0,'R' );   
   $pdf->SetXY(174, $j + 3);
   $pdf->Cell(27, 3, $desconto ,0,0,'R' );
   
   $totalProdutos = $totalProdutos - $desconto;
         
   $j = $j + 8;	 
		 
   $pdf->Rect( 2,   $j, 170, 8, 'D');	   
   $pdf->Rect( 172, $j, 30, 8, 'D');		                  
   $pdf->SetXY(2, $j + 3);   
   $pdf->Cell(170, 3, 'Total ====>>',0,0,'R' );   
   $pdf->SetXY(174, $j + 3);
   $pdf->Cell(27, 3, number_format($totalProdutos, 2, ',', '.'),0,0,'R' );
   
   $y = $j + 21;
   
   $pdf->SetXY(2, $y );   
   $pdf->Cell(95, 3, 'Detalhes do Fechamento :',0,0,'L' );  
   $pdf->SetFont('Arial','', 8);	
   $pdf->SetXY(2, $y + 5 );   
   $pdf->MultiCell(95, 3,iconv("UTF-8", "CP1252", $db->gs['SERVICO'][0] ),0,"J",'L');  
   
   $pdf->SetXY(102, $y  );      
   $pdf->Cell(95, 3,iconv("UTF-8", "CP1252","Observações :"),0,0,'L' );  
   $pdf->SetXY(102, $y + 5 );   
   $pdf->MultiCell(95, 3,iconv("UTF-8", "CP1252",$ds_obsr ),0,"J",'L');  

   $pdf->SetFont('Arial','', 9);	
   
   $ds_serv = 'Declaro que efetuei o serviço de acordo com o descrito acima. No período  das  ___/___ às ___/___  do dia _____/_____/_____ ';   
   
   $pdf->SetXY(2, $y + 25 );   
   $pdf->MultiCell(195, 5,iconv("UTF-8", "CP1252", $ds_serv ),0,'J','L' );  
   
   $pdf->SetXY(2, $y + 35 );
   $pdf->Cell(100, 3, '____________________________________________________',0,0,'C' );  
   
   $pdf->SetXY(2, $y + 40 );
   $pdf->Cell(100, 3,iconv("UTF-8", "CP1252",$cleinte),0,0,'C' );  
   

   $pdf->SetXY(105, $y + 35 );   
   $pdf->Cell(95, 3, '____________________________________________________',0,0,'C' );  

   $pdf->SetXY(105, $y + 40 );   
   $pdf->Cell(95, 3,iconv("UTF-8", "CP1252","Técnico : ".strtoupper( $tecnico ) ),0,0,'C' );  
   
}
?>