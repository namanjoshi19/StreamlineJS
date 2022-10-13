<?

class node extends item {

	function diagram_editor($application_id) {
		$query = "SELECT * FROM nodes WHERE application_id = ".$application_id." AND deleted = 0";
		return $this->sql->get_rows($query, 1);
	}

	function get_properties($id) {
		$query = "SELECT * FROM node_properties WHERE node_id = ".$id;
		return $this->sql->get_rows($query, 1);
	}
	
	function _($v) {
		if(isset($v['parents'])) {
			$v['parents'] = json_encode($v['parents']);
		}

		return parent::_($v);
	}

	function delete($id) {
		$query = "SELECT * FROM nodes WHERE id = ".$id;
		$delete_node = $this->sql->get_row($query, 1);

		$application_id = $delete_node['application_id'];
		$query = "SELECT * FROM nodes WHERE application_id = ".$application_id;
		$nodes = $this->sql->get_rows($query, 1);
		foreach($nodes as $node) {
			$parents = json_decode($node['parents'], true);
			if($parents != NULL && in_array($id, $parents)) {
				array_splice($parents, array_search($id, $parents), 1);
				//$parents = json_encode($parents);
				$v = array(
					'id' => $node['id'],
					'parents' => $parents
				);
				$this->_($v);
			}
		}

		$v = array(
			'id' => $id,
			'deleted' => true
		);
		$this->_($v);

		$query = "SELECT * FROM tables WHERE node_id = ".$id;
		$table = $this->sql->get_row($query, 1);
		$query = "DELETE FROM columns WHERE table_id = ".$table['id'];
		$this->sql->execute($query);
		$query = "DELETE FROM columns WHERE foreign_table_id = ".$table['id'];
		$this->sql->execute($query);
		//parent::delete($id);
	}

	function generate_structure($application_id=1) {
		$query = "SELECT * FROM p_schemas WHERE application_id = ".$application_id;
		$schemas = $this->sql->get_rows($query, 1);
		$schema_id;
		//var_dump("test");
		if(count($schemas) == 0) {
			$v_schema = array(
				'name' => 'main',
				'user_id' => $this->_class->get_user_id(),
				'application_id' => $application_id
			);

			$this->statement->generate($v_schema, "p_schemas");
			$this->sql->execute($this->statement->get());
			$schema_id = $this->sql->last_id($v_schema);
		} else {
			$schema_id = $schemas[0]['id'];
		}

		$node_parents = array();
		$node_type = array();
		$node_names = array();
		$table_ids = array();

		$query = "SELECT * FROM nodes WHERE node_locked = 0 AND application_id = ".$application_id;
		$nodes = $this->sql->get_rows($query, 1);
		foreach($nodes as $node) {

			$node_name = $node['name'];
			$node_name = str_replace(" ", "_", $node_name);
			$node_name = strtolower($node_name);
			if(trim($node['name']) != 'users') {
				$update = "UPDATE nodes SET node_locked = 1 WHERE id = ".$node['id'];
				$this->sql->execute($update);


				$query = "SELECT * FROM tables WHERE name = '".$node_name."' AND schema_id = ".$schema_id." AND node_id = ".$node['id'];
				$table_row = $this->sql->get_row($query, 1);
				$table_pre_id = NULL;
				if($table_row != NULL) {
					$table_pre_id = $table_row['id'];
				}

				$v = array(
					'name' => $node_name,
					'schema_id' => $schema_id,
					'node_id' => $node['id'],
					'user_access_id' => $node['user_access_id']
				);
				if($table_pre_id != NULL) {
					$v['id'] = $table_pre_id;
				}
				$this->statement->generate($v, "tables");
				$this->sql->execute($this->statement->get());
				$table_id = $this->sql->last_id($v);

				$parents = $node['parents'];
				if($parents != NULL) {
					$parents = json_decode($parents, true);
					$node_parents[$table_id] = $parents;
				}
				$node_type[$table_id] = $node['node_type'];
				$node_names[$node['id']] = $node_name;
				$table_ids[$node['id']] = $table_id;
				//var_dump($table_id);
			} else {
				$query = "SELECT * FROM tables WHERE id = 7";
				$table_row = $this->sql->get_row($query, 1);

				$node_type[$table_row['id']] = 'additive';
				$node_names[$node['id']] = $node_name;

				$table_ids[$node['id']] = $table_row['id'];
			}
		}
		//var_dump($table_ids);
		$subtractive_column_added = array();
		foreach($node_parents as $table_id => $parents) {
			if($node_type[$table_id] == 'additive') {
				foreach($parents as $parent_node_id) {
					$v = array(
						'name' => $node_names[$parent_node_id]."_id",
						'type' => 1, //'foreign_id'
						'table_id' => $table_id,
						'foreign_table_id' => $table_ids[$parent_node_id]
					);
					$query = "SELECT * FROM columns WHERE name = '".$v['name']."' AND table_id = '".$v['table_id']."'";
					$column_row = $this->sql->get_row($query, 1);
					if($column_row != NULL) {
						$v['id'] = $column_row['id'];
					}

					$this->statement->generate($v, "columns");
					//var_dump($this->statement->get());
					$this->sql->execute($this->statement->get());
					$column_id = $this->sql->last_id($v);
				}
			} else {
				$v = array(
					'name' => 'connect_id',
					'type' => 2, //connect_id
					'table_id' => $table_id
				);
				$query = "SELECT * FROM columns WHERE name = '".$v['name']."' AND table_id = '".$v['table_id']."'";
				$column_row = $this->sql->get_row($query, 1);
				if($column_row != NULL) {
					$v['id'] = $column_row['id'];
				}
				$this->statement->generate($v, "columns");
				$this->sql->execute($this->statement->get());
				$column_id = $this->sql->last_id($v);
				foreach($parents as $parent_node_id) {
					$v = array(
						'table_id' => $table_id,
						'foreign_table_id' => $table_ids[$parent_node_id]
					);

					$query = "SELECT * FROM foreign_table_ids WHERE table_id = '".$v['table_id']."' AND foreign_table_id = '".$v['foreign_table_id']."'";
					$column_row = $this->sql->get_row($query, 1);
					if($column_row == NULL) {
						$this->statement->generate($v, "foreign_table_ids");
						$this->sql->execute($this->statement->get());
						$column_id = $this->sql->last_id($v);
					}
				}
			}
		}
	}
	/*function list_($search_term=NULL, $offset=NULL) {
		//$query = "SELECT image_name as image FROM wallpapers ORDER BY id DESC";
		//return $this->sql->get_rows($query, 1);	
		$query = "SELECT id, name as title, difficulty FROM exams ORDER BY difficulty ASC";
		return $this->sql->get_rows($query, 1);
	}*/

	/*function get_select() {
		$query = "SELECT * FROM citation_types";
		$rows = $this->sql->get_rows($query, 1);
		//$rows = parent::get_select();
		foreach($rows as $key => $row) {
			$query = "SELECT COUNT(*) as count FROM apa_citations WHERE citation_type_id = ".$row['id'];
			$count = $this->sql->get_row($query, 1)['count'];
			if($count == 0) {
				unset($rows[$key]);
			}
		}
		return $rows;
	}*/
}

?>