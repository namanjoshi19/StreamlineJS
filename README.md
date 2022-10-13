# StreamlineJS
Streamline / Plasticity is a web development framework with a graphical design mode

Streamline currently uses the spl_autoload_register function to autoload classes expecting classes to be in the base directory or within the class directory of the current project folder.

Examples of StreamlineJS applications are the Account app, and also included in this repo are the Support and Updates pages from noob.software as examples of StreamlineJS applications.

StreamlineJS allows you to easily create a web page / web application much faster than usual programming methods. Plasticity is the graphical programming application built using Streamline and allows you to create StreamlineJS applications using graphical methods, useful for fast development and for non programmers. StreamlineJS applications are based on the definition.js file which are contained within the app folder in the project directory for example in /support/app/definition.js file. Documentation is lacking at the moment for constructing the application definition, but will be constructed in the near future. In the meantime you can follow the example of the support, updates and account definitions.

Plasticity also lacks documentation at the moment but will hopefully be improved soon.

StreamlineJS uses AJAX for all calls and never has to reload the page, and uses hash navigation links and animations can be applied between page transititions, it can be configured to use WebRTC which has an example in the WS object in the app.js file of the WSClient project. Navigation links can be configured for SEO by using the use_links: true property in the root of your app.js.

StreamlineJS uses the convention that within objects you can always call this.root to access to the root object and this.parent to access the parent object. As well as the convention to call var branch = this to assign the current branch of the main object as well as var self = this to assign the current object within the context of a branch. 

Custom elements:

The best example of a custom element is the filebrowser.js in the app folder. Custom elements can be used to create new elements needed for your web application.

PHP structure:

the best example of the PHP structure is within the Plasticity app, there the $items property is used within the main php class in plasticity.php, the item class can be extended and fulfills the role of calls to table, and the underscore function which inserts data. And calls from JS starting with the name of the item are redirected to the item class that has that name, functions within the item class should not be prefixed with that name for example: user_groups_table is redirected to item with the name user_groups and calls the function table.

StreamlineJS.db contains all of the table structure for StreamlineJS and the data_element_types and element_types for Plasticity.

What is needed to setup the account app is to get an api key for Captcha from google and set it in the app.js and account.php

