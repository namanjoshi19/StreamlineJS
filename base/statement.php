<?

class statement {
	private $type;
	private $output;
	private $table;
	private $sql;
	private $db;
	private $user_id;
	private $escape;
	private $value_callback = array();
	
	public function encaps_string($s) {
		if($this->escape) {
			//return "'".mysqli_escape_string($this->sql->get_connection(), $s)."'"; //htmlentities(
		}
		return "'".$s."'";
	}
	
	private function value($key, $v) {
		switch($key) {
			default:
				if(($v != "NOW()" && $v != "NULL")) { //gettype($v) == 'string') && 
					return $this->encaps_string($v);
				}
				return $v;
				break;
		}
	}
		
	private $database_prefix = NULL;
	
	function __construct($values=NULL, $type=NULL, $table=NULL) {
		if($values != NULL) {
			$this->generate($values, $type, $table);
		}
	}
	
	public static function init($sql, $db, $user_id) {
		$instance = new self();
        $instance->set($sql, $db, $user_id);
        $instance->columns = NULL;
        return $instance;
	}
	
	public function set($sql, $db, $user_id) {
		$this->sql = $sql;	
		$this->db = $db;
		$this->user_id = $user_id;
		$this->columns = NULL;
	}
	
	function set_callback($callback) {
		$this->value_callback[] = $callback;	
	}

	public $columns = NULL;

	function set_columns($columns) {
		$this->columns = $columns;
	}
	
	private $has_primary_id = false;
	private $id_generated = false;
	
	public function generate(&$values, $table=NULL, $type=NULL, $escape=false, $allow_null=false, $set_columns=NULL) {
		$this->columns = $set_columns;
		if(isset($values['id'])) {
			if($values['id'] == "-1") {
				unset($values['id']);	
			}
		}
		$v = $values;
		if($table !== NULL) {
			$this->table = $table;	                                                
		}
		if(!isset($this->table)) {
			$trace = debug_backtrace();
			$table = $trace[1]['function']."s";
		} else {
			$table = $this->table;	
		}
		$this->escape = $escape;
		if(isset($this->sql)) {
			$db = $this->db;
			if(strpos($table, ".") !== false) {
				$split = explode(".", $table);
				$db = $split[0];
				$table = $split[1];	
			}
			$db_inspect = $db;
			if($this->database_prefix != NULL) {
				$db_inspect = $this->database_prefix.$db_inspect;	
			}
			$column_rows = $this->columns;
			if($this->columns === NULL) {
				$query = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '".$db_inspect."' AND TABLE_NAME = '".$table."'";
				$column_rows = $this->sql->get_rows($query);
			}
			foreach($column_rows as $row) {
				if($row['COLUMN_NAME'] == "id") {
					$this->has_primary_id = true;
						
				}
				if($row['COLUMN_NAME'] == 'user_id' && !isset($v['id'])) { //
					if($this->user_id != -1 && !isset($values['user_id'])) {
						$values['user_id'] = $this->user_id;
					}
				} else if($row['COLUMN_NAME'] == 'created' && !isset($v['created'])) {
					if(!isset($v['id'])) {
						$values['created'] = 'NOW()';	
					}
				} else if($row['COLUMN_NAME'] == 'modified') {
					if(!isset($v['modified'])) {
						$values['modified'] = 'NOW()';
					}
				} else if($row['COLUMN_NAME'] == 'password' && isset($values['password'])) {
					//$values['password'] = password_hash($values['password'], PASSWORD_DEFAULT);
				} else if(($row['COLUMN_NAME'] == 'id' || strpos($row['COLUMN_NAME'], "_id") === strlen($row['COLUMN_NAME'])-3) && isset($values[$row['COLUMN_NAME']]) && ($values[$row['COLUMN_NAME']] == "-1" || $values[$row['COLUMN_NAME']] === NULL || $values[$row['COLUMN_NAME']] === 'NULL' || strlen($values[$row['COLUMN_NAME']]) == 0)) {
					if($allow_null == false) {
						unset($values[$row['COLUMN_NAME']]);
					}
				}
			}
			if($this->sql->_db != $db) {
				$table = $db.".".$table;
			}
		}
		if(isset($values['PHPSESSID'])) {
			unset($values['PHPSESSID']);
		}
		if(isset($values['action'])) {
			unset($values['action']);
		}
		foreach($values as $key => $value) {
			if($value == "-1") {
				$values[$key] = "0";
			}
		}
		if($this->columns !== NULL) {
			$this->output = $values;
			return;
		}
		if(count($values) > 0) {
			$this->output = '';
			if($type === NULL) {
				if(isset($values['id']) && !$this->id_generated) {
					if($values['id'] == "-1") {
						$this->type = 1;	
					} else {
						$this->type = 0;	
					}
				} else {
					$this->type = 1;	
				}
			} else {
				$this->type = $type;	
			}
			switch($this->type) {
				case 0:
					$output = 'UPDATE '.$table.' SET ';
					if(isset($values['id'])) {
						$counter = 0;
						foreach($values as $key => $v) {
							if($key != 'id') {
								//if(strlen($v) > 0) {
									if($counter > 0) {
										$output .= ', ';
									}
									$output .= $key.' = '.$this->value($key, $v);
									$counter++;
								//}
							}
						}
						$output .= " WHERE id = '".$values['id']."'";
					} else {
						$counter = 0;
						foreach($values as $key => $v) {
							if(strpos($key, "_id") === false) {
								if($counter > 0) {
									$output .= ", ";	
								}
								$output .= $key.' = '.$this->value($key, $v).' ';
								$counter++;
							}
						}
						$output .= " WHERE ";
						$counter = 0;
						foreach($values as $key => $v) {
							if(strpos($key, "_id") !== false) {
								if($counter > 0) {
									$output .= " AND ";	
								}
								$output .= $key.' = '.$v.' ';
								$counter++;
							}
						}
					}
					break;
				case 2:
				case 1:
					$output = 'INSERT INTO '.$table.' (';
					if($this->type == 2) {
						$output = 'REPLACE INTO '.$table.' (';
					}
					$counter = 0;
					foreach($values as $key => $v) {
						if(strlen($v) > 0) {
							if($counter > 0) {
								$output .= ', ';
							}
							$output .= $key;
							$counter++;
						}
					}
					$counter = 0;
					$output .= ") VALUES (";
					foreach($values as $key => $v) {
						if(strlen($v) > 0) {
							if($counter > 0) {
								$output .= ', ';
							}
							if($key == 'submitted') {
								$output .= "NOW()";
							} else {
								$output .= $this->value($key, $v);
							}
							$counter++;
						}
					}
					$output .= ")";
					break;
			}
			$this->output = $output;
			
		}	
	}
	
	public function update($values) {
	}
	
	public function get() {
		return $this->output;
	}
}

?>