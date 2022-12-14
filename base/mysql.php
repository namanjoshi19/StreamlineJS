<?php

class mysql {
	
	private $username = 'noob';
	private $password = 'noob';
	private $db;
	private $skipun;	
	private $results;
	private $connection;
	
	
	function get_connection() {
		return $this->connection;	
	}
	
	private $server = array(
		'server' => 'localhost'
	);
	
	private $id_server;
	public $config_globals;	
	private $database_prefix = NULL;
		
	public $_db;
		
	function __construct($db=NULL, $username="noob", $password="noob", $server="localhost") {
		$this->db = $db;
		$this->_db = $this->db;
		$this->results = NULL;
		
		$this->username = $username;
		$this->password = $password;
		
		global $config_global;
				
		if(isset($config_global['database_prefix'])) {
			$this->database_prefix = $config_global['database_prefix'];
			$this->db = $this->database_prefix.$this->db;	
		}
		if(isset($config_global['database_username'])) {
			$this->username = $config_global['database_username'];	
		}
		if(isset($config_global['database_password'])) {
			$this->password = $config_global['database_password'];	
		}
				
		$this->connect();
		
		if(isset($_SESSION['user_id'])) {
			$this->user_id = $_SESSION['user_id'];
		}

	}
	
	function setDb($d) {
		$this->db = $d;
	}
	
	private $user_id = -1;
	
	function set_user($user_id) {
		$this->user_id = $user_id;
	}
	
	function connect()	{
		$this->connection = array();
		$server = $this->server;
		try {
			$username = $this->username;
			$password = $this->password;
			
			$this->connection = mysqli_connect($server['server'], $username, $password);
			mysqli_select_db($this->connection, $this->db); 
		} catch(Exception $e) { 
			return false; 
		}
		
	}

	private $plasticity_tables = array(
		'pages' => array(
			'table' => 'pages',
			'parents' => array()
		),
		'elements' => array(
			'table' => 'elements',
			'parents' => array('pages')
		)
	);

	private $plasticity_application_id = NULL;

	function set_plasticity_application_id($application_id) {
		$this->plasticity_application_id = $application_id;
	}

	function contain_plasticity_query($query) {
		$append_where_id = false;
		if(strpos($query, " id = ") !== false) {
			$append_where_id = true;
			return $query;
		}
		//var_dump($query);
		if(strpos($query, "INFORMATION_SCHEMA") !== false) {
			return $query;
		}
		$tables = array();
		$query_split = explode(" FROM ", $query);
		$second_split;
		$from_part = $query_split[1];
		$has_where = false;
		$second_split_delimiter = NULL;
		if(strpos($from_part, " WHERE") !== false) {
			$second_split = explode(" WHERE", $from_part);
			$has_where = true;
			$from_part = $second_split[0];
			$second_split_delimiter = " WHERE";
		} else if(strpos($from_part, " LIMIT ") !== false) {
			$second_split = explode(" LIMIT ", $from_part);
			$from_part = $second_split[0];
			$second_split_delimiter = " LIMIT ";
		} else if(strpos($from_part, " ORDER BY ") !== false) {
			$second_split = explode(" ORDER BY ", $from_part);
			$from_part = $second_split[0];
			$second_split_delimiter = " ORDER BY ";
		}
		$add_relations = [];
		$tables = explode(",", $from_part);
		if($append_where_id) {
			$second_split[1] = implode(" ".$tables[0].".id = ", explode(" id = ", $second_split[1]));
		}
		$has_tables = array();
		$has_tables_by_index = array();
		foreach($tables as $table) {
			$table = trim($table);
			/*foreach($this->plasticity_tables as $placticty_table) {
				if($table == $plasticity_table['table']) {
					$has_tables[] = $table;
				}
			}*/
			if(isset($this->plasticity_tables[$table])) {
				$has_tables[] = $this->plasticity_tables[$table];
				$has_tables_by_index[$table] = true;
			}
		}
		foreach($has_tables as $has_table) {
			foreach($has_table['parents'] as $parent) {
				if(!isset($has_tables_by_index[$parent])) {
					$has_tables_by_index[$parent] = true;
					$parent_singular = substr($parent, 0, -1);
					$add_relations[] = " ".$has_table['table'].".".$parent_singular."_id = ".$parent.".id ";
				}
			}
		}
		if(count($has_tables_by_index) > 0) {
			$add_relations[] = " pages.application_id = ".$this->plasticity_application_id." ";
		} else {
			return $query;
		}
		$tables_result = [];
		foreach($has_tables_by_index as $table_key => $value) {
			$tables_result[] = trim($table_key);
		}
		foreach($tables as $table) {
			$table = trim($table);
			if(array_search($table, $tables_result) === false) {
				$tables_result[] = $table;
			}
		}
		$from_part = implode(",", $tables_result);
		if($second_split_delimiter != NULL) {
			if($second_split_delimiter == " WHERE") {
				$second_split[1] = implode(" AND ", $add_relations)." AND ".$second_split[1];
			} else {
				$second_split[1] = " WHERE ".implode(" AND ", $add_relations)." ".$second_split[1];
			}
			$second_split[0] = $from_part;
			$second_split = implode($second_split_delimiter, $second_split);
			$query_split[1] = $second_split;
			$query_split = implode(" FROM ", $query_split);
		} else {
			$from_part .= " WHERE ".implode(" AND ", $add_relations);
			$query_split[1] = $from_part;
			$query_split = implode(" FROM ", $query_split);
		}
		//var_dump($add_relations);
		//var_dump($query_split);
		return $query_split;
	}
	
	private $last_query_string;

	function verify_user($query) {
		$split = explode(' ', trim($query));
		$table = $split[1];
		$select = false;
		$tables = array();
		$update = false;
		$where_string = "";
		if($split[0] == "DELETE") {
			$table = $split[2];	
		} else if($split[0] == "SELECT") {
			$from_found = false;
			$select = true;
			foreach($split as $key => $split_value) {
				if($split_value == "WHERE") {
					break;	
				}
				if($from_found) {
					$tables[] = explode(",", $split_value)[0];	
				}
				if($split_value == "FROM") {
					$from_found = true;
				}
			}
		} else if($split[0] == 'UPDATE') {
			$from_found = false;
			$where_found = false;
			foreach($split as $key => $split_value) {
				if($split_value == 'WHERE') {
					$where_found = true;
				}
				if($where_found) {
					$where_string .= $split_value.' ';
				}
				if($split_value == "SET") {
					$from_found = false;
					$update = true;
					break;	
				}
				if($from_found) {
					$tables[] = explode(",", $split_value)[0];	
				}
				if($split_value == "UPDATE") {
					$from_found = true;
				}
			}
		}
		
		$db = $this->db;
		if(strpos($table, ".") !== false) {
			$table_split = explode(".", $table);
			$db = $table_split[0];
			$table = $table_split[1];	
		}
		if($update) {
			$query = $where_string;
			$search_string = 'id = ';
			$where_string = $search_string;
			if(strpos($query, $where_string) !== false) {
				$where_split = explode($where_string, $query);
				$where_condition = $where_split[1];
			/*if(strpos($query, $where_string) !== false) {
				if(strpos($where_condition, "=") === false) {
					$shared_query = "SELECT COUNT(*) as count FROM app.shared WHERE table_id = '".$db.".".$table."' AND item_id = ".trim($where_condition)." AND user_id = ".$this->user_id;
					$shared = $this->get_row($shared_query, 1, NULL, true);
					if($shared != NULL) {
						$shared = $shared['count'];
						if($shared > 0) {
							return true;	
						}
					}
				}
			}*/
				$schema_query = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '".$db."' AND TABLE_NAME = '".$table."'";
				$rows = $this->get_rows($schema_query, 1, NULL, true);
				foreach($rows as $column) {
					if($column['COLUMN_NAME'] == "user_id") {
						$where_split = explode(" WHERE ", $query);
						$where_condition = $where_split[1];
							
						$verification_query = "SELECT * FROM ".$db.".".$table." WHERE ".$where_condition;
						$row = $this->get_row($verification_query, 1, NULL, true);
						if(isset($row['user_id']) && $row['user_id'] != $this->user_id) {
							return false;	
						}
					
					}
				}
			}
		} else if(!$select) {
			$where_string = " WHERE id = ";
			if(strpos($query, $where_string) !== false) {
				$where_split = explode($where_string, $query);
				$where_condition = $where_split[1];
			/*
				if(strpos($where_condition, "=") === false) {
					$shared_query = "SELECT COUNT(*) as count FROM app.shared WHERE table_id = '".$db.".".$table."' AND item_id = ".trim($where_condition)." AND user_id = ".$this->user_id;
					$shared = $this->get_row($shared_query, 1, NULL, true);
					if($shared != NULL) {
						$shared = $shared['count'];
						if($shared > 0) {
							return true;	
						}
					}
				}
			}*/
				$schema_query = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '".$db."' AND TABLE_NAME = '".$table."'";
				$rows = $this->get_rows($schema_query, 1, NULL, true);
				foreach($rows as $column) {
					if($column['COLUMN_NAME'] == "user_id") {
						$where_split = explode(" WHERE ", $query);
						$where_condition = $where_split[1];
							
						$verification_query = "SELECT * FROM ".$db.".".$table." WHERE ".$where_condition;
						$row = $this->get_row($verification_query, 1, NULL, true);
						if(isset($row['user_id']) && $row['user_id'] != $this->user_id) {
							return false;	
						}
					
					}
				}
			}
		} else {
			if(strpos($query, " WHERE user_id = ") !== false) {
				$where_split_first = explode(" WHERE user_id = ", $query);
				if(is_numeric($where_split_first[1])) {
					if($where_split_first[1] == $this->user_id) {
						return true;	
					}
					return false;
				}
			}
			
			$from_split = explode(" FROM ", $query);
			
			$select_values = "";
			
			foreach($tables as $table) {
				$db = $this->db;
				if(strpos($table, ".") !== false) {
					$table_split = explode(".", $table);
					$db = $table_split[0];
					$table = $table_split[1];	
				}
				$schema_query = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '".$db."' AND TABLE_NAME = '".$table."'";
				$rows = $this->get_rows($schema_query, 1, NULL, true);
				$has_id = false;
				foreach($rows as $column) {
					if($column["COLUMN_NAME"] == "id") {
						$has_id = true;	
					}
					if($column['COLUMN_NAME'] == "user_id" && $has_id) {
						if($select_values != "") {
							$select_values .= ", ";	
						}
						$select_values .= $db.".".$table.".user_id as ".$db."0".$table."0user_id, ".$db.".".$table.".id as ".$db."0".$table."0id";
					}
				}
			}
			
			if($select_values == "") {
				return true;	
			}
			
			$row_verification = array();
			
			$verification_query = "SELECT ".$select_values." FROM ".$from_split[1];
			$rows = $this->get_rows($verification_query, 1, NULL, true);
			foreach($rows as $key => $row) {
				$row_verification[$key] = true;
				foreach($row as $column => $value) {
					if(strpos($column, "0user_id") !== false && $value != $this->user_id) {
						$row_verification[$key] = false;
					}
				}
			}
			
			/*foreach($rows as $row_key => $row) {
				if(!$row_verification[$row_key]) {
					foreach($row as $column => $value) {
						if(strpos($column, "0id") !== false) {
							$table_split_row = explode("0", $column);
							$db = $table_split_row[0];
							$table = $table_split_row[1];
							$column_name = $table_split_row[2];
							
							$shared_query = "SELECT COUNT(*) as count FROM app.shared WHERE table_id = '".$db.".".$table."' AND item_id = ".$value." AND user_id = ".$this->user_id;
							$shared = $this->get_row($shared_query, 1, NULL, true);
							if($shared != NULL) {
								$shared = $shared['count'];
								if($shared > 0) {
									$row_verification[$row_key] = true;
								}
							}
						}
					}	
				}
			}*/
			
			$this->row_verification = $row_verification;
		}
		
		return true;
	}
	
	private $row_verification = NULL;
	
	private $db_replace_search = array(
		"app.",
		"cloud."
	);

	function get_last_query_string() {
		return $this->last_query_string;
	}
	
	function execute($query=NULL, $connection=NULL, $override=false) {
		if($this->database_prefix != NULL) {
			$db_replace = array();
			foreach($this->db_replace_search as $db_value) {
				$db_replace[] = $this->database_prefix.$db_value;	
			}
			
			$quote_split = explode("'", $query);
			$interlope = 0;
			foreach($quote_split as $key => $query_part) {
				if($interlope == 0) {
					$quote_split[$key] = str_replace($this->db_replace_search, $db_replace, $query_part);
					$interlope = 1;
				} else {
					$interlope = 0;	
				}
			}
			$query = implode("'", $quote_split);
		}
		/*if($this->plasticity_application_id != NULL) {
			$query = $this->contain_plasticity_query($query);
		}
		if(strpos($query, "INFORMATION_SCHEMA") === false) {
			$this->last_query_string = $query;
		}*/
		$split = explode(' ', trim($query));
		if($connection === NULL) { 
			$user_verified = true;
			if(!$override) {
				$user_verified = $this->verify_user($query);
			}
			//var_dump($query);
			//var_dump($user_verified);
			if($user_verified) {
				$result;
				$counter = 0;

				//var_dump($query);
				//var_dump($this->connection);
				
				$result = mysqli_query($this->connection, $query);
				$counter++;
				//var_dump("result");
				//var_dump($result);
			
				return $result;	
			}
			return false;
		} else {	
			$result = mysqli_query($this->connection, $query);
			return $result;
		}
	}
	
	
	public function get_rows($query, $result_type=NULL, $connection=NULL, $override=false) {
		if($result_type == NULL) {
			$result_type = MYSQLI_BOTH;	
		} else if($result_type == 0) {
			$result_type = MYSQLI_NUM;	
		} else {
			$result_type = MYSQLI_ASSOC;	
		}
		$result = $this->execute($query, $connection, $override);
		//var_dump($result);
		$return = array();
		$key = 0;
		if(!$result) {
			return $return;
		}
		while($row = mysqli_fetch_array($result, $result_type)) {
			if($this->row_verification === NULL || isset($this->row_verification[$key]) && $this->row_verification[$key]) {
				array_push($return, $row);
			}
			$key++;	
		}
		/*if($this->row_verification !== NULL && count($this->row_verification) != $key) {
			return $this->get_rows($query, $result_type, $connection, $override);	
		}*/
		//var_dump("inside");
		$this->row_verification = NULL;
		//var_dump($return);
		return $return;	
	}
	
	public function get_row($query, $result_type=NULL, $connection=NULL, $override=false) {
		$rows = $this->get_rows($query, $result_type, $connection, $override);
		if(count($rows) > 0) {
			return $rows[0];	
		} else {
			return [];
		}
	}
	
	function last_id($v=NULL) {
		$result = $this->last_id_sub($v);
		if($result == 0) {
			return -1;	
		}
		return $result;
	}
	
	function last_id_sub($v=NULL) {
		if($v != NULL) {
			if(isset($v['id']) && $v['id'] != "" && $v['id'] != -1) {
				return $v['id'];	
			}
		}
		return mysqli_insert_id($this->connection);	
	}
	
	function table_columns($table) {
		$query = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '".$this->db."' AND TABLE_NAME = '".$table."'";
		$columns = array();
		foreach($this->get_rows($query) as $row) {
			$columns[$row['COLUMN_NAME']] = $row['COLUMN_NAME'];
		}
		return $columns;
	}
	
	function close() {
		//mysqli_close($this->connection[0]);
	}
	
	function replaceNonEnglish($strengur) {
		
	
	}

}


?>