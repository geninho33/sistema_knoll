<?
require_once('abertura_pdf.php'); 
include_once("servico.func.php");     
require_once("../../biblioteca/pdf/pdf.php");

$gdb 	   = new servico();
$dbempresa = new servico();
   
foreach($_GET as $campo=>$valor){
	$$campo = $valor;
}

if( $idfun != '') $where = "AND s.idfun= $idfun";

$gdb->parametro('dt_sada_term' ,'NDATA',$dt_sada_term );
$gdb->parametro('dt_sada_inic' ,'NDATA',$dt_sada_inic );

$gdb->open("SELECT DATE_FORMAT(dt_sada,'%d/%m/%Y')   as data,
							   hr_sada   as  hora,
							   upper( f.nome )    as funcionario,
							   s.idser 	 as servico,
							   c.nome	 as Cliente,
							   c.bairro,
							   c.municipio,
							   p.DS_EQPM as produto,
							   p.defeito,
							   s.hr_serv
						  FROM knoll_servicos s
							
						   JOIN knoll_funcionario f
							 ON s.idfun=f.idfun  
							   
						   JOIN knoll_clientes c
							 ON s.idcli=c.idcli 		   
							 
					 LEFT JOIN knoll_clientes_produtos p
							ON p.idser=s.idser    
							
						 WHERE s.idfun=f.idfun
						   AND s.idcli=c.idcli
						   AND s.dt_sada <= :dt_sada_term
						   AND s.dt_sada >= :dt_sada_inic
						   $where
					  ORDER BY s.idfun, s.dt_sada,s.hr_sada ");
				   
$pdf = new PDF('L'); // relatório em orientação "Paisagem"
$pdf->setHeader("");
$pdf->Open();

PDFAgenda_Tecnica(&$pdf, &$gdb, &$dbempresa );

$pdf->Output('agenda_tecnica_.pdf', 'I');

function PDFAgenda_Tecnica(&$pdf, &$gdb, &$dbempresa) {
   $xlinha =0;
   corpo(&$pdf, &$gdb, &$dbempresa );
}

function corpo(&$pdf, &$gdb, &$dbempresa ) {
	
   
   $dbempresa->open('Select * from knoll_configuracao ');
   $pdf->SetMargins(40,40);
   $pdf->AddPage();
   // $pdf->Image('http://www.ejc.eti.br/siapi/imagens/logofundo.jpg', 20, 65, 180, 180); // importa uma imagem
   
   $pdf->Image('../imagens/knoll_logo.jpg',5,0,40,30); // importa uma imagem
   $pdf->SetFont('Arial', 'B', 12);

   $pdf->SetFillColor(225,225,225);
   $pdf->Rect(45,0,230,7,'F');

   $pdf->SetXY(45, 2);
   $pdf->Cell(230, 3, $dbempresa->gs['NM_EMPR'][0],0,0,'C' );
  
   $pdf->SetFont('Arial', '', 8);
    
   $pdf->SetXY(45, 10);
   $pdf->Cell(135, 3, 'RUA : '.$dbempresa->gs['NM_LOGR'][0].' - N.: '.$dbempresa->gs['NU_LOGR'][0],0,0,'C' );

   $pdf->SetXY(45, 15);
   $pdf->Cell(135, 3, 'BAIRRO: '.$dbempresa->gs['NM_BARR'][0].'  MUNICIPIO: '.$dbempresa->gs['NM_MUNC'][0].'  ESTADO: '.$dbempresa->gs['SG_ESTD'][0].' CEP: '.$dbempresa->gs['NU_CEP'][0],0,0,'C');

   $pdf->SetXY(45, 20);
   $pdf->Cell(135, 3, 'TELEFONES: '.$dbempresa->gs['NU_TELF'][0].'  '.$dbempresa->gs['NU_TELF2'][0].'  EMAIL: '.$dbempresa->gs['DS_EMAIL'][0],0,0,'C' );
   

   // AREA DO AGENDAMENTO
   $y = 25;


   $pdf->SetFont('Arial', 'B', 10);
   $pdf->SetXY(45, $y + 2);
   $pdf->Cell(230, 3, 'AGENDA DE SERVIÇOS',0,0,'C' );
   $pdf->SetFont('Arial','B', 8);

   $pdf->SetXY( 2,  $y + 9);
   $pdf->Rect(  2,  $y + 9, 20, 5, 'D');
   $pdf->Rect( 22,  $y + 9, 20, 5, 'D');			   	
   $pdf->Rect( 42,  $y + 9, 20, 5, 'D');		
   $pdf->Rect( 62,  $y + 9, 20, 5, 'D');		   
   $pdf->Rect( 82,  $y + 9, 50, 5, 'D');		      
   $pdf->Rect( 132,  $y + 9, 30, 5, 'D');		         
   $pdf->Rect( 162,  $y + 9, 30, 5, 'D');		            
   $pdf->Rect( 192, $y + 9, 40, 5, 'D');		         
   $pdf->Rect( 232, $y + 9, 50, 5, 'D');		            
	
   $pdf->SetXY(2, $y + 10);
   $pdf->Cell(20,3, 'Data');

   $pdf->SetXY(22, $y + 10);
   $pdf->Cell(20,3, 'Hora');
   
   $pdf->SetXY(42, $y + 10);
   $pdf->Cell(20,3, 'Duração');
   
   $pdf->SetXY(62, $y + 10);
   $pdf->Cell(20,3, 'Cod. Serviço');
   
   $pdf->SetXY(82, $y + 10);
   $pdf->Cell(50,3, 'Cliente');
	
   $pdf->SetXY(132, $y + 10);
   $pdf->Cell(30,3, 'Bairro');
   
   $pdf->SetXY(162, $y + 10);
   $pdf->Cell(30,3, 'Muncipio');

   $pdf->SetXY(192, $y + 10);
   $pdf->Cell(40,3, 'Produtos');
   
   $pdf->SetXY(232, $y + 10);
   $pdf->Cell(50,3, 'Dados do Serviço');


   $y = $y + 15;
   $idser = '';
   
   if( $gdb->linhas>0 ){
	   foreach($gdb->gs['SERVICO'] as $key => $value ) {
		   
		   if( $y>179 ){
			   $pdf->AddPage();
			   $pdf->SetMargins(40,40);
			   $y = 10;
		   }
		   
		   if( $nm_func != $gdb->gs['FUNCIONARIO'][$key] ){
			   $pdf->SetFillColor(225,225,225);
			   $pdf->Rect(2,$y,280,7,'F');			   			   
			   $pdf->SetXY(4, $y + 1);
			   $pdf->SetFont('Arial','B', 10);
			   $pdf->MultiCell(280, 3, $gdb->gs['FUNCIONARIO'][$key] ,0,"C","C");		
			   $y = $y + 7; 
		   }
		   
		   if( $y>179 ){
			   $pdf->AddPage();
			   $pdf->SetMargins(40,40);
			   $y = 10;
		   }
       
		   if($idser != $value ){ 
			   $pdf->SetXY(2,   $y );
			   $pdf->Rect(  2,  $y, 20, 7, 'D');
			   $pdf->Rect( 22,  $y, 20, 7, 'D');			   	
			   $pdf->Rect( 42,  $y, 20, 7, 'D');		
			   $pdf->Rect( 62,  $y, 20, 7, 'D');		   
			   $pdf->Rect( 82,  $y, 50, 7, 'D');		      
			   $pdf->Rect( 132,  $y, 30, 7, 'D');		         
			   $pdf->Rect( 162,  $y, 30, 7, 'D');		            
		   }else $pdf->Rect(  2,  $y, 190, 7, 'D');
		    
		   $pdf->Rect( 192, $y, 40, 7, 'D');		         
		   $pdf->Rect( 232, $y, 50, 7, 'D');		            
	
   	       $pdf->SetFont('Arial','', 6);
		   if( $idser != $value ){ 		   		            
			   $pdf->SetXY(4, $y + 1);
			   $pdf->MultiCell(20, 3, $gdb->gs['DATA'][$key] ,0,"J","L");		
	
			   $pdf->SetXY(22, $y + 1);
			   $pdf->MultiCell(20, 3, $gdb->gs['HORA'][$key] ,0,"J","L");		
			   
			   $pdf->SetXY(42, $y + 1);
			   $pdf->MultiCell(20, 3, $gdb->gs['HR_SERV'][$key],0,"J","L");		
			
			   $pdf->SetXY(62, $y + 1);
			   $pdf->MultiCell(20, 3, $gdb->gs['SERVICO'][$key],0,"J","L");		
			
			   $pdf->SetXY(82, $y + 1);
			   $pdf->MultiCell(50, 3, $gdb->gs['CLIENTE'][$key],0,"J",'L' );
	
			   $pdf->SetXY(132, $y + 1);
			   $pdf->MultiCell(30, 3,$gdb->gs['BAIRRO'][$key],0,"J","L");		
	
			   $pdf->SetXY(162, $y + 1);
			   $pdf->MultiCell(30, 3, $gdb->gs['MUNICIPIO'][$key],0,"J",'L' );
		   }
		   
		   $pdf->SetXY(192, $y + 1);
		   $pdf->MultiCell(40, 3,$gdb->gs['PRODUTO'][$key],0,"J","L");		

		   $pdf->SetXY(232, $y + 1);
		   $pdf->MultiCell(50, 3, $gdb->gs['DEFEITO'][$key],0,"J",'L' );
		   
		   $nm_func = $gdb->gs['FUNCIONARIO'][$key];
		   $idser   = $value;
		   $y = $y + 7;	            
	   }
   }
   
   
}
?>