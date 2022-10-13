# StreamlineJS
Streamline / Plasticity is a web development framework with a graphical programming mode

Streamline currently uses the spl_autoload_register function to autoload classes expecting classes to be in the base directory or within the class directory of the current project folder.

Examples of StreamlineJS applications are the Account app, and also included in this repo are the Support and Updates pages from noob.software as examples of StreamlineJS applications.

StreamlineJS allows you to easily create a web page / web application much faster than usual programming methods. Plasticity is the graphical programming application built using Streamline and allows you to create StreamlineJS applications using graphical methods, useful for fast development and for non programmers. StreamlineJS applications are based on the definition.js file which are contained within the app folder in the project directory for example in /support/app/definition.js file. Documentation is lacking at the moment for constructing the application definition, but will be constructed in the near future. In the meantime you can follow the example of the support, updates and account definitions.

Plasticity also lacks documentation at the moment but will hopefully be improved soon.

StreamlineJS uses AJAX for all calls and never has to reload the page, and uses hash navigation links and animations can be applied between page transititions, it can be configured to use WebRTC which has an example in the WS object in the app.js file of the WSClient project. Navigation links can be configured for SEO by using the use_links: true property in the root of your app.js.

StreamlineJS uses the convention that within objects you can always call this.root to access to the root object and this.parent to access the parent object. As well as the convention to call var branch = this to assign the current branch of the main object as well as var self = this to assign the current object within the context of a branch. 

## Custom elements

The best example of a custom element is the filebrowser.js in the app folder. Custom elements can be used to create new elements needed for your web application.

## PHP structure

the best example of the PHP structure is within the Plasticity app, there the $items property is used within the main php class in plasticity.php, the item class can be extended and fulfills the role of calls to table, and the underscore function which inserts data. And calls from JS starting with the name of the item are redirected to the item class that has that name, functions within the item class should not be prefixed with that name for example: user_groups_table is redirected to item with the name user_groups and calls the function table.

StreamlineJS.db contains all of the table structure for StreamlineJS and the data_element_types and element_types for Plasticity.

What is needed to setup the account app is to get an api key for Captcha from google and set it in the app.js and account.php

###### Problems/Todos: 
  - Repo contains some code that is not used
  - Should probably be updated to be able to use composer packages
  - More custom elements can be added
  - Documentation needed for StreamlineJS definitions as well as Plasticity application definition.
  - Plasticity should support more elements.

# Plasticty

## Creating a Plasticity App

The first step to creating an application is to go to localhost/plasticity/#index/my_apps# and create an application, the application definition addition can be left empty or as an empty JSON object: {} this field requires knowldege of Streamline to be able to apply custom properties to your application. We will be presenting as an example application a Forum. Start by creatining a new app with the application name identifier: forum

![data structure](https://noob.software/images/github/create_app.png)


## Create user group

after creating an app you will see manage use groups appear below, if it is not visible click Edit on the application in the applications table. For the example we present here please create the use groups admin and main both having as parent group the group User.

![data structure](https://noob.software/images/github/user_groups.png)


## Data Structure

Data Structure is creating by connecting nodes, each node represents a data object, fields (equivilant to columns in a table in sql) are not created in the data structure panel but are created later when input forms are created and assigned to a node representing a data object, then fields are generated from the user-interface form or user-interface element and required "columns" are generated for the "table". Plasticity does not generate an SQL data structure but instead uses pseudo tables, fluidly constructed. Nodes belonging to other nodes are children of those nodes, to assign a node to a parent node, first click on the node, then click on connect to parent, then click the parent node.

#### Data Node Types

Nodes can be of the type additive or subtractive. Additive nodes, "additively" have all of the parent nodes as a data object, subtractive nodes can belong to multiple parents but only one at a time, in the example presented here we will construct a forum:

![data structure](https://noob.software/images/github/streamline1.png)

Here you can see the threads node has as a parent the categories node and thread_types, comments has as a parent the threads node and itself. The vote nodes is subtractive and has threads and comments as parents. The vote node will be used for up-voting on threads or comments (either one not both, therefor it is subtractive).

After creating this data structure press generate and lock data structure. As stated before sql-esq columns do not enter into the picture until later, when constructing the UI.

## User Interface

#### Creating pages

Click on interface design action in the row for your application in the applications table.

There you can create a page, we will start with the Index, the page name is: index (lowercase letters)

![data structure](https://noob.software/images/github/index.png)

Then create the page categories

![data structure](https://noob.software/images/github/categories.png)

Then click on the interface diagram for the index page.

first create a new element, double click it to edit it and change the element type to menu and give it the name "main". Then click save.

Then create a new node, edit it and change the element type to frame and give it the name top.

Next create a new node, edit it and change the element type to pagereference then select the page reference as the categories page and give it the name categories. Then save it and go back to the interface diagram, then connect the categories node to main and top such that main is a parent of categories and top is a parent of categories.

This means that the categories page will be contained within the main-menu and is the default page for the top-frame. The frame must always be ordered above the menu in the element-order table which is displayed when editing a node, this is necessary because the dependencies the menu has on the frame, the menu is however always placed on the top of the page. In other cases the element-order changes the order of elements, element order can also be necessary to be in a certain order when elements have dependencies on other elements, then the dependant element must be ordered after the the other element.

![data structure](https://noob.software/images/github/index-diagram.png)

At this point you should be able to go to localhost/plasticity/app_index.php?app=forum#index/categories#
But the page will not load until you place content in the categories page.

Next we will create the admin section of the forum to manage categories and other parts of the forum.

Create the admin page like in the image below:

Create two pages with the identifier names managecategories and managethreadtypes.

![data structure](https://noob.software/images/github/admin.png)

Then click on the interface diagram. The admin interface diagram should be exactly like in the index page. A main-menu and a top-frame then create a page reference for the managecategories page and managethreadtypes make managecategories the child of main and top and managethreadtypes the child of main.

Go to the interface diagram for the managecategories page. Which when completed should look like this:

![data structure](https://noob.software/images/github/managecategories-diagram.png)

Create a form called category with the target table set to 'categories' and the definition addition as:

```
{
	"new": true,
	"save": true
}
```

```
Then create a table called categories with the definition addition:

{
	"pagination_item_count": 10,
	"pagination": true,
	"resize": true,
	"columns": {
		"name": "name"
	},
	"edit": true,
	"delete": true
}
```

Then create an node with the element type as text and give it the name 'name' and set both the name node and categories table node as children of the category form node. When creating form elements the child-form element inputs are used to generate the underlying data structure for the application, this way the form-input and other input-based elements match the data structure, to do this, after connecting the nodes go back to the form node and find the button called 'Generate Target Table Columns' and press it. Elements can be added after pressing the button but then the button has to be pressed again and previous input-fields are not regenerated. 

###### Chaining forms

Forms can be set as the child of another form, this requires that the underlying tables assigned to each form has the child form as the child node in the data structure. This way you can chain mulitple forms and each form can have a table, as long as the data structure mirrors it. In programming terms this is equivilant to each form having a foreign-key to the element being edited in the parent form. So you can edit an item, then add multiple items assigned to the parent-form item, then edit a item in the child form. Child forms and accompanying tables are not displayed until an item is being edited or has just been saved in the parent form.

#### Data Query Elements

Create a new node with the element type dataelement and name it categoriesdata.

Then press 'Save', then edit the node again and this time press 'Edit Data Element Diagram'.

This is where things usually get interesting, in the data element diagram you can construct complex queries, querying the pseudo-tables and place conditions and much more. However this time we only query one table and place no conditions so just create a new node and call it categories, set the data source table as categories then save.

Go back to the interface diagram and set the data element 'categoriesdata' as the parent of the categories table node.

Remaining pages are left as exercise with screenshots of the interface diagrams

threadtypes page:
![data structure](https://noob.software/images/github/threadtypes-page.png)
threads page:
![data structure](https://noob.software/images/github/threads-page.png)
thread page:
![data structure](https://noob.software/images/github/thread-page.png)
categories page:
![data structure](https://noob.software/images/github/categories-page.png)