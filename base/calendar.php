<?
class calendar extends _class {
	
	public function __construct($sql=NULL, $statement=NULL, $user_id=NULL) {
		$this->sql = $sql;
		$this->statement = $statement;
		if($user_id != NULL) {
			$this->set_user_id($user_id);	
		}
	}
	
	function get_string($string) {
		switch($string) {	
			case 'calendar_month_0':
				return 'January';
				break;
			case 'calendar_month_1':
				return 'February';
				break;
			case 'calendar_month_2':
				return 'March';
				break;
			case 'calendar_month_3':
				return 'April';
				break;
			case 'calendar_month_4':
				return 'May';
				break;
			case 'calendar_month_5':
				return 'June';
				break;
			case 'calendar_month_6':
				return 'July';
				break;
			case 'calendar_month_7':
				return 'August';
				break;
			case 'calendar_month_8':
				return 'September';
				break;
			case 'calendar_month_9':
				return 'October';
				break;
			case 'calendar_month_10':
				return 'November';
				break;
			case 'calendar_month_11':
				return 'December';
				break;
			case 'calendar_day_0':
				return 'Monday';
				break;
			case 'calendar_day_1':
				return 'Tuesday';
				break;
			case 'calendar_day_2':
				return 'Wednesday';
				break;
			case 'calendar_day_3':
				return 'Thursday';
				break;
			case 'calendar_day_4':
				return 'Friday';
				break;
			case 'calendar_day_5':
				return 'Saturday';
				break;
			case 'calendar_day_6':
				return 'Sunday';
				break;
		}
		return $string;	
	}
	
	function month_object($_month='', $_year='', $day_class='') {
		$return_object = array();
		
		$date = getdate();
		$day_today = date('d');
		$month = $_month;
		if($_month == '') {
			$month = date('n');
		}
		
		$year = $_year;
		if($_year == '') {
			$year = date('Y');
		}
		
		$month_name = $this->get_string('calendar_month_'.($month-1));
		$nextmonth = $month + 1;
		$prevmonth = $month - 1;
		$year_prev = $year;
		$year_next = $year;
		if($prevmonth == 0) {
			$prevmonth = 12;
			$year_prev = $year_prev - 1;
		}
		if($nextmonth == 13) {
			$nextmonth = 1;
			$year_next = $year_next + 1;
		}
		
		$return_object['month_name'] = $month_name;
		$return_object['year'] = $year;
		$return_object['current_month'] = $month;
		if(strlen($return_object['current_month']) == 1) {
			$return_object['current_month'] = "0".$return_object['current_month'];	
		}
		$return_object['next_month'] = $nextmonth;
		$return_object['previous_month'] = $prevmonth;
		$return_object['next_year'] = $year_next;
		$return_object['previous_year'] = $year_prev;
		
		$stop = cal_days_in_month(CAL_GREGORIAN, $month, $year);
		$last_day_prev = cal_days_in_month(CAL_GREGORIAN, $prevmonth, $year_prev);

		$first_day = getdate(mktime(NULL, NULL, NULL, $month, 1, $year));
		//$first_day = substr($first_day['weekday'], 0, 1);
		$first_day = $first_day['wday'];
		$counter=1;
		$rowcount = 0;
		$counter=0;
		$offset = 0;
		
		$return_object['days'] = array();
		while($counter<7) {
			$day_value = $this->get_string('calendar_day_'.$counter);
			$class = 'inactive';
			if($counter == $first_day) { //substr($dagur,0,1)
				$offset = $counter;
			}
			$return_object['days'][] = $day_value;
			$counter++;
		}
		$offset = $first_day;
		$offset = $offset - 1;
		if($offset == -1) {
			$offset = 6;
		}
		$counter=1;
		
		$return_object['month_days'] = array();
		
		$return_object['month_days'][] = array();
		$d = 1;
		
		$extra_class = '';
		$c_extra = 0;
		while($counter<=$offset) {
			$d = $last_day_prev-($offset-$counter);
			if($c_extra == 0) {
				$extra_class = '';
			} else {
				$extra_class = '';
			}
			$newDate = '';
			$past_month = ($month-1);
			$past_year = $year;
			if($past_month == 0) {
				$past_month = 12;
				$past_year = intval($past_year)-1;
			}
			if(strlen($past_month)==1) {
				$newDate .= '0'.$past_month;
			} else {
				$newDate .= $past_month;
			}
			$newDate .= '-';
			if(strlen($d)==1) {
				$newDate .= '0'.$d;
			} else {
				$newDate .= $d;
			}
			$newDate .= '-'.$past_year; 
			
			$return_object['month_days'][count($return_object['month_days'])-1][] = array(
				'date' => $past_year."-".$past_month."-".$d,
				'year' => $past_year,
				'month' => $month,
				'day' => $d
			);

			$day_start = $newDate.' 00:00';
			$day_end = $newDate.' 23:59';
			
			$c = 0;
			$class = '';
			$top=20;

			$counter++;
			$c_extra++;
		}
		$counter=1;
		$break_count=$offset;
		$rowcount = 0;
		$line_count = 5;
		$extra_class = '';
		while ($counter<=$stop && ($counter+$offset <= 35)) {
			if($break_count == 7) { //$rowcount != 0 && 
			}
			if($break_count == (7)) {
				$break_count = 0;
				
				$return_object['month_days'][] = array();
				
				$rowcount++;
			}
			if($c_extra == 0) {
				$c_extra = -1;
			}
			$style='';
			$newDate = '';
			if(strlen($month)==1) {
				$newDate .= '0'.$month;
			} else {
				$newDate .= $month;
			}
			$newDate .= '-';
			if(strlen($counter)==1) {
				$newDate .= '0'.$counter;
			} else {
				$newDate .= $counter;
			}

			$class_today = '';
			$class_today_elements = '';
			if($counter == date('j') && $month == date('n') && $year == date('Y')) {
				$class_today = 'current_date_calendar';
			}
			$onclick = "";
			$newDate .= '-'.date('Y'); 
			
			$return_object['month_days'][count($return_object['month_days'])-1][] = array(
				'date' => $year."-".$month."-".$counter,
				'year' => $year,
				'month' => $month,
				'day' => $counter
			);
			
			$day_start = $newDate.' 00:00';
			$day_end = $newDate.' 23:59';

			$c = 0;
			$class = '';
			$top=20;

			$c = $c - 3;
			if($c > 0) {
			}
			$counter++;
			$break_count++;
			$extra_class = '';
		}
		if($rowcount < 5) {
			$counter=1;
			while($break_count < 7) {
				$future_year = date('Y');
				$future_month = ($month+1);
				if($future_month == 13) {
					$future_month = 1;
					$future_year = intval($future_year)+1;
				}

				$newDate = '';
				if(strlen($future_month)==1) {
					$newDate .= '0'.$future_month;
				} else {
					$newDate .= $future_month;
				}
				$newDate .= '-';
				if(strlen($counter)==1) {
					$newDate .= '0'.$counter;
				} else {
					$newDate .= $counter;
				}
				
				
				$return_object['month_days'][count($return_object['month_days'])-1][] = array(
					'date' => $future_year."-".$future_month."-".$counter,
					'year' => $future_year,
					'month' => $month,
					'day' => $counter
				);

				$newDate .= '-'.$future_year; 
				
				$c = 0;
				$class = '';
				$top=20;

				$counter++;
				$break_count++;
			}
		}
		return $return_object;
	}
	
	function month($_year='', $_month='', $day='', $day_class='', $small_view=false) {		
		$o = "";
		$popover = false;
		if($day != '') {
			$popover = true;
		}
		
		$date = getdate();
		$day_today = date('d');
		$month = $_month;
		if($_month == '') {
			$month = date('n');
		}
		
		$year = $_year;
		if($_year == '') {
			$year = date('Y');
		}

		$month_name = $this->get_string('calendar_month_'.($month-1));
		$nextmonth = $month + 1;
		$prevmonth = $month - 1;
		$year_prev = $year;
		$year_next = $year;
		if($prevmonth == 0) {
			$prevmonth = 12;
			$year_prev = $year_prev - 1;
		}
		if($nextmonth == 13) {
			$nextmonth = 1;
			$year_next = $year_next + 1;
		}
		if(!$popover) {
			$o .= "<div style='position:relative'>
			<div style='position:absolute; top:20px; left:20px; font-size:20px;'><span style='' class='prev_month pointer change_month noselect' month='".$prevmonth."' year='".$year_prev."'><i class='icofont-thin-left'></i></span></div>
			<div style='position:absolute; top:20px; right:20px; font-size:20px;'><span style='' class='next_month change_month pointer noselect'  month='".$nextmonth."' year='".$year_next."'><i class='icofont-thin-right'></i></span></div>
			</div>";
		}
		
		if(!$small_view) {
			$o .= "<div id='month_name' style='text-align:center; padding-top:20px; padding-bottom:0px;'><div class='month_name_label'>".$month_name."</div><div id='year' style='text-align:center;'>".$year."</div></div>";
		} else {
			$o .= "<div id='month_name' style='text-align:center; padding-top:20px; padding-bottom:0px;'>".$month_name." ".$year."</div>";
		}

		$stop = cal_days_in_month(CAL_GREGORIAN, $month, $year);
		$last_day_prev = cal_days_in_month(CAL_GREGORIAN, $prevmonth, $year_prev);

		$first_day = getdate(mktime(null, null, null, $month, 1, $year));

		$first_day = $first_day['wday'];
		$o .= "<div id='calendar_view' class='calendar_grid'>";
		$counter=1;
		$rowcount = 0;
		$o .= "<div class='divTable table_header'><div class='divRow calendar_days_row'>";
		$counter=0;
		$offset = 0;
		while($counter<7) {
			$dagur = $this->get_string('calendar_day_'.$counter);
			$class = 'inactive';
			if($counter == $first_day) {
				$offset = $counter;
			}
			$o .= "<div class='divcell3 truncate_generic day_cal'>".$dagur."</div>";
			$counter++;
		}
		$offset = $first_day;
		$o .= "</div>";
		$offset = $offset - 1;
		if($offset == -1) {
			$offset = 6;
		}
		$counter=1;
		$o .= "</div><div class='divTable'><div class='divRow'>";
		$extra_class = '';
		$c_extra = 0;
		while($counter<=$offset) {
			$d = $last_day_prev-($offset-$counter);
			if($c_extra == 0) {
				$extra_class = '';
			} else {
				$extra_class = '';
			}
			$past_month = ($month-1);
			$past_year = $year;
			if($past_month == 0) {
				$past_month = 12;
				$past_year = intval($past_year)-1;
			}
			$newDate = $past_year."-";
			if(strlen($past_month)==1) {
				$newDate .= '0'.$past_month;
			} else {
				$newDate .= $past_month;
			}
			$newDate .= '-';
			if(strlen($d)==1) {
				$newDate .= '0'.$d;
			} else {
				$newDate .= $d;
			}
			$o .= "<div id='day_$newDate' class='divcell2 calendar_cell day_$newDate'  ><div class='day_counter'>$d</div>";
			

			$day_start = $newDate.' 00:00';
			$day_end = $newDate.' 23:59';

			$c = 0;
			$class = '';
			$top=20;


			$o .= "<div class='events'></div></div>";
			$counter++;
			$c_extra++;
		}
		$counter=1;
		$break_count=$offset;
		$rowcount = 0;
		$line_count = 5;
		$extra_class = '';
		while ($counter<=$stop && ($counter+$offset <= 35)) {
			if($break_count == 7) {
				$o .= "</div>"; 
			}
			if($break_count == (7)) {
				$break_count = 0;
				$extra_class = '';
				$o .= "<div class='divRow'>";
				$rowcount++;
			}
			if($c_extra == 0) {
				$extra_class = '';
				$c_extra = -1;
			}
			$style='';
			
			$newDate =  $year.'-'; 

			if(strlen($month)==1) {
				$newDate .= '0'.$month;
			} else {
				$newDate .= $month;
			}
			$newDate .= '-';
			if(strlen($counter)==1) {
				$newDate .= '0'.$counter;
			} else {
				$newDate .= $counter;
			}
			$class_today = '';
			$class_today_elements = '';
			if($counter == date('j') && $month == date('n') && $year == date('Y')) {
				$class_today = 'current_date_calendar';
			}

			$onclick = "";
			$o .= "<div id='day_$newDate' class='divCell calendar_cell day_$newDate $class_today' 
			 style='".$style.$extra_class."'
			>
			<div class='day_counter'>$counter</div>";

			$day_start = $newDate.' 00:00';
			$day_end = $newDate.' 23:59';

			$c = 0;
			$class = '';
			$top=20;

			$c = $c - 3;
			if($c > 0) {
			}
			$o .= "<div class='events'></div></div>";
			$counter++;
			$break_count++;
			$extra_class = '';
		}
		if($rowcount < 5) {
			$counter=1;
			while($break_count < 7) {
				$future_year = date('Y');
				$future_month = ($month+1);
				if($future_month == 13) {
					$future_month = 1;
					$future_year = intval($future_year)+1;
				}

				$newDate =  $future_year.'-'; 
				if(strlen($future_month)==1) {
					$newDate .= '0'.$future_month;
				} else {
					$newDate .= $future_month;
				}
				$newDate .= '-';
				if(strlen($counter)==1) {
					$newDate .= '0'.$counter;
				} else {
					$newDate .= $counter;
				}
				$onclick = "";
				$o .= "<div id='day_$newDate' class='divcell2 calendar_cell '><div class='day_counter ".$day_class."'>$counter</div>";
				
				$day_start = $newDate.' 00:00';
				$day_end = $newDate.' 23:59';

				$c = 0;
				$class = '';
				$top=20;

				$o .= "<div class='events'></div></div>";
				$counter++;
				$break_count++;
			}
			$o .= "</div></div>";
		}
		return array('result' => $o);
				
	}

}


?>
