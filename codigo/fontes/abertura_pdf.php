<?
  require_once('acesso_sistema.func.php');
  $acesso_modulo = new acesso_sistema();
  $cd_usrs =$acesso_modulo->vargetpost('cd_usrs');
  $cd_menu =$acesso_modulo->vargetpost('cd_menu');   
  $acesso_modulo->acesso_modulo($cd_usrs,$cd_menu);        
?>