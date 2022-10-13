<?

class about {
	private $sql;
	private $statement;
	private $user_id;
	
	function __construct($sql, $statement, $user_id) {
		$this->sql = $sql;
		$this->statement = $statement;
		$this->user_id = $user_id;
	}
		
	function reference_type($reference_type) {
		switch($reference_type) {
			case 'feature_request':
				$reference_type = 0;
				break;
			case 'bug_report':
				$reference_type = 1;
				break;	
		}
		return $reference_type;	
	}

	public $function_access = array(
		'admin' => array(
			//'_subscriptions_table',
			//'subscribed_checked',
			'_instructions'
		)
	);
	
	function get_state() {
		return array();	
	}
		
	function _make_comment($v) {
		$v['reference_type'] = $this->reference_type($v['reference_type']);
		$this->statement->generate($v, "discussion");
		//var_dump($this->statement->get());
		$this->sql->execute($this->statement->get());
		return $this->sql->last_id($v);	
	}
	
	function get_discussion($reference_id, $reference_type, $parent_id=-1) {
		$reference_type = $this->reference_type($reference_type);
		$query = "SELECT discussion.*, app.users.email as email FROM discussion, app.users WHERE discussion.user_id = app.users.id AND reference_id = ".$reference_id." AND reference_type = ".$reference_type." AND parent_id = ".$parent_id;
		$rows = $this->sql->get_rows($query, 1);
		foreach($rows as $key => $row) {
			$rows[$key]['children'] = $this->get_discussion($reference_id, $reference_type, $row['id']);
		}
		return $rows;
	}
	
	function get_app_instructions($id) {
		$query = "SELECT * FROM app.apps WHERE id = ".$id;
		$row = $this->sql->get_row($query, 1);
		return array(
			'instructions_description' => $row['name']." Instructions and Examples.",
			'introduction' => $row['introduction']
		);	
	}
	
	function apps_table() {
		$query = "SELECT id, name as image, name, description FROM app.apps WHERE active = 1";
		return $this->sql->get_rows($query, 1);
	}
	
	function _instructions($v) {
		$this->statement->generate($v, "instructions");
		$this->sql->execute($this->statement->get());
		//var_dump($this->statement->get());
		return $this->sql->last_id($v);	
	}
	
	function instructions_table($search_term, $offset) {
		$query = "SELECT instructions.id as id, title, content, app.apps.name as name, type_id FROM instructions, app.apps WHERE instructions.app_id = app.apps.id ORDER BY title";
		return $this->sql->get_rows($query, 1);	
	}
	
	function delete_instruction($id) {
		$query = "DELETE FROM instructions WHERE id = ".$id;
		$this->sql->execute($query);	
	}
	
	function get_instruction($id) {
		$query = "SELECT id, app_id, title, content, type_id FROM instructions WHERE id = ".$id;
		return $this->sql->get_row($query, 1);	
	}
	
	function instructions_view_table($search_term, $offset, $app_id=NULL) {
		$app_name = ", app.apps.name as app_name";
		$app_id_query = "";
		if($app_id != NULL) {
			$app_id_query = "AND app_id = ".$app_id;
			$app_name = "";	
		}
		$query = "SELECT instructions.id, title".$app_name." FROM instructions, app.apps WHERE instructions.app_id = app.apps.id AND type_id = 1 ".$app_id_query."  ORDER BY title";
		return $this->sql->get_rows($query, 1);
	}
	
	function examples_table($search_term, $offset, $app_id=NULL) {
		$app_name = ", app.apps.name as app_name";
		$app_id_query = "";
		if($app_id != NULL) {
			$app_id_query = "AND app_id = ".$app_id;	
		$app_name = "";
		}
		$query = "SELECT instructions.id, title".$app_name." FROM instructions, app.apps WHERE instructions.app_id = app.apps.id AND type_id = 2 ".$app_id_query." ORDER BY title";
		return $this->sql->get_rows($query, 1);
	}
	
	function get_type_select() {
		/*$query = "SELECT id, name as title FROM app.apps";
		return $this->sql->get_rows($query, 1);	*/
		return array(
			array('id' => 1, 'title' => 'Instructions'),
			array('id' => 2, 'title' => 'Examples')
		);
	}
	
	function get_app_select() {
		$query = "SELECT id, name as title FROM app.apps WHERE active = 1";
		return $this->sql->get_rows($query, 1);	
	}
	
	function _bug_report($v) {
		$v['status'] = 1;
		$this->statement->generate($v, "bug_reports");
		//var_dump($this->statement->get());
		$this->sql->execute($this->statement->get());
		return $this->sql->last_id($v);	
	}
	
	private $list_start = 5;
	
	function bug_reports_list($search_term, $offset) {
		$query = "SELECT bug_reports.id, title, description as content, email as username, bug_reports.user_id as user_id, created FROM bug_reports, app.users WHERE bug_reports.user_id = app.users.id ORDER BY id DESC LIMIT ".($this->list_start+$offset);//".$offset.",
		return $this->sql->get_rows($query, 1, NULL, true);	
	}
	
	function bug_reports_table($search_term, $offset) {
		$query = "SELECT bug_reports.id, title, bug_reports.description as content, email as username, bug_reports.user_id as user_id, created, app.apps.name as app_name FROM bug_reports, app.users, app.apps WHERE bug_reports.app_id = app.apps.id AND bug_reports.user_id = app.users.id  ORDER by id DESC LIMIT ".$offset.", 5";
		return $this->sql->get_rows($query, 1);	
	}
	
	function bug_reports_list_count() {
		$query = "SELECT COUNT(*) as count FROM bug_reports";
		return $this->sql->get_row($query)['count'];	
	}
	
	function get_bug_report($id) {
		$query = "SELECT title, created, email as user, bug_reports.user_id as user_id, bug_reports.description as content, app.apps.name as app_name, status.value as status FROM bug_reports, app.users, app.apps, status WHERE bug_reports.status = status.id AND app.apps.id = bug_reports.app_id AND bug_reports.user_id = App.users.id AND bug_reports.id = ".$id;
		return $this->sql->get_row($query, 1);	
	}
	
	function _feature_request($v) {
		$v['status'] = 1;
		$this->statement->generate($v, "feature_requests");
		$this->sql->execute($this->statement->get());
		return $this->sql->last_id($v);	
	}
	
	function feature_requests_list($search_term, $offset) {
		$query = "SELECT feature_requests.id, title, description as content, email as username, feature_requests.user_id as user_id, created FROM feature_requests, app.users WHERE feature_requests.user_id = app.users.id";
		return $this->sql->get_rows($query, 1);	
	}
	
	function feature_requests_list_count() {
		$query = "SELECT COUNT(*) as count FROM feature_requests";
		return $this->sql->get_row($query)['count'];
	}	
	
	function get_feature_request($id) {
		$query = "SELECT title, created, email as user, feature_requests.user_id as user_id, feature_requests.description as content, app.apps.name as app_name, status.value as status FROM feature_requests, app.users, app.apps, status WHERE feature_requests.status = status.id AND app.apps.id = feature_requests.app_id AND feature_requests.user_id = app.users.id AND feature_requests.id = ".$id;
		return $this->sql->get_row($query, 1);	
	}
	
	function get_user($id) {
		$query = "SELECT email FROM app.users WHERE id = ".$id;
		return $this->sql->get_row($query, 1);	
	}
	
	function _article($v) {
		$this->statement->generate($v, "articles");
		$this->sql->execute($this->statement->get());
		return $this->sql->last_id($v);	
	}
	
	function username_validation($username) {
		return $this->validate_email($username);	
	}
	
	
	/*function _user($v) {
		$v['email'] = $v['username'];
		unset($v['username']);
		$this->statement->generate($v, "app.users");
		$this->sql->execute($this->statement->get());
		return $this->sql->last_id($v);	
	}
	
	function _user_information($v) {
		$query = "SELECT COUNT(*) as count FROM app.users WHERE id = ".$this->user_id." AND password = '".$v['old_password']."'";
		$count = $this->sql->get_row($query)['count'];
		//$v['id'] = $this->user_id;
		unset($v['old_password']);
		if($count == 1) {	
			$this->statement->generate($v, "app.users", 0);
			$this->sql->execute($this->statement->get());
			return $this->sql->last_id($v);		
		}
	}
	
	function is_user($id) {
		if($this->user_id == $id) {
			return 1;	
		}
		return 0;
	}*/
}

?>