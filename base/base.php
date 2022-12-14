<?
//session_set_cookie_params(0);

include 'config.php';

class base {
	private $color;
	protected $user_id;
	protected $app_id;
	protected $project_root;
	protected $server_root;
	protected $statement;
	protected $sql; //
	public $colors;
	protected $modules;
	public $login_callbacks = array();
	
	private $encryption;
	
	function __construct($app_id=NULL, $project_root=NULL) {
		@session_start();
		$this->app_id = $app_id;
		$this->project_root = $project_root;
		$this->server_root = $_SERVER["DOCUMENT_ROOT"]; 

		spl_autoload_register(function ($class_name) {
			if(strpos($class_name, '\\') !== false) {
				$class_split = explode('\\', $class_name);
				//var_dump($class_split);
				$class_name = implode("/", $class_split);
			}
			$base_path = "../base/".$class_name.'.php';
			if(file_exists($base_path)) {
			    include $base_path;
			} else {
				$path = $this->server_root.$this->project_root.'/class/'.$class_name.'.php';
				if(file_exists($path)) {
			  	 	include $path;
				} else {
					var_dump($base_path);
					var_dump($class_name);
				}
			} 
		});

		//$this->autoload();
		if(isset($_SESSION['user_id'])) {
			$this->set_user_id($_SESSION['user_id']);
		} else {
			$this->user_id = -1;
			$_SESSION['user_id'] = -1;	
			//unset($_SESSION['user_id']);
		}
		$this->sql = new mysql($app_id);
		$this->statement = statement::init($this->sql, $app_id, $this->user_id);
		
	}

	
	function email_typeahead() {
		$query = "SELECT u_id FROM app.users WHERE id = ".$this->user_id;
		$u_id = $this->sql->get_row($query, 1)['u_id'];
		$query = "SELECT instance_id FROM noob_cloud.instance_users WHERE user_id = '".$u_id."'";
		$instance_id = $this->sql->get_row($query, 1);
		if($instance_id != NULL) {
			$instance_id = $instance_id['instance_id'];
			$query = "SELECT app.users.u_id as id, app.users.email as title FROM noob_cloud.instance_users, app.users WHERE noob_cloud.instance_users.user_id = app.users.u_id AND noob_cloud.instance_users.instance_id = ".$instance_id." AND app.users.u_id != '".$u_id."'";
			//var_dump($query);
			return $this->sql->get_rows($query, 1);
		}
		return array();
	}

	function generate_user_id() {
		$numbers = range(0, 9);
		$chars_a = range('a', 'z');
		$chars_b = range('A', 'Z');

		$characters = array_merge($numbers, $chars_a);
		$characters = array_merge($characters, $chars_b);
		$result = "";
		$counter = 0;
		while($counter < 8) {
			$index = random_int(0, count($characters)-1);
			$result .= $characters[$index];
			$counter++;
		}
		$query = "SELECT COUNT(*) as count FROM app.users WHERE u_id = '".$result."'";
		$count = $this->sql->get_row($query, 1)['count'];
		if($count == 0) {
			return $result;
		}
		return $this->generate_user_id();
	}

	/*function assign_user_ids() {
		$query = "SELECT id FROM app.users WHERE u_id IS NULL";
		$rows = $this->sql->get_rows($query, 1);
		foreach($rows as $row) {
			$row['u_id'] = "'".$this->generate_user_id()."'";

			$this->statement->generate($row, "app.users");
			var_dump($this->statement->get());
			$this->sql->execute($this->statement->get());
		}
	}*/

	/*function reset_my() {
		$v = array(
			'id' => 57,
		);

		$this->statement->generate($v, "app.users");
		$this->sql->execute($this->statement->get());
		
	}*/

	function get_user_information($v) {
		$user_ids = $v['user_ids'];
		$result = [];
		foreach($user_ids as $user_id) {
			$query = "SELECT u_id as user_id, email FROM app.users WHERE u_id = '".$user_id."'";
			$result[] = $this->sql->get_row($query, 1);
		}
		return $result;
	}
	
	function get_connection() {
		return $this->sql->get_connection();	
	}

	function get_main_settings() {
		$query = "SELECT * FROM app.settings WHERE user_id = ".$this->user_id;
		$row = $this->sql->get_row($query, 1);
		/*$result = array();
		foreach($rows as $key => $row) {
			$result[$row['property']] = $row['value'];
		}*/
		return $row;
	}

	function get_static_data_state() {
		$query = "SELECT * FROM app.static_data_state ORDER BY id DESC LIMIT 1";
		return $this->sql->get_row($query, 1)['modified'];
	}

	function get_static_data_base() {
		$result = array();

		$query = "SELECT * FROM app.colors";
		$result['colors'] = $this->sql->get_rows($query, 1);

		
		return $result;
	}

	function get_ws_server() {
		$query = "SELECT * FROM app.ws_servers ORDER BY id DESC LIMIT 1";
		return $this->sql->get_row($query, 1)['path'];
	}
	
	function application_update($v) {
		if(!isset($v['app_id'])) {
			$v['app_id'] = $this->app_id;	
		}
		$query = "SELECT version FROM updates.software_updates, app.apps WHERE LOWER(app.apps.name) = LOWER('".$v['app_id']."') AND app.apps.id = app_id AND version > ".$v['version']." ORDER BY updates.software_updates.id DESC LIMIT 1";
		$row = $this->sql->get_row($query, 1);
		if(count($row) == 0) {
			return array(
				'version' => '-1'
			);	
		}
		return $row;
	}
	
	function get_definition() {
		$definition_location = $this->server_root.$this->project_root."/app/definition.js";
		if(file_exists($definition_location)) {
			$handle = fopen($definition_location, "r");
			$line_count = 0;
			$object_value = "";
			if($handle) {
				while(($line = fgets($handle)) !== false) {
					if($line_count > 0 && trim($line) != ";") {
						//var_dump($line);
						$object_value .= "".$line;	
					}
					$line_count++;
				}
			}
			fclose($handle);
			return $object_value;
		}
		return NULL;
	}
		
	public function get_sess_id() {
		return $_COOKIE['PHPSESSID'];	
	}	
	
	public function set_var($var, $index) {
		if(isset($var[$index])) {
			return $var[$index];	
		}
		return NULL;
	}
	
	public function fun_exists($method) {
		return method_exists(__CLASS__, $method);	
	}
	
	function test_fun() {
		return "test";	
	}
	
	public function print_arr($arr) {
		foreach($arr as $key => $value) {
			echo $key.": ".$value."<br>";	
		}
	}
	
	private function class_terminating($rev_line) {
		for($i=0; $i<strlen($rev_line); $i++) {
			$char = substr($rev_line, $i, 1);
			if(!ctype_alpha($char) && $char != "_") {
				return $i;	
			}
		}
		return strlen($rev_line);
	}
	
	private $loaded_classes = array();
	
	private function is_loaded($class) {
		$is_loaded = false;
		foreach($this->loaded_classes as $loaded) {
			if($loaded == $class) {
				$is_loaded = true;	
			}
		}
		return $is_loaded;
	}
	
	private $exclude_list = array(
		'DateTime',
		'ErrorException'
	);
	
	private function is_excluded($class_name) {
		if(in_array($class_name, $this->exclude_list)) {
			return true;
		}
		return false;
	}
	
	private $extended_directories = array(
		'cloud_api'
	);
	
	/*private function autoload($files=NULL) {
		if($files == NULL) {
			$files = get_included_files();
		}
		$classes = array();
		$remove_indicies = array();
		foreach($files as $index => $file) {
			if(strlen(trim($file)) == 0) {
				$remove_indicies[] = $index;	
			}
		}
		foreach($remove_indicies as $index) {
			unset($files[$index]);	
		}
		foreach($files as $file) {
			$handle = fopen($file, "r");
			$counter = 0;
			$current_class = explode("/", $file);
			$current_class = explode(".php", $current_class[count($current_class)-1])[0];
			
			while(($line = fgets($handle)) !== false) {
				if($counter > 0) {
					$pos = strpos($line, " new ");
					$end = strpos($line, "(", $pos);
					if($pos != false) {
						$class_name = substr($line, $pos+5, $end-($pos+5));
						if($class_name != "" && $class_name != "app" && $class_name != "self" && !$this->is_loaded($class_name) && !$this->is_excluded($class_name)) { //
							if($class_name != $current_class) {
								$classes[$class_name] = true;							}
						}
					}
					
					$pos = strpos($line, "::");
					if($pos != false) {
						$rev_pos = strlen($line) - $pos;
						$rev_line = strrev($line);
						$rev_line = substr($rev_line, $rev_pos);
						$end = $this->class_terminating($rev_line);
						$rev_class = substr($rev_line, 0, $end);
						$class = strrev($rev_class);
						if($class != "" && $class != "app" && $class != "parent" && !$this->is_excluded($class_name)) {
							if($class != $current_class) {
								$classes[$class] = true;
							}
						}
					}
					
					$pos = strpos($line, " extends ");
					$end = strpos($line, "{", $pos);
					if($pos != false) {
						$class_name = substr($line, $pos+9, $end-($pos+9));
						$class_name = trim($class_name);
						if($class_name != "" && strpos($class_name, "app") === false && $class_name != "base" && !$this->is_loaded($class_name) && !$this->is_excluded($class_name)) { //
							if($class_name != $current_class) {
								$classes[$class_name] = true;
							}
						}	
					}
					
				}
				$counter++;
			}
			fclose($handle);
		}
		
		$remove_indicies = array();
		foreach($classes as $index => $file) {
			if(strpos($index, "'.") !== false) {
				$remove_indicies[] = $index;	
			}
		}
		foreach($remove_indicies as $index) {
			unset($classes[$index]);	
		}
		//var_dump($classes);		
		$autoload = array();
		foreach($classes as $class => $active) {
			array_push($this->loaded_classes, $class);
			$path = "";
			if(file_exists('../base/'.$class.'.php')) {
				$path = '../base/'.$class.'.php';
			} else if(file_exists($this->server_root.$this->project_root.'/class/'.$class.'.php')) {
				$path = $this->server_root.$this->project_root.'/class/'.$class.'.php';
			} else {
				foreach($this->extended_directories as $extended_directory) {
					if(file_exists('../'.$extended_directory.'/class/'.$class.'.php')) {
						$path = '../'.$extended_directory.'/class/'.$class.'.php';
					}
				}
			}
			array_push($autoload, $path);
		}	
		usort($autoload, function($a, $b) {
			return strlen($a)-strlen($b);
		});
		if(count($autoload) > 0) {
			$this->autoload($autoload);
		}
		foreach($autoload as $class) {
			//var_dump($class);
			if(strlen(trim($class)) > 0) {
				require_once($class);
			}
		}
	}*/

	/*function escape($string) {
		return $this->sql->escape($string);
	}*/
	
	function get_password_attempts() {	
		return 1;	
		$query = "SELECT * FROM app.login_attempts WHERE ip = '".$_SERVER['REMOTE_ADDR']."'";
		$last_attempt = $this->sql->get_row($query, 1);
		if($last_attempt == NULL) {
			return 0;	
		}
		$last_attempt_created = new DateTime($last_attempt['created']);
		$current_date = new DateTime();
		
		$interval = $current_date->diff($last_attempt_created);
		$days = $interval->format('%R%a');
		$login_count = 1;
		if($days > 2) {
		} else {
			$login_count = $last_attempt['attempt_count'];
		}
		return $login_count;
	}
	
	function login_attempt() {
		$login_count = $this->get_password_attempts();
		$login_count++;
		$query = "DELETE FROM app.login_attempts WHERE ip = '".$_SERVER['REMOTE_ADDR']."'";
		$this->sql->execute($query);
		
		$v = array(
			'attempt_count' => $login_count,
			'ip' => $_SERVER['REMOTE_ADDR']
		);
		$this->statement->generate($v, "app.login_attempts");
		$this->sql->execute($this->statement->get());
	}
	
	function reset_login_attempts() {
		$query = "DELETE FROM app.login_attempts WHERE ip = '".$_SERVER['REMOTE_ADDR']."'";
		$this->sql->execute($query);
	}

	/*   
	function getRealIPAddr() {
       //check ip from share internet
       if (!empty($_SERVER['HTTP_CLIENT_IP'])) 
       {
           $ip = $_SERVER['HTTP_CLIENT_IP'];
       }
       //to check ip is pass from proxy
       elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR']))  
       {
           $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
       }
       else
       {
           $ip = $_SERVER['REMOTE_ADDR'];
       }

       return $ip;
   }*/
	
	public function login($par) {
		//try {
			if($this->get_password_attempts() > 5) {
				return -1;	
			}
			$query = "SELECT * FROM app.users WHERE email = '".$par['username']."'";
			$row = $this->sql->get_row($query, 1, NULL, true);
			if(count($row) > 0 && $row['email'] == $par['username'] && $par['password'] == $row['password']) {
				$this->set_user_id($row['id']);
				foreach($this->login_callbacks as $login_callback) {
					$login_callback($par['username'], $par['password']);	
				}
				$this->reset_login_attempts();
				/*if(isset($par['nc'])) {
					return array('u_id' => $row['u_id'], 'ip' => $_SERVER['REMOTE_ADDR']);
				}*/
				return $row['id'];
			} else {
				$this->login_attempt();
				return -1;	
			}
			return -1;
		/*} catch(Exception $e) {
			return -1;	
		}*/
	}
	
	public function logout($v) {
		$_SESSION['user_id'] = -1;
		return -1;	
	}
	
	public function get_username($v=NULL) {
		$query = "SELECT email FROM app.users WHERE id = ".$this->user_id;
		$row = $this->sql->get_row($query, 1, NULL, true);
		return $row['email'];
	}
	
	public function get_user_id() { //$v
		if(isset($this->user_id) && $this->user_id != -1) {
			$query = "SELECT * FROM app.users WHERE id = ".$this->user_id;
			$row = $this->sql->get_row($query, 1, NULL, true);
			if($row == NULL) {
				$_SESSION['user_id'] = -1;
				return array('user_id' => "-1");	
			}
			return array(
				'user_id' => $this->user_id,
				'email' => $row['email'],
				'password' => $row['password']
			);
		} else {
			return array('user_id' => "-1");	
		}
	}
		
	public function set_user_id($user_id) {
		$this->user_id = $user_id;
		$_SESSION['user_id'] = $user_id;
	}
	
	function validate_email($email) {
		if(!filter_var($email, FILTER_VALIDATE_EMAIL)) {
			return false;
		}
		return true;
	}
	
	function validate_url($url) {
		if (!preg_match("/\b(?:(?:https?|ftp):\/\/|www\.)[-a-z0-9+&@#\/%?=~_|!:,.;]*[-a-z0-9+&@#\/%=~_|]/i",$url)) {
			return false;
		}
		return true;
	}
	
	private function user_init() {
			
	}
	
	public function get_app_state() {
		$query = "SELECT property, value FROM app.app_state WHERE app_id = '".$this->app_id."' AND user_id = ".$this->user_id;
		return $this->sql->get_rows($query);
	}
	
	public function submit_app_state($app_state) {
		foreach($app_state as $state) {
			$v = array();
			$v['property'] = $state->property;
			$v['value'] = $state->value;
			$this->set_app_state($v);	
		}
	}
	
	public function set_app_state($values) {
		$query = "DELETE FROM app.app_state WHERE app_id = '".$this->app_id."' AND property = '".$values['property']."' AND user_id = ".$this->user_id;
		$this->sql->execute($query);
		$query = "INSERT INTO app.app_state (property, value, app_id, user_id) VALUES('".$values['property']."', '".$values['value']."', '".$this->app_id."', ".$this->user_id.")";
		$this->sql->execute($query);
	}
	
	private $is_ws_server = false;

	public function assets($ws_server=false) {
		if($ws_server) {
			$this->is_ws_server = true;
		}
		return implode(" ", array($this->_js_index(NULL)));	//, $this->html_assets()
	}
	
	private $html_assign;
	
	public function get_html($path) {
		$output = "";
		$dir = $this->server_root.$path;
		$files = scandir($dir);
		foreach($files as $file) {
			if(strpos($file, "html") !== false) {
				$location = $dir."/".$file;
				$asset_index = substr($file, 0, strpos($file, ".html"));
				$file = fopen($location, "r");
				$contents = fread($file, filesize($location));
				$contents = addslashes($contents);
				$contents = trim(preg_replace('/\s+/', ' ', $contents));
				$output .= "app.content.html.html_data['".$asset_index."'] = \"".$contents."\"; ";
				fclose($file);
			}
		}
		return $output;
	}
	
	public function html_assets() {
		$output = " ";
		$this->html_assign = array();
		$output .= $this->get_html($this->project_root."/html");
		$output .= $this->get_html("/html");
		return $output;
	}

	private $ws_server_file_index = array(
		'ws.js'
	);
	
	private $root_assign;
	public function get_files($dir) {
		$output = " ";
		$files = scandir($dir);
		if($this->is_ws_server) {
			$files = $this->ws_server_file_index;
			$this->is_ws_server = false;
		}
		$files = array_reverse($files);
		foreach($files as $file) {
			$prefix = substr($file, 0, 1);
			if($prefix != "." && strpos($file, "js") !== false && $file != "base.js") {
				$location = $dir."/".$file;
				$file = fopen($location, "r");
				$contents = fread($file, filesize($location));
				fclose($file);
				$path = substr($contents, 0, strpos($contents, "="));
				array_push($this->root_assign, $path);
				$output .= " ".$contents;
			} else if($prefix != "." && strpos($file, "_") !== false && is_dir($dir."/".$file)) {
				$output .= $this->get_files($dir . DIRECTORY_SEPARATOR . $file);	
			}
		}
		return $output;
	}
							
	public function _js_index($filename=NULL) {
		$this->root_assign = array();
		$output = $this->get_files($this->server_root."/app");
		$output .= $this->get_files($this->server_root.$this->project_root."/app");
		if(count($this->root_assign) > 0) {
			$output .= " var root_assign = [";
			$counter = 0;
			foreach($this->root_assign as $path) {
				$output .= ($counter > 0 ? ", " : "");
				$output .= "'".$path."'";	
				$counter++;
			}
			$output .= "];";
		}
		return $output;
	}
	
	public function set_user(&$values) {
		$values['user_id'] = $this->user_id;	
	}
	
	public function get_apps($v) {
		$query = "SELECT * FROM app.apps WHERE disabled != 1 ORDER BY app_title";
		return $this->sql->json($query);	
	}
	
	public function _user_group_member($group_name, $group_id=NULL) {
		$group_name = strtolower($group_name);
		if($this->user_id == -1) {
			return 0;	
		}
		if($group_id == NULL) {
			$query = "SELECT id FROM app.user_groups WHERE LOWER(group_name) = '".$group_name."'";
			$group_id = $this->sql->get_row($query)['id'];
		}
		if($group_name == NULL) {
			$query = "SELECT group_name FROM app.user_groups WHERE id = ".$group_id;
			$group_name = $this->sql->get_row($query)['id'];	
		}
		if(strtolower($group_name) == "user") {
			if(!isset($this->user_id)) {
				return 0;
			} else if($this->user_id != -1) {
				return 1;	
			}
		} else {
			$query = "SELECT COUNT(*) as count FROM app.user_user_groups WHERE user_id = ".$this->user_id." AND user_group_id = ".$group_id;
			$count = $this->sql->get_row($query)['count'];	
			if($count > 0) {
				return 1;	
			}
		}
		$query = "SELECT parent_group_id FROM app.user_groups WHERE id = ".$group_id;
		$group_id = $this->sql->get_row($query)['parent_group_id'];
		if($group_id == NULL) {
			return 0;	
		}
		if($group_id != -1) {
			return $this->_user_group_member(NULL, $group_id);
		}
		return 0;
	}
	
	function highest_user_group() {
		$user_groups = array();
		$id = 1;
		while($id != -1) {
			$query = "SELECT * FROM app.user_groups WHERE id = ".$id;
			$user_group = $this->sql->get_row($query, 1);
			$user_groups[] = $user_group;
			$id = $user_group['parent_group_id'];
		}
		
		$query = "SELECT user_group_id FROM app.user_user_groups WHERE user_id = ".$this->user_id;
		$groups = $this->sql->get_rows($query, 1);
		$highest_group = NULL;
		
		foreach($groups as $group) {
			foreach($user_groups as $key => $user_group) {
				if($group['user_group_id'] == $user_group['id'] && ($highest_group === NULL || $key > $highest_group)) {
					$highest_group = $key;	
				}
			}
		}
		if($highest_group === NULL) {
			return "user";	
		}
		return strtolower($user_groups[$highest_group]['group_name']);	
	}
	
}

?>