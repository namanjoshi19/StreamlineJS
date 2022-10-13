<div class='calendar_popover' style='display:none;'></div>
<div class='overlay_black_alt' style='display:none;'>
    <div class='close_button position_close_button'><i class='icofont-close-line-circled'></i></div>
    <div class='share_item_wrap panel_wrap'  id='share_item_wrap' default_page='' level='-1' style='display:none;'>
	    <div id='share_item' default_page='' level='-1'>

	    </div>
	</div>
    <div class='smart_folder_wrap panel_wrap'  id='smart_folder_wrap' default_page='' level='-1' style='display:none;'>
	    <div id='smart_folder' default_page='' level='-1'>

	    </div>
	</div>
</div>
<div class='overlay_black'>
	<div class='user_options' style='display:none;'>
    	<div class='logged_in_options'  style='display:none;'>
            <div class='option_title account'>
                <a href='/account/'>Account</a>
            </div>
            <div class='option_title logout'>
                Log out
            </div>
            <div class='option_title back'>
                Back
            </div>
    	</div>
    	<div class='logged_out_options'>
            <div class='option_title account sign_up_button'>
                <a href='/account/#new/sign_up#'>Sign Up</a>
            </div>
            <div class='option_title sign_in_button'>
                Sign In
            </div>
            <div class='option_title back'>
                Back
            </div>
    	</div>
    </div>
    <div class='loading' style='display:none;'>
        <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
        <div class='center_loading'>Please wait...</div>
        <div class='progress_bar_container' style='display:none;'>
        	<progress class="progress_bar" max="1000" value="0"> </progress>
        </div>
    </div>
    <div class='login user_menu' style='display:none;'>
        <div class='login_elements'>
        	<!--<form autocomplete="off">-->
	            <input type='email' id='username' placeholder="Username" />
	            <input type='password' id='password' class='' Placeholder="Password" />
	            <button class='sign_in'>Sign in</button><br/><br/>
	            <button class='learn_more'>Learn more</button>
	        <!--</form>-->
        </div>
        <div style='display:none;'>
        	<button class='pseudo_button'></button>
        </div>
    </div>
    <div id='body' class='night' style='display:none;'>
        <div class='clock_wrap'>
            <div id='clock_container'>
                <div id='clock' class='clock_element night'>
                    <div id='clock_center'>
                        <div class='clock_hand_container' id='second_container'>
                            <div class='clock_hand' id='second_hand'>
                            
                            </div>
                        </div>
                        <div class='clock_hand_container' id='minute_container'>
                            <div class='clock_hand' id='minute_hand'>
                            
                            </div>
                        </div>
                        <div class='clock_hand_container' id='hour_container'>
                            <div class='clock_hand' id='hour_hand'>
                            
                            </div>
                        </div>
                    </div>
                    <div id='digital_clock' style='display:none;'>
                        <div id='value'>16:24</div>
                        
                    </div>
                </div>
                <div id='date' class='clock_element night'>
                    <div class='date_content'>
                        17
                    </div>
                    <div id='date_month'>
                        February
                    </div>
                </div>
            </div>
            <!--<div class='app_home'>
            	<div class='buttons_container_wrap'>
                    <div class='buttons_container' style=''>
                        <div class='buttons'>
                            <div class='button'>
                                <a href='/noob_cloud/'><img src='/images/settings_nc.png' /><br>Noob Cloud Settings</a>
                            </div>
                            <div class='button'>
                                <a href='/objectives/'><img src='/images/Objectives.png' /><br>Objectives</a>
                            </div>
                            <div class='button'>
                                <a href='/files/'><img src='/images/Files.png' /><br>Files</a>
                            </div>
                            <div class='button'>
                                <a href='/housekeeping/'><img src='/images/Housekeeping.png' /><br>Housekeeping</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>-->
        </div>
        <div class='footer'>
            noob software
        </div>
    </div>
    <div class='pop_up' style='display:none; opacity:0;'>
    	<div class='message'></div>
        <div class='buttons'></div>
    </div>
    <div class='search_container' style='display:none;'>
    	<div class='search_input_wrap'>
        	<input type='text' class='search_input' placeholder='search' /><i class='icofont-close-line-circled close_position_search'></i>
        </div>
        <div class='search_results_frame' id='search_results_frame'>
        	
        </div>
    </div>
    <div class='dialog' style='display:none;'>
    	<div class='message'>Are you sure you want to delete this item?</div>
        <div class='controls controls_yes'>
        	<div class='yes_button control_button'>Yes</div>
            <div class='no_button control_button'>No</div>
        </div>
        <div class='controls controls_ok' style='display:none;'>
            <div class='ok_button control_button'>Ok</div>
        </div>
    </div>
</div>
<div id='dummy_div' style='display:none;'>

</div>
<div id='templates' style='display:none;'>
    	
    <div id='calendar_template' class='calendar_view no_select' style='display:none;'>
        <div class='calendar_day_view' style='display:none;'>
            <div class='close_button'><i class="icofont-close-line"></i></div>
            <h1 class='day_name'></h1>
            <hr style=''/>
            <div class='events_container'></div>
        </div>
        <div class='calendar_container'></div>
    </div>
</div>
