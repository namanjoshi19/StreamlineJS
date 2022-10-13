<?
header("Content-Type: application/rss+xml; charset=ISO-8859-1");
include 'app.php';

$app = new app();

$rss = new rss();


$rssfeed = '<?xml version="1.0" encoding="ISO-8859-1"?>';
$rssfeed .= '<rss version="2.0">';
$rssfeed .= '<channel>';
$rssfeed .= '<title>Noob Software Updates for Windows</title>';
$rssfeed .= '<link>https://www.noob.software/updates/</link>';
$rssfeed .= '<description>Software Updates for Windows Noob Applications</description>';


$rows = $app->updates->software_updates_list(NULL, NULL);

$max = 100;

foreach($rows as $key => $row) {
	if($key > $max) {
		break;	
	}
	$rssfeed .= '<item>';
	$rssfeed .= '<title>'.$row['title'].' - '.$row['version'].'</title>'; //$rss->html_convert_entities(
	$rssfeed .= '<description>'.$rss->html_convert_entities($row['release_notes']).'</description>';
	
	//$rssfeed .= '<link>'.$row['win_store_link'].'</link>';
	$rssfeed .= '<link>https://www.noob.software/updates/</link>';
	$rssfeed .= '<pubDate>' . date("D, d M Y H:i:s O", strtotime($row['created'])) . '</pubDate>';
	$rssfeed .= '</item>';
}

$rssfeed .= '</channel>';
$rssfeed .= '</rss>';

echo $rssfeed;