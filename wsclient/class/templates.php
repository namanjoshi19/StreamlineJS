<?

class templates {
	private $sql;
	private $statement;
	private $user_id;
	private $list_start = 5;
	
	function __construct($sql, $statement, $user_id) {
		$this->sql = $sql;
		$this->statement = $statement;
		$this->user_id = $user_id;
	}
		
	function _template($v) {
		$this->statement->generate($v, "template_requests");
		$this->sql->execute($this->statement->get());
		return $this->sql->last_id($v);	
	}
	
	function templates_list($search_term, $offset) {
		$query = "SELECT * FROM templates";
		$rows = $this->sql->get_rows($query, 1);
		
		foreach($rows as $key => $row) {
			$rows[$key]['preview'] = "<a href='".$row['preview']."'>".$row['preview']."</a>";	
			if(isset($row['download'])) {
				$rows[$key]['download'] = "<a href='".$row['download']."'>Template GitHub Repository</a>";	
			}
			//unset($rows[$key]['download']);
		}
		
		return $rows;	
	}
	
	function template_requests_table($search_term, $offset) {
		$query = "SELECT id, name, description FROM template_requests";	
		return $this->sql->get_rows($query, 1);
	}
	
	/*function articles_carousel() {
		$query = "SELECT articles.id as id, title, image, content, created, keywords, app.users.email as username, app.users.id as user_id FROM articles, app.users WHERE articles.user_id = app.users.id LIMIT 0, 5";
		return $this->sql->get_rows($query, 1);	
	}
	
	function articles_list($search_term, $offset) {
		$search_string = "";
		if($search_term != '') {
			$search_string = " AND (title LIKE '%".$search_term."%' OR content LIKE '%".$search_term."%' OR created LIKE '%".$search_term."%' OR keywords LIKE '%".$search_term."%')";	
		}
		$query = "SELECT articles.id as id, title, content, created, keywords, app.users.email as username, app.users.id as user_id FROM articles, app.users WHERE articles.user_id = app.users.id ".$search_string." ORDER BY id DESC LIMIT ".($offset+$this->list_start);
		return $this->sql->get_rows($query, 1);	
	}
	
	function articles_table($search_term, $offset) {
		$search_string = "";
		if($search_term != '') {
			$search_string = " WHERE (title LIKE '%".$search_term."%' OR content LIKE '%".$search_term."%' OR created LIKE '%".$search_term."%' OR keywords LIKE '%".$search_term."%')";	
		}
		$query = "SELECT id, title, content, created, keywords FROM articles ".$search_string." ORDER BY id DESC LIMIT ".($offset+$this->list_start);// LIMIT ".$offset.", 5";
		return $this->sql->get_rows($query, 1);	
	}
	
	function articles_user_list($search_term, $offset, $user_id) {
		$query = "SELECT articles.id as id, title, content, created, keywords, app.users.email as username, app.users.id as user_id FROM articles, app.users WHERE articles.user_id = app.users.id AND user_id = ".$user_id." LIMIT ".($offset+$this->list_start);
		return $this->sql->get_rows($query, 1);	
	}
	
	function delete_article($id) {
		$query = "DELETE FROM articles WHERE id = ".$id;
		$this->sql->execute($query);	
	}
	
	function get_article($id) {
		$query = "SELECT * FROM articles WHERE id = ".$id;
		return $this->sql->get_row($query, 1);	
	}
	
	function get_user($id) {
		$query = "SELECT email FROM app.users WHERE id = ".$id;
		return $this->sql->get_row($query, 1);	
	}
	
	function _category($v) {
		$this->statement->generate($v, "categorys");
		$this->sql->execute($this->statement->get());
		return $this->sql->last_id($v);	
	}
	
	function categorys_table($search_term, $offset) {
		$query = "SELECT * FROM categorys"; // LIMIT ".$offset.", 5";
		return $this->sql->get_rows($query, 1);	
	}
	
	function delete_category($id) {
		$query = "DELETE FROM categorys WHERE id = ".$id;
		$this->sql->execute($query);	
	}
	
	function get_category($id) {
		$query = "SELECT * FROM categorys WHERE id = ".$id;
		return $this->sql->get_row($query, 1);	
	}
	
	function get_category_select() {
		$query = "SELECT id, name as title FROM categorys";	
		return $this->sql->get_rows($query, 1);
	}
	
	function _user_group($v) {
		$this->statement->generate($v, "user_groups");
		$this->sql->execute($this->statement->get());
		return $this->sql->last_id($v);	
	}
	
	function user_groups_table($search_term, $offset) {
		$query = "SELECT id, group_name, (SELECT group_name FROM user_groups WHERE user_groups.id = p.parent_group_id) as parent FROM user_groups as p";
		return $this->sql->get_rows($query, 1);	
	}
	
	function delete_user_group($id) {
		$query = "DELETE FROM user_groups WHERE id = ".$id;
		$this->sql->execute($query);	
	}
	
	function get_user_group($id) {
		$query = "SELECT * FROM user_groups WHERE id = ".$id;	
		return $this->sql->get_row($query, 1);
	}
	
	function get_parent_group_select() {
		$query = "SELECT id, group_name as title FROM user_groups";	
		return $this->sql->get_rows($query, 1);
	}
	
	function get_user_group_select() {
		$query = "SELECT id, group_name as title FROM user_groups";	
		return $this->sql->get_rows($query, 1);
	}
	
	function user_user_groups_table($search_term, $offset, $user_group_id) {
		$query = "SELECT app.users.id as user_id, app.users.email as email, user_groups.id as user_group_id, user_groups.group_name as user_group FROM user_user_groups, app.users, user_groups WHERE user_user_groups.user_id = app.users.id AND user_user_groups.user_group_id = user_groups.id AND user_user_groups.user_group_id = ".$user_group_id;
		return $this->sql->get_rows($query, 1);
	}
	
	function delete_user_user_group($user_id, $username, $group_id, $group_name) {
		$query = "DELETE FROM user_user_groups WHERE user_id = ".$user_id." AND user_group_id = ".$group_id;
		$this->sql->execute($query);	
	}
	
	function get_username_suggest($search_term) {
		$query = "SELECT app.users.id as id, app.users.email as value FROM app.users WHERE email LIKE '%".$search_term."%'";
		return $this->sql->get_rows($query, 1);	
	}
	
	function get_username_suggest_validation($search_term) {
		$search_term = strtolower($search_term);
		$query = "SELECT app.users.id as id, app.users.email as value FROM app.users WHERE LOWER(email) = '".$search_term."'";
		return $this->sql->get_row($query, 1);	
	}
	
	function _user_user_groups($v) {
		//$username = $v['username'];
		//$query = "SELECT id FROM app.users WHERE app.users.email = '".$username."'";
		$v['user_id'] = $v['username_value'];
		unset($v['username_value']);
		unset($v['username']);
		$this->statement->generate($v, "user_user_groups");
		$this->sql->execute($this->statement->get());
		return $this->sql->last_id($v);	
	}
	
	function username_validation($username) {
		return $this->validate_email($username);	
	}
	
	function validate_email($email) {
		if(!filter_var($email, FILTER_VALIDATE_EMAIL)) {
			return false;
		}
		return true;
	}
	
	function validate_url($url) {
		if(!preg_match("/\b(?:(?:https?|ftp):\/\/|www\.)[-a-z0-9+&@#\/%?=~_|!:,.;]*[-a-z0-9+&@#\/%=~_|]/i",$url)) {
			return false;
		}
		return true;
	}
	
	function _user($v) {
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