<?

class colors {
	
	private $sql;
	
	function __construct($sql=NULL) {
		$this->sql = $sql;	
	}
	
	public function get_colors($html=false, $step_size=16) {
		$colors = array();
		$c_val = 0;
		for($c_val3 = 0; $c_val3 < 360; $c_val3 += $step_size) {
			$h = ($c_val3+$c_val);
			
			$s = 60;
			$l = 50;
			
			if(!$html) {
				$h /= 360;
				$s /= 100;
				$l /= 100;
			} else {
				$s .= "%";
				$l .= "%";	
			}
			
			
			$rgb = $h.",".$s.",".$l;
			
			array_push($colors, $rgb);
		}
		array_pop($colors);
		return $colors;
	}
	
	public function get_color_values() {
		$query = "SELECT * FROM app.colors";
		return $this->sql->get_rows($query, 1);	
	}
	
	function rgb($h, $s, $l){
        $r = $l;
        $g = $l;
        $b = $l;
        $v = ($l <= 0.5) ? ($l * (1.0 + $s)) : ($l + $s - $l * $s);
        if ($v > 0){
              $m;
              $sv;
              $sextant;
              $fract;
              $vsf;
              $mid1;
              $mid2;

              $m = $l + $l - $v;
              $sv = ($v - $m ) / $v;
              $h *= 6.0;
              $sextant = floor($h);
              $fract = $h - $sextant;
              $vsf = $v * $sv * $fract;
              $mid1 = $m + $vsf;
              $mid2 = $v - $vsf;

              switch($sextant) {
                    case 0:
                          $r = $v;
                          $g = $mid1;
                          $b = $m;
                          break;
                    case 1:
                          $r = $mid2;
                          $g = $v;
                          $b = $m;
                          break;
                    case 2:
                          $r = $m;
                          $g = $v;
                          $b = $mid1;
                          break;
                    case 3:
                          $r = $m;
                          $g = $mid2;
                          $b = $v;
                          break;
                    case 4:
                          $r = $mid1;
                          $g = $m;
                          $b = $v;
                          break;
                    case 5:
                          $r = $v;
                          $g = $m;
                          $b = $mid2;
                          break;
              }
        }
        return array('r' => (int)($r * 255.0), 'g' => (int)($g * 255.0), 'b' => (int)($b * 255.0));
	}
	
	function css_hsl($color) {
		$result = "";
		$colors = explode(",", $color);
		foreach($colors as $index => $value) {
			if($index > 0) {
				$result .= ",";	
			}
			if($index == 0) {
				$result .= $value*360;
			} else {
				$result .= $value*100;
			}
			if($index > 0) {
				$result .= "%";	
			}
			
		}	
		return $result;
	}
}


?>