<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv='cache-control' content='no-cache'>
<meta http-equiv='expires' content='0'>
<meta http-equiv='pragma' content='no-cache'>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<link rel="stylesheet" type="text/css" href="/icofont.min.css">
<link rel="stylesheet" type="text/css" href="/all.min.css">
<link rel="stylesheet" type="text/css" href="/css/jquery-ui.min.css">
<title>Noob Plasticity | Noob Software</title>
<script type='text/javascript' src='/jquery.js'></script>
<script type='text/javascript' src='/jquery-ui.min.js'></script>
<script type='text/javascript' src='/simplepeer.min.js'></script>
<script type='text/javascript' src='/dropzone/dropzone.js'></script>
<script src="/codemirror/codemirror.js"></script>
<link rel="stylesheet" href="/codemirror/codemirror.css">
<script src="/codemirror/mode/javascript/javascript.js"></script>
<script src='/chart.min.js'></script>
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
		/*background: rgb(92,151,171);*/
		/*background: linear-gradient(129deg, rgba(92,151,171,1) 0%, rgba(24,58,112,1) 88%);*/
		/*background:linear-gradient(129deg, rgb(68, 104, 150) 0%, rgb(0, 45, 95) 100%);*/
		/*background:linear-gradient(129deg, rgb(68, 104, 150) 0%, rgb(95, 0, 47) 100%);
		/*backgounrd:linear-gradient(129deg, rgb(150, 68, 68) 0%, rgb(95, 0, 47) 100%);*/
		/*background:linear-gradient(129deg, rgb(150, 68, 68) 0%, rgb(95, 0, 47) 100%);*/
		/*background:linear-gradient(129deg, rgb(0, 35, 81) 0%, rgb(95, 0, 47) 100%);*/
		/*background:linear-gradient(129deg, rgb(64, 88, 119) 0%, rgb(14, 16, 26) 100%);*/
		/*background:linear-gradient(129deg, rgb(64, 88, 119) 0%, #ca7898 100%);*/
		/*background:linear-gradient(12deg, #c8aa77 0%, #91a898 100%);*/
		/*background:linear-gradient(12deg, #FFB26480 0%, #91a89800 70%);*/
		/*background: linear-gradient(12deg, #c8aa77 0%, #91a898 100%);*/
		/*background:linear-gradient(129deg, rgb(0, 35, 81) 0%, rgb(95, 0, 47) 100%);*/
		/*background:linear-gradient(12deg, #2c1e07 0%, #071d0e 100%);*/
		/*background:linear-gradient(12deg, #453925cc 0%, #07111d 100%);*/
		background:linear-gradient(12deg, #043841cc 0%, #07111d 100%);
	}
	
	.frame div {
		font-size:20px;
	}
	
	.frame input {
		font-size:20px;
	}
	
	.frame button {
		font-size:20px;
	}
	
	.frame select {
		font-size:20px;	
	}

	.frame textarea {
		font-size:20px;
		min-height:350px;	
	}
	
	.menu_top div {
		font-size:24px !important;	
	}
	
	.main_title {
		font-size:56px !important;	
	}
	
	.node {
		border-bottom:1px solid rgba(255,255,255,0.15);	
	}
	
	.node .controls {
		float:right;	
	}
	
	.node .controls i {
		margin-right:10px;
		color:#aaa;	
		cursor:default;
	}
	
	.node .controls i:hover {
		margin-right:10px;
		color:#fff;	
	}
	
	.menu_top {
		height:60px;	
	}
	
	.tree {
		background:rgba(0,0,0,0.3);
		color:#ddd;
		padding:15px;
			
	}
	
	.tree .caption {
		color:#fff;
		font-size:26px;
	}
	
	.delete_dialog {
		background:rgba(255,255,255,0.15);
		color:rgba(255,255,255,0.86);	
		margin:auto;
		padding:15px;
	}
	
	.delete_dialog .controls span {
		padding-left:15px;
		padding-right:15px;	
		cursor:default;
	}
	
	.delete_dialog .controls {
		text-align:center;	
	}
	
	.delete_dialog .message {
		text-align:center;	
	}
	
	.overlay_black_ {
		display:flex;	
	}
	
	.suggestions {
		color:#ddd;
		background:rgba(255,255,255,0.08);
		border-radius:5px;
		padding:5px;	
	}
	
	.suggestions .suggestion {
		border-bottom:1px solid rgba(255,255,255,0.09);	
	}
	
	.background_layer {
		position:fixed;
		top:0px;
		bottom:0px;
		left:0px;
		right:0px;
			
		/*background:linear-gradient(129deg, rgb(64, 88, 119) 0%, #ca7898 100%);*/

		/*background:linear-gradient(129deg, rgb(35, 50, 69) 0%, #663146 100%);*/
		/*background:linear-gradient(129deg, rgb(41, 24, 8) 0%, #663146 100%);*/
		background: linear-gradient(129deg, rgb(181, 19, 206) 0%, #5b2fd1 100%);
	}

	#edit_data_diagram_link.link {
		background: rgba(255,255,255,0.1);
		padding: 15px;
		color: #fff;
	}

	.link {
		background: rgba(255,255,255,0.1);
		padding: 15px;
		color: #fff;
	}


/*	.diagram_editor {
		width:100%;
		height:100%;
		background:rgba(0,0,0,0.23);
		border-radius:5px;
		box-sizing:border-box;
	}
*/

</style>
<?
	$app = NULL;
	if(isset($_GET['app'])) {
		$app = $_GET['app'];
	}
	if($app == NULL) {
		$app = "builder";
	}
	echo "<script type='text/javascript'> var load_object = { app: '".$app."' }; </script>";
?>
</head>

<body>
<!---->
<div class='background_layer'></div>
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
<script type='text/javascript' src='/app/base.js'></script>
<script type='text/javascript' src='app.js'></script>
<script type='text/javascript' src='app/definition.js'></script>
<script type='text/javascript' src='/app/streamline.js'></script>
<script type='text/javascript' src='/app/idiagram.js'></script>
<script type='text/javascript' src='/app/diagram_editor.js'></script>
</body>
</html>