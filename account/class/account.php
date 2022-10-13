<?

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

class account {
	private $sql;
	private $statement;
	private $user_id;
	private $cloud_call;
	
	function __construct($sql, $statement, $user_id, $base=NULL) {
		$this->sql = $sql;
		$this->statement = $statement;
		$this->user_id = $user_id;
		$this->base = $base;
	}

	private $base;
	
	function get_state() {
		return array();	
	}
	
	public $function_access = array(
		'user' => array(
			'_subscriptions_table',
			'subscribed_checked',
		)
	);

	function _main_settings($v) {
		$query = "DELETE FROM app.settings WHERE user_id = ".$this->user_id;
		$this->sql->execute($query);
		$this->statement->generate($v, "app.settings");
		$this->sql->execute($this->statement->get());
	}
	
	function get_settings() {
		$query = "SELECT * FROM app.settings WHERE user_id = ".$this->user_id;
		return $this->sql->get_row($query, 1);
	}

	function downloads_table($search_term, $offset) {
		$query = "SELECT downloads.id as id, app.apps.name as image, downloads.title as title, downloads.description as description, href FROM downloads, app.apps WHERE downloads.app_id = app.apps.id";	
		return $this->sql->get_rows($query, 1);
	}
	
	function web_applications_table($search_term, $offset) {
		$query = "SELECT web_applications.id as id, app.apps.name as image, web_applications.title as title, web_applications.description as description, href FROM web_applications, app.apps WHERE web_applications.app_id = app.apps.id";	
		return $this->sql->get_rows($query, 1);
	}
	
	function subscriptions_table($search_term, $offset) {
		$query = "SELECT * FROM app.apps WHERE app.apps.subscription = 1";
		$rows = $this->sql->get_rows($query, 1);	
		foreach($rows as $key => $row) {
			$rows[$key]['name'] = "<a href='/".strtolower($row['name'])."'>".$row['name']."</a>";
			$query = "SELECT subscribed FROM subscriptions WHERE app_id = ".$row['id']." AND user_id = ".$this->user_id;
			$subscription = $this->sql->get_row($query, 1);
			if(count($subscription) > 0) {
				$subscription = $subscription['subscribed'];
				if($subscription == 1) {
					$subscription = true;	
				} else {
					$subscription = false;	
				}
			} else {
				$subscription = false;	
			}
			
			$rows[$key]['subscribed'] = $subscription;	
		}
		return $rows;
	}
	
	function subscribed_checked($item_id, $checked) {
		$query = "SELECT COUNT(*) as count FROM subscriptions WHERE app_id = ".$item_id." AND user_id = ".$this->user_id;
		$count = $this->sql->get_row($query, 1)['count'];
		var_dump($count);	
		if($count > 0) {
			$query = "UPDATE subscriptions SET subscribed = ".$checked." WHERE app_id = ".$item_id." AND user_id = ".$this->user_id;
			var_dump($query);
			$this->sql->execute($query);	
		} else {
			$query = "INSERT INTO subscriptions (subscribed, app_id, user_id) VALUES('".$checked."', ".$item_id.", ".$this->user_id.")";
			$this->sql->execute($query);	
		};
	}
	
	function email_validation($value) {
		$query = "SELECT COUNT(*) as count FROM app.users WHERE email = '".$value."'";
		$count = $this->sql->get_row($query)['count'];
		return !($count > 0);	
	}
	
	function _user($v) {
		$continue = false;
		if($this->user_id != -1) {
			$v['id'] = $this->user_id;
			//$v['u_id'] = $this->user_id;	
			$continue = true;
		} else if(isset($v['token'])) {
			$secret_key = "--set secret key from googl here--";
			$url = 'https://www.google.com/recaptcha/api/siteverify';
			$data = array('secret' => $secret_key, 'response' => $v['token']);
			
			unset($v['token']);
			
			$options = array(
				'http' => array(
			  	'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
			  	'method'  => 'POST',
			  	'content' => http_build_query($data)
			)
			);
			$context  = stream_context_create($options);
			$response = file_get_contents($url, false, $context);
			$response_keys = json_decode($response, true);
			//var_dump($response_keys);
			if($response_keys["success"]) {
				$continue = true;
			}
		}
		if($continue) {
			/*if(!isset($v['id']) || $v['id'] == -1) {
				$v['u_id'] = $this->base->generate_user_id();
			}*/
			$this->statement->generate($v, "app.users");
			//var_dump($this->statement->get());
			$this->sql->execute($this->statement->get());
			//var_dump($this->statement->get());
			$user_id = $this->sql->last_id($v);	
			if($user_id != -1) {
				$this->user_id = $user_id;
				$_SESSION['user_id'] = $user_id;
				$v['id'] = $user_id;
				unset($v['password']);

				/*$v = array(

				);*/

				$this->statement->generate($v, "app.users_public", 1);
				$this->sql->execute($this->statement->get());

				$v = array(
					'user_id' => $user_id,
					'user_group_id' => 5
				);
				$this->statement->generate($v, "plasticity.user_group_users");
				$this->sql->execute($this->statement->get());

				$v = array(
					'user_id' => $user_id,
					'user_group_id' => 13
				);
				$this->statement->generate($v, "plasticity.user_group_users");
				$this->sql->execute($this->statement->get());

				$v = array(
					'user_id' => $user_id,
					'user_group_id' => 1
				);
				$this->statement->generate($v, "app.user_user_groups");
				$this->sql->execute($this->statement->get());
			}
			return $user_id;
		}
		return -1;
	}

	function get_account() {
		//$query = "SELECT id FROM app.users WHERE id = ";
		return array('id' => $this->user_id);
	}

	function _reset_password($values) {
		$email = trim($values['email']);
		$query = "SELECT id, email FROM app.users WHERE email = '".$email."'";
		$user = $this->sql->get_row($query, 1);
		if($user != NULL) {
			$characters = array_merge(range(0, 9), range('a', 'z'));
			$counter = 0;
			$password = "";
			while($counter < 15) {
				$index = random_int(0, count($characters)-1);
				$password .= $characters[$index];
				$counter++;
			}
			$v = array(
				'id' => $user['id'],
				'password' => $password
			);

			$this->statement->generate($v, "app.users");
			$this->sql->execute($this->statement->get());
			
			$to = $user['email'];
			$subject = 'Noob Software - Noob Account Password Reset';
			$message = 'If you did not reset your password please contact www.noob.software@gmail.com and let us know. You have reset your password, this is your new password: '.$password.'';
			$message = wordwrap($message, 70, "\r\n");
			/*$headers = 'From: www.noob.software@gmail.com' . "\r\n" .
			    'Reply-To: www.noob.software@gmail.com' . "\r\n" .
			    'X-Mailer: PHP/' . phpversion();*/

			$mail = new PHPMailer(true);

			try {
				//Server settings
				//$mail->SMTPDebug = SMTP::DEBUG_SERVER;                      //Enable verbose debug output
				$mail->isSMTP();                                            //Send using SMTP
				$mail->Host       = 'smtp.gmail.com';                     //Set the SMTP server to send through
				$mail->SMTPAuth   = true;                                   //Enable SMTP authentication
				$mail->Username   = 'www.noob.software@gmail.com';                     //SMTP username
				$mail->Password   = 'InfiniteMathematikHip';                               //SMTP password
				$mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;            //Enable implicit TLS encryption
				$mail->Port       = 465;                                    //TCP port to connect to; use 587 if you have set `SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS`

				//Recipients
				$mail->setFrom('www.noob.software@gmail.com', 'Mailer');
				$mail->addAddress($to, $to);     //Add a recipient
				//$mail->addAddress('ellen@example.com');               //Name is optional
				$mail->addReplyTo('www.noob.software@gmail.com', 'Noob Software Contact');
				//$mail->addCC('cc@example.com');
				//$mail->addBCC('bcc@example.com');

				//Attachments
				//$mail->addAttachment('/var/tmp/file.tar.gz');         //Add attachments
				//$mail->addAttachment('/tmp/image.jpg', 'new.jpg');    //Optional name

				//Content
				$mail->isHTML(true);                                  //Set email format to HTML
				$mail->Subject = $subject;
				$mail->Body    = $message;
				$mail->AltBody = $message;

				$mail->send();
				return 1;
				//echo 'Message has been sent';
			} catch (Exception $e) {
				return -3;
				//echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
			}

			//$result = mail($to, $subject, $message, $headers);
			/*if($result) {
				return 1;
			} else {
				//$errorMessage = error_get_last();
				//var_dump($errorMessage);
				return -3;
			}*/
		}
		return -1;
	}
	
	/*function get_cloud() {
		if(isset($this->user_id) && $this->user_id != -1) {
			$query = "SELECT * FROM app.users WHERE id = ".$this->user_id;
			$row = $this->sql->get_row($query, 1);
			
			if($row['server_id'] == NULL) {
				
				return array(
					'purchased' => true,
					'init' => 1,
					'instructions' => "Please set up your Noob Cloud: "
				);	
			} else {
				$query = "SELECT * FROM cloud_api.servers WHERE id = ".$row['server_id'];
				$server = $this->sql->get_row($query, 1, NULL, true);
				return array(
					'purchased' => true,
					'init' => 0,
					'instructions' => "Your Noob Cloud has been setup and has the server URL: ".$server['address']
				);	
			}
		}
		return array(
			'purchased' => false
		);
	}
	
	function _server($v) {
		$query = "SELECT * FROM cloud_api.servers WHERE user_id = ".$this->user_id;
		$server_id = $this->sql->get_row($query, 1);
		if($server_id != NULL) {
			$server_id = $server_id['id'];	
			$v['id'] = $server_id;
		}
		
		$this->statement->generate($v, "cloud_api.servers");
		$this->sql->execute($this->statement->get());
		$server_id = $this->sql->last_id($v);	
		
		$v = array(
			'id' => $this->user_id,
			'server_id' => $server_id
		);
		$this->statement->generate($v, "app.users");
		$this->sql->execute($this->statement->get());
		$user_id = $this->sql->last_id($v);	
		
		return $server_id;
	}*/
}

?>