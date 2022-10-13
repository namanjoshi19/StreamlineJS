<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<link rel="stylesheet" type="text/css" href="/icofont.min.css">
<title>News | Noob Software</title>
<script type='text/javascript' src='/jquery.js'></script>
<script type='text/javascript' src='/jquery-ui.min.js'></script>
<!--<script src="https://www.google.com/recaptcha/api.js?render=your-key-here"></script>-->
<script type='text/javascript' src='/app/base.js'></script>
<script type='text/javascript' src='app.js'></script>
<script type='text/javascript' src='/app/streamline.js'></script>
<script type='text/javascript' src='app/definition.js'></script>
<style type='text/css'>
	@import "/css/base.css";
	
	body { /*green*/
		/*background: url('/images/rancrypt_back_2.png');*/
		/*background-position:left;*/
		/*background-position:25% 10%;
		/*background-size:150%;*/
		word-wrap: break-word;
		/*background: url('/images/green.png');*/
		background:rgba(185,32,32,1);
	}	
	
	.background {
		position:fixed;
		top:0px;
		left:0px;
		bottom:0px;
		right:0px;
		z-index:-100;
			
	}
	
	.background_layer_1 {
		background: rgb(0,0,0);
		/*background:linear-gradient(129deg, rgb(0, 0, 0) 0%, rgb(45, 217, 255) 10%, rgb(0, 0, 0) 12%, rgb(30, 104, 113) 28%, rgb(0, 0, 0) 30%, rgb(34, 237, 255) 59%, rgb(0, 0, 0) 65%, rgb(52, 144, 170) 87%, rgb(0, 0, 0) 88%, rgb(74, 230, 255) 97%);*/
		background:linear-gradient(129deg, rgb(0, 71, 77) 0%, rgb(0, 87, 95) 100%);
	}
	
	/*.background_layer_1 {
		background: rgb(0,0,0);
		background:linear-gradient(129deg, rgb(0, 0, 0) 0%, rgb(45, 217, 255) 10%, rgb(0, 0, 0) 12%, rgb(30, 113, 74) 28%, rgb(0, 0, 0) 30%, rgb(34, 237, 255) 59%, rgb(0, 0, 0) 65%, rgb(52, 144, 170) 87%, rgb(0, 0, 0) 88%, rgb(74, 230, 255) 97%);
	}*/
	
	.secondary_back {
		background:linear-gradient(30deg, rgba(250,138,54,0.7) 0%, rgba(0,0,0,0.7) 88%); /*linear-gradient(30deg, rgba(250,138,54,0.7) 0%, rgba(0,7,254,0) 88%);*/
		position:fixed;
		top:0px;
		bottom:0px;
		left:0px;
		right:0px;	
	}
	
	.background_layer_5 {
		background:radial-gradient(circle at top right, rgba(255,255,255,0) 0%, rgb(255, 255, 255) 77%, rgba(255,255,255,0.5) 79%, rgba(0,180,255,0) 100%);

	}
	
	.background_layer_2 {
		background:radial-gradient(circle at -20% 50%, rgba(26,124,149,0) 0%, rgba(22, 121, 149, 0) 77%, rgba(255, 255, 255, 0.61) 79%, rgba(0,180,255,0) 100%);

	}
	
	.background_layer_3 {
		background:radial-gradient(circle at 70% -200%, rgba(26,124,149,0) 0%, rgba(22, 121, 149, 0.33) 77%, rgba(80, 166, 185, 0.4) 79%, rgba(0, 180, 255, 0.19) 100%);
		
		background-size: 200% 100%;

	}
	
	
	.background_layer_4 {
		background:radial-gradient(circle at 70% 280%, rgba(26,124,149,0) 0%, rgba(22,121,149,0) 77%, rgba(17, 110, 132, 0.3) 79%, rgba(0,180,255,0) 100%);
		
		background-size: 200% 100%;

	}
	
	.flow_li .description {
		overflow:hidden;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical; 
		color:#fff; 	
		margin-bottom: 10px;
	}
	
	div#templates {
		display:none;	
	}
	
	.flow_li .option_bar {
		overflow:hidden;
		height:auto;	
		border-top:1px solid rgba(255,255,255,0.1);
	}
	
	.flow_li .option_bar > div {
		float:left;	
		color:#fff;
		padding-right:17px;
		padding-left:17px;
		border-right:1px solid rgba(255,255,255,0.1);
	}
	
	.flow_li .title {
		overflow:hidden;
		height:auto;	
	}
	
	.flow_li .title > div {
		float:left;	
	}
	
	.flow_li .title .votes {
		margin-right:15px;	
	}
	
	.menu_options {
		table-layout:fixed;	
	}
	
	.menu_button {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;	
	}
	
	#categories_options div {
		font-size:25px !important;	
	}
	
	.votes > div {
		float:left;	
	}
	
	.vote_button {
		cursor:default;	
	}
	
	.votes.voted {
		opacity:0.5;	
	}
	
	.flow_li .option_bar > div {
		opacity:0.6;	
	}
	
	.flow_li .option_bar > div:hover {
		opacity:1;	
	}
	
</style>
<!--<link rel="alternate" type="application/rss+xml" 
  title="Noob Windows Application Updates" 
  href="noob_windows.php" />-->
<link rel="alternate" type="application/rss+xml" 
  title="Noob macOS Application Updates" 
  href="noob_macOS.php" />
<!--<link rel="alternate" type="application/rss+xml" 
  title="Noob News Updates" 
  href="news.php" />-->
</head>

<body>
<?

$json = json_encode($_GET);
echo "<script type='text/javascript'> var json_get = '".$json."'; </script>"; 

?>
<!--
<div id="templates">
	<div id="flow_li_template" class='flow_li'>
    	<div class='title'>
        	<div class='votes'><div class='vote_count'>121</div><div class='vote_button'><i class="icofont-arrow-up"></i></div></div>
        	<div class='title_content'></div>
        </div>
        <div class='description'></div>
        <div class='option_bar'>
            <div class='comments'>12 comments</div>
	        <div class='created'>12 May 17:36</div>
            <div class='category'>Technology</div>
            <div class='source'></div>
            <div class='user'></div>
            <div class='share'></div>
        </div>
    </div>
</div>-->
<!---->
<!--<div class='background_layer_0 background'></div>-->
<div class='background_layer_1 background'></div>
<!--<div class='background_layer_5 background'></div>
<div class='background_layer_2 background'></div>
<div class='background_layer_3 background'></div>
<div class='background_layer_4 background'></div>
<div class='secondary_back'></div>-->
<div class='body_container blur'><!--blur-->
	<?	include '../common/user_bar.php'; ?>
    <div class='body_wrap'>
        <div id='body_frame' class='frame'>
        
        </div>
    </div>
</div>

<? include '../common/common.php'; ?>
<div class='dummy_div' style='display:none;'></div>
</body>
</html>