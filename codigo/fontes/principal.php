<?php

  include_once("gdb.php");
  $gdb = new gdb();
  
  $datas = date("d/m/Y");
  $cd_usrs =$gdb->vargetpost("cd_usrs");      

?>
<form name="frm" action="calendario.php?cd_usrs=<?php print $cd_usrs; ?>&date_sistema=<?php print $datas; ?>" method="post">
<body>
	<script>
    <!--
     frm.submit(); 
    -->
    </script>
</body>
</form>