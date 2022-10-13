<?

class user_group extends item {
	
	/*function list_($search_term=NULL, $offset=NULL) {
		//$query = "SELECT image_name as image FROM wallpapers ORDER BY id DESC";
		//return $this->sql->get_rows($query, 1);	
	}*/
	
	/*function _($v) {
		if($v['source_id'] == '-1') {
			$source_id = $this->_class->items['source']->_(array(
				'name' => $v['source']
			));
			$v['source_id'] = $source_id;	
		}
		unset($v['source']);
		return parent::_($v);
	}
	
	function table($search_term=NULL, $offset=0, $item_id=NULL, $post_data=NULL, $select_columns=NULL) {
		$rows = parent::table($search_term, $offset, $item_id, $post_data, $select_columns);
		foreach($rows as $key => $row) {
			$query = "SELECT name FROM sources WHERE id = ".$row['source_id'];
			$source = $this->sql->get_row($query, 1);
			$rows[$key]['source'] = $source['name'];
		}
		
		return $rows;
	}
	
	function get($id) {
		$query = "SELECT expenses.*, sources.name as source FROM expenses, sources WHERE expenses.source_id = sources.id AND expenses.id = ".$id;
		return $this->sql->get_row($query, 1);	
	}*/
}

?>