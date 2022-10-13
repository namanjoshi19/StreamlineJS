<?
header("Content-Type: application/rss+xml; charset=ISO-8859-1");
include 'app.php';

$app = new app();

$rss = new rss();


$rssfeed = '<?xml version="1.0" encoding="ISO-8859-1"?>';
$rssfeed .= '<rss version="2.0">';
$rssfeed .= '<channel>';
$rssfeed .= '<title>Noob Software News Updates</title>';
$rssfeed .= '<link>https://www.noob.software/updates/</link>';
$rssfeed .= '<description>Recent software releases, and other news.</description>';


$rows = $app->updates->news_list(NULL, NULL);

$max = 25;

foreach($rows as $key => $row) {
	if($key > $max) {
		break;	
	}
	$rssfeed .= '<item>';
	$rssfeed .= '<title>'.$rss->html_convert_entities($row['title']).'</title>';
	$rssfeed .= '<description>'.$rss->html_convert_entities($row['content']).'</description>';
	
	$rssfeed .= '<link>https://www.noob.software/updates/#index/article#'.$row['id'].'</link>';
	$rssfeed .= '<pubDate>' . date("D, d M Y H:i:s O", strtotime($row['created'])) . '</pubDate>';
	$rssfeed .= '</item>';
}

$rssfeed .= '</channel>';
$rssfeed .= '</rss>';

echo $rssfeed;