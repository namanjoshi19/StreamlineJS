<?

include '../base/base.php';

class app extends base {
	public $plasticity;
	
	public function __construct() {
		parent::__construct('plasticity', "/plasticity");
		
		$this->plasticity = new plasticity($this->sql, $this->statement, $this->user_id);
		
	}

	function get_state() {
		return array();
	}

	function get_static_data() {
		$result = array();

		$prefix = 'plasticity';

		$tables = array(
			'applications',
			'columns',
			'data_element_types',
			'data_elements',
			'element_types',
			'elements',
			'foreign_table_ids',
			'item_order',
			'node_properties',
			'nodes',
			'p_schemas',
			'pages',
			'tables',
			'user_groups'
		);
		foreach($tables as $table) {
			$query = "SELECT * FROM ".$prefix.".".$table;
			$result[$table] = $this->sql->get_rows($query, 1);
		}
		return $result;
	}

	/*function _user_group_member($group_name, $group_id=NULL) {
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
		if(strtolower($group_name) == "users") {
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
	}*/
	
}

?>