<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>
	<head>
		<title>Flexigrid Dev</title>


		<link rel="stylesheet" href="flexigrid-core.css" />
		<link rel="stylesheet" href="flexigrid-theme.css"  />
		
		<style>
			body
				{
				margin: 0px;
				padding: 20px;
				font-family: Arial;
				}
				
			h2
				{
				font-size: 24px;
				margin: 15px 0px;
				font-weight: normal;
				color: #555;
				}
				
		</style>
		<script type="text/javascript" src="lib/jquery162.js"></script>
		<script type="text/javascript" src="flexigrid.js" ></script>
		<script type="text/javascript" src="flexigrid-menu.js" ></script>
		<script type="text/javascript" src="flexigrid-table-parser.js" ></script>
	</head>
	<body>

	<h2>Flexigrid</h2>

	<!-- <table class="table"></table> -->

	<br />

	<div id="divtable" class="table"></div>
	
	<br />
	
	<a href="#" onclick="$('.table').flexigrid({beforeRender:[]}).trigger('render'); return false" >Test</a>
	
	<script type="text/javascript">
		$('.table').flexigrid()
		//.hide()
		;
	</script>

	</body>
</html>
