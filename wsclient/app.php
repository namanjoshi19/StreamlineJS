<?

include '../base/base.php';

class app extends base {
	
	public $streamline;
	public $templates;
	
	public function __construct() {
		parent::__construct('streamline', "/streamline");
		
		//if($this->user_id != -1) {
			$this->streamline = new streamline($this->sql, $this->statement, $this->user_id);
			$this->templates = new templates($this->sql, $this->statement, $this->user_id);
		//}
	}
	
	function get_state() {
		return array();	
	}

	function get_shared_indicies($v=NULL) {
		$query = "SELECT * FROM share_indicies WHERE to_user_id = ".$this->user_id;
		return $this->sql->get_rows($query, 1);
	}
	
	function share_media($v) {
		$query = "SELECT id FROM app.users WHERE email = '".$v['username']."'";
		$row = $this->sql->get_row($query, 1, NULL, true);
		if($row != NULL) {

		}
	}

	function share_folder($v) {
		$query = "SELECT id FROM app.users WHERE email = '".$v['username']."'";
		$row = $this->sql->get_row($query, 1, NULL, true);
		if($row != NULL) {
			$query = "SELECT COUNT(*) as count FROM app.share_indicies WHERE from_user_id = ".$this->user_id." AND to_user_id = ".$row['id']." AND type = 0 AND reference_id = ".$v['folder_id'];
			$count = $this->sql->get_row($query, 1)['count'];
			if($count == 0) {
				$values = [
					'from_user_id' => $this->user_id,
					'to_user_id' => $row['id'],
					'type' => 0,
					'reference_id' => $v['folder_id']
				];

				$this->statement->generate($values, "app.share_indicies");
				$this->sql->execute($this->statement->get());
				//var_dump($this->statement->get());
				$id = $this->sql->last_id($values);
				return ['id' => $id, 'to_user_id' => $row['id']];
			}
		}
		return ['id' => false];
	}
}

?>