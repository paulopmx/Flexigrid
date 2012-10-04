<?php
$page = isset($_POST['page']) ? $_POST['page'] : 1;
$rp = isset($_POST['rp']) ? $_POST['rp'] : 10;
$sortname = isset($_POST['sortname']) ? $_POST['sortname'] : 'name';
$sortorder = isset($_POST['sortorder']) ? $_POST['sortorder'] : 'desc';
$query = isset($_POST['query']) ? $_POST['query'] : false;
$qtype = isset($_POST['qtype']) ? $_POST['qtype'] : false;

$db['default']['hostname'] = "localhost";
$db['default']['username'] = '';
$db['default']['password'] = "";
$db['default']['database'] = "";

$db['live']['hostname'] = 'localhost';
$db['live']['username'] = '';
$db['live']['password'] = '';
$db['live']['database'] = '';

$active_group = 'default';

$base_url = "http://".$_SERVER['HTTP_HOST'];
$base_url .= str_replace(basename($_SERVER['SCRIPT_NAME']),"",$_SERVER['SCRIPT_NAME']);

$conn = new mysqli($db[$active_group]['hostname'],$db[$active_group]['username'],$db[$active_group]['password'],$db[$active_group]['database']);
$conn->set_charset("utf8");
if ($conn->connect_errno) {
	die("Failed to connect to MySQL: (" . $conn->connect_errno . ") " . $conn->connect_error);
}

$start = (($page-1) * $rp);

if ($query){
	$sql = $conn->prepare("SELECT id_country, name FROM country WHERE $qtype LIKE ? ORDER BY $sortname $sortorder LIMIT ?, ?");
	$query = "%".$query."%";
	$sql->bind_param("sii", $query, $start, $rp);
	
} else {
	$sql = $conn->prepare("SELECT id_country, name FROM country ORDER BY $sortname $sortorder LIMIT ?, ?");
	$sql->bind_param("ii", $start, $rp);

}

$sql->execute();
$sql->store_result();
$sql->bind_result($id_country, $name);

$total = $sql->num_rows;

header("Content-type: text/xml");
$xml = "<?xml version=\"1.0\" encoding=\"utf-8\" ?>\n";
$xml .= "<rows>";
$xml .= "<page>$page</page>";
$xml .= "<total>$total</total>";

while($sql->fetch()){	
	$xml .= "<row id='".$id_country."'>";
	$xml .= "<cell><![CDATA[".$id_country."]]></cell>";
	$xml .= "<cell><![CDATA[".$name."]]></cell>";
	$xml .= "</row>";
}

$xml .= "</rows>";
echo $xml;