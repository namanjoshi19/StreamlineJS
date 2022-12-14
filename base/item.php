<?

class item {
	protected $sql;
	protected $statement;
	//protected $user_id = -1;
	protected $language;
	public $item_id;
	public $item_table;
	protected $ordered;
	protected $_class;
	protected $foreign_key;
	protected $table_limit;
	protected $no_id=false;
	
	function __construct($item_id, $item_table, $_class, $ordered=false, $language=0, $foreign_key=NULL, $table_limit=10, $no_id=false) {
		$this->item_id = $item_id;
		$this->item_table = $item_table;
		$this->ordered = $ordered;
		$this->sql = $_class->get_sql();
		$this->statement = $_class->get_statement();
		//$this->user_id = $_class->get_user_id();
		$this->_class = $_class;
		$this->language = $language;
		$this->foreign_key = $foreign_key;
		$this->table_limit = $table_limit;
		$this->no_id = false;
	}
	
	function _($v) {
		$this->statement->generate($v, $this->item_table);
		$this->sql->execute($this->statement->get());
		//var_dump($this->statement->get());
		$id = $this->sql->last_id($v);
		
		if($this->ordered) {
			$query = "INSERT INTO item_order (connect_id, connect_value, order_value) VALUES('".$id."', '".$this->item_id."', '-1')";
			$this->sql->execute($query);	
		}
		
		return $id;
	}
	
	public $alias;
	
	function set_alias($alias) {
		$this->alias = $alias;
	}
	
	function get($id) { //$id
		$query = "SELECT * FROM ".$this->item_table." WHERE id = ".$id;
		return $this->sql->get_row($query, 1);	
	}
	
	function delete($id) {
		$query = "DELETE FROM ".$this->item_table." WHERE id = ".$id;
		$this->sql->execute($query);	
	}
	
	function table($search_term=NULL, $offset=0, $item_id=NULL, $post_data=NULL, $select_columns=NULL) { //$search_term=NULL, $offset=0, $item_id=NULL, $post_data=NULL, $select_columns=NULL
		/*$search_term=NULL;
		$offset=0;
		$item_id=NULL;
		$post_data=NULL;
		$select_columns=NULL;
		if(isset($v['search_term'])) {
			$search_term = $v['search_term'];
		}
		if(isset($v['offset'])) {
			$offset = $v['offset'];
		}
		if(isset($v['item_id'])) {
			$item_id = $v['item_id'];
		}
		if(isset($v['post_data'])) {
			$post_data = $v['post_data'];
		}
		if(isset($v['select_columns'])) {
			$select_columns = $v['select_columns'];
		}*/
		$item_id_string = "";
		if($item_id != NULL && $this->foreign_key != NULL) {
			$item_id_string = " WHERE ".$this->item_table.".".$this->foreign_key." = ".$item_id;	
		}
		if($post_data !== NULL) {
			if(is_array($post_data)) {
				foreach($post_data as $key => $value) {
					if($item_id_string == "") {
						$item_id_string .= " WHERE ";	
					} else {
						$item_id_string .= " AND ";	
					}
					$item_id_string .= $this->item_table.".".$key." = ".$value;	
				}
			}
		}
		
		$columns = $this->sql->table_columns($this->item_table);
			
		$query_search = "";
		if($search_term	!= NULL && $search_term != '') {		
			if($item_id_string == "") {
				$query_search .= " WHERE";
			} else {
				$query_search .= " AND";	
			}
			$search_term_count = 0;
			foreach($columns as $column) {
				if(strpos($column, "_id") === false && $column != "id") {
					if($search_term_count > 0) {
						$query_search .= " OR ";	
					}
					//$query_search .= " ".$column." LIKE '%".$search_term."%'";
					$query_search .= " ".$column." LIKE @search_term ESCAPE '\' ";
					$search_term_count++;	
				}
			}
		}
		
		$query_order_table = "";
		$query_order = "";
		$order_column = "";
		$order_end_string = " ORDER BY id DESC ";
		if($this->ordered) {
			$query_order_table = ", item_order";
			if($query_search == "" && $item_id_string == "") {
				$query_order .= " WHERE";
			} else {
				$query_order .= " AND";	
			}
			$query_order .= " item_order.connect_id = ".$this->item_table.".id AND item_order.connect_value = '".$this->item_table."'";
			$order_column = ", item_order.order_value as order_value";
			$order_end_string = " ORDER BY order_value ASC";
		}
		$offset_string = " LIMIT ".$this->table_limit;
		if($offset > 0) {
			//$offset_string = " LIMIT ".$offset.", ".$this->table_limit;
			$offset_string = " LIMIT ".($offset+$this->table_limit);
		}
		
		$user_query = "";
		if(isset($columns['user_id'])) {
			if($query_search == "" && $item_id_string == "" && $query_order == "") {
				$user_query .= " WHERE";
			} else {
				$user_query .= " AND";	
			}
			$user_query .= " ".$this->item_table.".user_id = ".$this->_class->get_user_id()." ";	
		}
		
		$query = "SELECT ".$this->item_table.".* ";
		if($select_columns != NULL) {
			$query = "SELECT ";
			$counter = 0;
			foreach($select_columns as $key => $column) {
				if($counter > 0) {
					$query .= ", ";
				}
				$query .= $this->item_table.".".$column;
				$counter++;
			}
		}
		$query .= $order_column." FROM ".$this->item_table.$query_order_table.$item_id_string.$query_search.$query_order.$user_query."";
		if($query_order != "") {
			if($order_column != "") {
				$order_column = ", -1 as order_value";	
			}
			$where_and = " WHERE";
			if($item_id_string != "" || $user_query != "") {
				$where_and = " AND";	
			}
			//$query .= " UNION SELECT ".$this->item_table.".* ";
			if($select_columns != NULL) {
				$query = "UNION SELECT ";
				$counter = 0;
				foreach($select_columns as $key => $column) {
					if($counter > 0) {
						$query .= ", ";
					}
					$query .= $this->item_table.".".$column;
					$counter++;
				}
			} else {
				$query .= " UNION SELECT ".$this->item_table.".* ";
			}
			$query .= $order_column." FROM ".$this->item_table." ".$item_id_string.$user_query.$where_and." (SELECT COUNT(*) FROM item_order WHERE item_order.connect_value = '".$this->item_table."' AND item_order.connect_id = ".$this->item_table.".id) = 0";	
		}
		$query .= $order_end_string.$offset_string;
		//var_dump($query);
		$query_values = NULL;
		if($query_search != "") {
			$search_term = str_replace(array('%', '\\'), array('\\%', '\\\\'), $search_term);
			$query_values = array(
				'search_term' => '%'.$search_term.'%'
			);
		}
		return $this->sql->get_rows($query, 1, NULL, false, false, $query_values);
	}
	
	function list_count($post_data=NULL) { //$item_id=NULL,
		/*$post_data=NULL;
		if(isset($v[0])) {
			$post_data = $v[0];
		}*/
		$item_id_string = "";
		/*if($item_id != NULL && $this->foreign_key != NULL) {
			$item_id_string = " WHERE ".$this->item_table.".".$this->foreign_key." = ".$item_id;	
		}*/
		$return_pagination = false;
		if($post_data !== NULL && is_array($post_data)) {
			foreach($post_data as $key => $value) {
				if($value !== NULL && $value != '' && $value != -1) {
					if($item_id_string == "") {
						$item_id_string .= " WHERE ";	
					} else {
						$item_id_string .= " AND ";	
					}
					$item_id_string .= $this->item_table.".".$key." = ".$value." ";	
				}
			}
		} else {
			$return_pagination = true;
		}
		$user_query = "";
		$columns = $this->sql->table_columns($this->item_table);
		if(isset($columns['user_id'])) {
			if($item_id_string != "") {
				$user_query = " AND ";	
			} else {
				$user_query = " WHERE ";	
			}
			$user_query .= " user_id = ".$this->_class->get_user_id();
		}
		
		$query = "SELECT COUNT(*) as count FROM ".$this->item_table.$item_id_string.$user_query;
		//var_dump($query);
		$count = $this->sql->get_row($query, 1)['count'];	
		//var_dump($count);
		/*if($return_pagination) {
			if($post_data == 0) {
				return 0;
			}
			$count = floor($count/$post_data);
		}*/
		return $count;
	}
	
	function get_select() {
		$set_column = NULL;
		$columns = $this->sql->table_columns($this->item_table);
		
		$user_query = "";
		if(isset($columns['user_id'])) {
			$user_query = " WHERE ".$this->item_table.".user_id = ".$this->_class->get_user_id();	
		}
		
		foreach($columns as $column) {
			if($column == "title") {
				$set_column = "title";
			}
			if($column == "name") {
				$set_column = "name";
			}
		}
		if($set_column != NULL) {
			$query = "SELECT id, ".$set_column." as title FROM ".$this->item_table.$user_query." ORDER BY title ASC";
			return $this->sql->get_rows($query, 1);
		}
		return array();
	}
	
}

?>