<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<link rel="stylesheet" type="text/css" href="/icofont.min.css">
<title>Streamline | Noob Software</title>
<script type='text/javascript' src='/jquery.js'></script>
<script type='text/javascript' src='/jquery-ui.min.js'></script>
<script type='text/javascript' src='/app/base.js'></script>
<script type='text/javascript' src='app.js'></script>
<script type='text/javascript' src='/app/streamline.js'></script>
<script type='text/javascript' src='/simplepeer.min.js'></script>
<script type='text/javascript' src='/webtorrent.min.js'></script>
<script type='text/javascript' src='/app/easings.js'></script>
<script type='text/javascript' src='/app/filebrowser.js'></script>
<script type='text/javascript' src='/app/noobtvbrowser.js'></script>
<script type='text/javascript' src='/dropzone/dropzone.js'></script>
<script type='text/javascript' src='app/definition.js'></script>
<style type='text/css'>
	@import "/css/base.css";
	@import "/dropzone/basic.css";
	@import "/dropzone/dropzone.css";
	
	body {
		/*background: url('/images/blue_blur_2.png');
		/*background: url('/images/rancrypt_back_2.png');*/
		/*background-position:left;*/
		/*background-position:25% 10%;
		/*background-size:150%;*/
		word-wrap: break-word;
		background: rgb(92,151,171);
	}	
	
	.body_container {
		/*background: url('/images/blue_blur_2.png'); /*green_colors_2*/
		background: rgb(117, 129, 196);
		/*background: linear-gradient(129deg, rgba(92,151,171,1) 0%, rgba(24,58,112,1) 88%);*/
		/*background:linear-gradient(129deg, rgb(117, 129, 196) 0%, rgb(165, 79, 12) 88%);*/
		/*background:linear-gradient(129deg, rgb(117, 129, 196) 0%, rgb(65, 39, 12) 88%);*/
		/*background:linear-gradient(129deg, rgb(117, 129, 96) 0%, rgb(65, 39, 12) 88%);*/
		background:linear-gradient(129deg, rgb(52, 71, 83) 0%, rgb(25, 39, 52) 88%);
		/*background:linear-gradient(129deg, rgb(17, 129, 196) 0%, rgb(25, 39, 52) 88%);*/
		/*background:linear-gradient(129deg, rgb(17, 201, 196) 0%, rgb(25, 39, 52) 88%);*/
		/*background:linear-gradient(129deg, rgb(7, 161, 156) 0%, rgb(25, 39, 52) 88%);*/
		/*background: linear-gradient(129deg, rgba(7, 161, 156, 0.41) 0%, rgb(25, 39, 52) 88%);*/
	}
	
	.background {
		position:fixed;
		top:0px;
		left:0px;
		bottom:0px;
		right:0px;
		z-index:-100;
	}
	
	.background_layer_0 {
		background: linear-gradient(-10deg, rgb(140, 9, 9) 0%, rgb(62, 6, 40) 88%);
	}
	
	.background_layer_1 {
		/*background:linear-gradient(255deg, rgb(7, 161, 156) 0%, rgb(25, 39, 52) 88%);*/
		
/*background: radial-gradient(circle -30% -50%, rgba(26, 124, 149, 0) 0%, rgba(22, 121, 149, 0) 27%, rgba(255, 255, 255, 0.1) 87%, rgba(20, 164, 164, 0) 85%, rgba(0, 255, 254, 0) 100%);*/
		background:radial-gradient(circle at top right, rgba(26,124,149,0.1) 0%, rgba(22,121,149,0.1) 77%, rgba(255,255,255,1) 79%, rgba(0,180,255,0.1) 100%);
		
		/*background-size: 100% 350%;
    	background-repeat: no-repeat;*/

	}
	
	.background_layer_2 {
		/*background:linear-gradient(255deg, rgb(7, 161, 156) 0%, rgb(25, 39, 52) 88%);*/
		
/*background: radial-gradient(circle -30% -50%, rgba(26, 124, 149, 0) 0%, rgba(22, 121, 149, 0) 27%, rgba(255, 255, 255, 0.1) 87%, rgba(20, 164, 164, 0) 85%, rgba(0, 255, 254, 0) 100%);*/
		background:radial-gradient(circle at -20% 50%, rgba(26,124,149,0.1) 0%, rgba(22,121,149,0.1) 77%, rgba(255,255,255,1) 79%, rgba(0,180,255,0.1) 100%);
		
		background-size: 100% 150%;
    	/*background-repeat: no-repeat;*/

	}
	
	.background_layer_3 {
		/*background:linear-gradient(255deg, rgb(7, 161, 156) 0%, rgb(25, 39, 52) 88%);*/
		
/*background: radial-gradient(circle -30% -50%, rgba(26, 124, 149, 0) 0%, rgba(22, 121, 149, 0) 27%, rgba(255, 255, 255, 0.1) 87%, rgba(20, 164, 164, 0) 85%, rgba(0, 255, 254, 0) 100%);*/
		background:radial-gradient(circle at 70% -80%, rgba(26,124,149,0.1) 0%, rgba(22,121,149,0.1) 77%, rgba(255,255,255,1) 79%, rgba(0,180,255,0.1) 100%);
		
		background-size: 200% 100%;
    	/*background-repeat: no-repeat;*/

	}
	
	
	.background_layer_4 {
		/*background:linear-gradient(255deg, rgb(7, 161, 156) 0%, rgb(25, 39, 52) 88%);*/
		
/*background: radial-gradient(circle -30% -50%, rgba(26, 124, 149, 0) 0%, rgba(22, 121, 149, 0) 27%, rgba(255, 255, 255, 0.1) 87%, rgba(20, 164, 164, 0) 85%, rgba(0, 255, 254, 0) 100%);*/
		background:radial-gradient(circle at 70% 280%, rgba(26,124,149,0.1) 0%, rgba(22,121,149,0.1) 77%, rgba(255,255,255,1) 79%, rgba(0,180,255,0.1) 100%);
		
		background-size: 200% 100%;
    	/*background-repeat: no-repeat;*/

	}
	
	
</style>
</head>

<body>
<!---->
<!--<div class='background_layer_0 background'></div>
<div class='background_layer_1 background'></div>
<div class='background_layer_2 background'></div>
<div class='background_layer_3 background'></div>
<div class='background_layer_4 background'></div>-->
<div class='body_container blur'><!--blur-->
    <!--<div class='title_wrap'><div class='title'>Streamline</div> <div class='sub_logo'>noob software</div></div>-->
    <?	include '../common/user_bar.php'; ?>
    <div class='body_wrap'>
    	<div id='body_frame' class='frame'>
        </div>
        <!--<div class='menu_top'>
        	<div class='menu_button'>Articles</div>
        	<div class='menu_button'>New Article</div>
        </div>-->
    </div>	
</div>
<div class='dummy_div' style='display:none;'></div>

<? include '../common/common.php'; ?>
</body>
</html>