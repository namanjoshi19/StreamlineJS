<?

include '../base/base.php';

class app extends base {
	public $updates;
	public $streamline;
	
	public function __construct() {
		parent::__construct('updates', "/updates");
		
		$this->streamline = new streamline($this->sql, $this->statement, $this->user_id);
		$this->updates = new updates($this->sql, $this->statement, $this->user_id);
	}
	
}

?>