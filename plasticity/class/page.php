<?

class page extends item {
	
	/*function list_($search_term=NULL, $offset=NULL) {
		//$query = "SELECT image_name as image FROM wallpapers ORDER BY id DESC";
		//return $this->sql->get_rows($query, 1);	
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

	function get_reference_select($post_data) {
		$query = "SELECT * FROM pages WHERE id = ".$post_data;
		$page = $this->sql->get_row($query, 1);
		$query = "SELECT id, name as title FROM pages WHERE application_id = ".$page['application_id'];
		return $this->sql->get_rows($query, 1);
	}
}

?>