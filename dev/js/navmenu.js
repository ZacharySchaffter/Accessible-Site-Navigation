function findAncestor (el, elType, cls) {
    while ((el = el.parentNode)) {
        if (!el || !el.tagName){
        return null;
      }
  
      if ((!elType || elType == el.tagName.toLowerCase()) && (!cls || el.className.indexOf(cls) >= 0))  {
        return el;
      } 
    }   
}

function addClass(el, clsName) {
    var classArr = el.className.split(" ");
    if (classArr.indexOf(clsName) == -1) {
        el.className += " " + clsName;
    }
} 

function removeClass(el, clsName) {
    var classArr = el.className.split(" ");
    if (classArr.indexOf(clsName) > -1) {
        classArr.splice(classArr.indexOf(clsName), 1);
        el.className = classArr.join(' ');
    }
} 

function hasClass(el, clsName) {
    var classArr = el.className.split(" ");
    if (classArr.indexOf(clsName) > -1) {
        return true;
    }

    return false;
} 

///////////////////////////////////////////////

////////////MenuBar

var MenuBar = function(elementId){
    this.domNode = document.getElementById(elementId); //the element containing the nav
    this.isMenuBar = true;
    this.menuitems = [];//array of the elements in the menu
};

MenuBar.prototype.init = function(){    
    this.domNode.setAttribute('role', 'menubar');

    var elem = this.domNode.firstElementChild;//grab the first child of the menubar
    //loop through direct children
    while (elem) {
        if (elem.firstElementChild && elem.firstElementChild.nodeName.toLowerCase() === 'a') {
            var menuItem = new MenuItem(elem.firstElementChild, this); //pass the constructor this listitem and this menu
            menuItem.init();
            this.menuitems.push(menuItem);//push menu item to parent menu's array
        }

     elem = elem.nextElementSibling;
    }
    
    var menuObj = this;
    //add event handler to close menu when touch or clickstart clicks on something without the nav as an ancestor
    document.addEventListener("mousedown", function(e){
        if (!menuObj.domNode.contains(e.target)) {
            //if target of a click or touch event isnt a child of the nav, close everything.
            menuObj.closeAll();
        }
    });
};

MenuBar.prototype.closeAll = function(){
    this.menuitems.forEach(function(el){
        el.subMenu.close('true');
    });
};

MenuBar.prototype.setFocusToNext = function (currentItem) {
  var index, newItem;
  if (currentItem === this.menuitems[this.menuitems.length-1]) {
    return;
  }
  else {
    index = this.menuitems.indexOf(currentItem);
    newItem = this.menuitems[ index + 1 ];
  }
  
  this.setFocusToItem(newItem);
};

MenuBar.prototype.setFocusToPrev = function (currentItem) {
  var index = this.menuitems.indexOf(currentItem);
  if (index===0) {
    return;
  }
  var newItem = this.menuitems[ index - 1 ];

  this.setFocusToItem(newItem);

};

MenuBar.prototype.setFocusToItem = function (newItem) {

  var flag = false;

  for (var i = 0; i < this.menuitems.length; i++) {
        var mi = this.menuitems[i];
        flag = mi.domNode.getAttribute('aria-expanded') === 'true';

      newItem.domNode.focus();

      if (flag && newItem.subMenu) {
        newItem.subMenu.open();
      }
    }
};


///////////MenuItem 
///////////Assign it the domElement and a menu object for whichever menu it's a part of
var MenuItem = function(domNode, menuObj, isMobileMenuItem) {

    this.menu = menuObj; //menu that the element is a child of
    this.domNode = domNode;
    this.subMenu = false; //either false, of the object holding this menu item's submenu.  Inititally set to false
    this.isMobileMenuItem = isMobileMenuItem;

    this.keyCode = Object.freeze({
        'TAB': 9,
        'RETURN': 13,
        'ESC': 27,
        'SPACE': 32,
        'PAGEUP': 33,
        'PAGEDOWN': 34,
        'END': 35,
        'HOME': 36,
        'LEFT': 37,
        'UP': 38,
        'RIGHT': 39,
        'DOWN': 40
    });
};

MenuItem.prototype.init = function () {
    this.domNode.setAttribute('role', 'menuitem');

    this.domNode.addEventListener('keydown', this.handleKeydown.bind(this));
    
    this.domNode.addEventListener('click', this.handleClick.bind(this));
    
    //Dont include hover events on the mobile menu items
    if (!this.isMobileMenuItem) { 
        this.domNode.addEventListener('touchstart', this.handleTouch.bind(this));
        this.domNode.addEventListener('mouseover', this.handleMouseover.bind(this));
        this.domNode.addEventListener('mouseout', this.handleMouseout.bind(this));
    }
        

    var nextElement = this.domNode.nextElementSibling;

    if (nextElement && nextElement.tagName === 'UL') {
        this.domNode.setAttribute('aria-haspopup', 'true'); //set aria-haspopup
        this.domNode.setAttribute('aria-expanded', 'false'); //set aria-expanded
        addClass(this.domNode, 'has-children');

        this.subMenu = new SubMenu(nextElement, this);
        this.subMenu.init();
    }

    
};

//Touches/Click event handler
MenuItem.prototype.handleClick = function (event) {
    console.log("Click Event");
    event.stopPropagation();
    if (!hasClass(event.target, 'active') && this.subMenu){ //if the menu item has a subnav, but not the active class, prevent normal behavior.
        event.preventDefault();        
        this.subMenu.open(true); //open menu and close sibling
        
    } else if (hasClass(event.target, 'active') && (event.target.getAttribute("href") ==="#" || !event.target.getAttribute("href"))) { 
        //if the element is active, and the href attribute either doesnt exist or is a hashtag, close the submenu
        event.preventDefault();        
        this.subMenu.close(true);
    } 
    
};

MenuItem.prototype.handleTouch = function (event) {
    console.log("Touched");
    this.isTouched = true;
}

MenuItem.prototype.handleKeydown = function (event) {
  var tgt = event.currentTarget,
    flag = false,
    clickEvent;

  switch (event.keyCode) {
    
    case this.keyCode.SPACE:
    case this.keyCode.RETURN:
      if (!hasClass(this.domNode, "active") && this.subMenu) {
        this.subMenu.open(close);//open subnav
        this.subMenu.setFocusToFirstItem();//set focus to first item
        flag = true;
      }
      break;


    case this.keyCode.DOWN:
        if (this.menu.isMenuBar && !this.isMobileMenuItem) { //is a menu item, show subnav
            this.subMenu.open(true);//open subnav
            this.subMenu.setFocusToFirstItem();//set focus to first item
            flag = true;
        } else {
            this.menu.setFocusToNext(this);
            flag = true;
        }
          
        if (!this.menu.isMenuBar && this.subMenu) {
            this.subMenu.close();
        }
        break;
          
    case this.keyCode.LEFT:
        if(this.menu.isMenuBar && !this.isMobileMenuItem) {
            this.menu.setFocusToPrev(this);
            this.subMenu.close();
        } else if (!this.menu.parentMenuItem.menu.isMenuBar){
            this.menu.setFocusToParent();
            this.menu.close();
        }
        flag = true;
        break;

    case this.keyCode.RIGHT:
        if(this.menu.isMenuBar && !this.isMobileMenuItem) {
            this.menu.setFocusToNext(this);
            this.subMenu.close();
        } else if (this.subMenu){
            this.subMenu.open(true);
            this.subMenu.setFocusToFirstItem();
        }
        flag = true;
        break;

    case this.keyCode.UP:
        if (this.menu.menuitems && this.menu.menuitems.indexOf(this) === 0 && this.menu.parentMenuItem.menu.isMenuBar) {
            //check to see if you're on the first item, and the parent menu is the root
            this.menu.close();//close this subnav
            this.menu.parentMenuItem.domNode.focus();
        } else {
            //grab previous item
            this.menu.setFocusToPrev(this);
        }
          
        if (!this.menu.isMenuBar && this.subMenu) {
            this.subMenu.close();
        }
        flag=true;
        break;

    case this.keyCode.ESC:
        this.menu.close();
        this.menu.parentMenuItem.domNode.focus();
        flag = true;
        break;

    case this.keyCode.END:
    case this.keyCode.PAGEDOWN:
      flag = true;
      break;

    
  }

  if (flag) {
    event.stopPropagation();
    event.preventDefault();
  }
};

MenuItem.prototype.setExpanded = function (value) {
  this.domNode.setAttribute('aria-expanded', value);
};


MenuItem.prototype.handleMouseover = function (event) {
    console.log("Mouse Over Event.");
    if (this.isTouched){
        console.log("Preventing Mouseover");
        this.isTouched = false; //mouseover event untoggles this.  This prevents touch enabled devices from double-firing from touch/mouseover
        return; 
    }
        
    addClass(this.domNode, 'active');
    
    var parent = this.menu.parentMenuItem;
    
    //set active class on all parent menu items
    while (parent) {
        addClass(parent.domNode, "active");
        parent = parent.menu ? parent.menu.parentMenuItem : false;
    }
    
    var thisMenuItem = this;
    
    this.menu.menuitems.forEach(function(el){
        if (thisMenuItem != el && el.subMenu) {
            el.subMenu.close(true);
        }
    });
    
    if (this.subMenu){
        this.subMenu.open();
    } 
};

MenuItem.prototype.handleMouseout = function (event) {
    removeClass(this.domNode, 'active');
};

//method to check menuitem against current link, and add styles to it and the parent if true.  Loops through all child elements too.
MenuItem.prototype.checkIfCurrentLink = function(currentUrl){
    var thisHref = this.domNode.getAttribute('href');
    //Add 'index.shtml' to ends of links that end in '/'
    if (thisHref.slice(-1) === "/"){
        thisHref += "index.shtml";
    } 
    
    if (currentUrl !== thisHref && !this.subMenu) {
        return false;
        
    } else if (currentUrl !== thisHref && this.subMenu){
        var foundCurrentMenuItem = false;
        for (var i = 0; i<this.subMenu.menuitems.length; i++){
            var thisMenuItem = this.subMenu.menuitems[i];
            foundCurrentMenuItem = thisMenuItem.checkIfCurrentLink(currentUrl);
            
            if (foundCurrentMenuItem){
                break;
            }
        }
        return foundCurrentMenuItem;
        
    } else if (currentUrl.indexOf(thisHref) >= 0){
        addClass(this.domNode, "current-menu-item"); //add current menu item class
        

        if (this.isMobileMenuItem){
            addClass(this.domNode, "active"); //add current menu item class
            var parentMenuItem = this.menu.parentMenuItem ? this.menu.parentMenuItem : false;
            //Loop through parent listitems and add active class
            while (parentMenuItem){
                this.menu.open();
                console.log(this.menu);
                addClass(parentMenuItem.domNode, 'active');

                parentMenuItem = parentMenuItem.menu.parentMenuItem ? parentMenuItem.menu.parentMenuItem : false;
            }
        }
        
        return true;
    }
}

/////////Submenu

var SubMenu = function (domNode, parentEl) {
  var elementChildren;

  this.isMenuBar = false;
  this.domNode = domNode;
  this.parentMenuItem = parentEl;
  this.isVisible = false;
    
  this.menuitems = []; // See PopupMenu init method
};


SubMenu.prototype.init = function () {
  var childElement, 
        menuElement, 
        menuItems;

  // Configure the domNode itself
  this.domNode.setAttribute('role', 'menu');

    if (!this.parentMenuItem.isMobileMenuItem) {
        this.domNode.addEventListener('mouseover', this.handleMouseover.bind(this));
        this.domNode.addEventListener('mouseout', this.handleMouseout.bind(this));
    }

  childElement = this.domNode.firstElementChild; //get the first li in the ul

    while (childElement) {
        menuElement = childElement.firstElementChild; //get the first anchor in the li

        if (menuElement && menuElement.tagName.toLowerCase() == 'a') {
            var menuItem = new MenuItem(menuElement, this, this.parentMenuItem.isMobileMenuItem);
            menuItem.init();
            this.menuitems.push(menuItem);
        }
        childElement = childElement.nextElementSibling; //get next li and repeat
    }

};

/* EVENT HANDLERS */
SubMenu.prototype.handleMouseover = function (event) {
  this.open();
};

SubMenu.prototype.handleMouseout = function (event) {
  this.close(true);
};

//Menu Display Methods
SubMenu.prototype.open = function (closeSiblingMenus) {
  if (!hasClass(this.parentMenuItem.domNode, 'active')){
      addClass(this.parentMenuItem.domNode, 'active');
  }
  this.parentMenuItem.setExpanded(true);
  this.isVisible = true;
    
    if (closeSiblingMenus){
        var thisMenuItem = this.parentMenuItem;
        this.parentMenuItem.menu.menuitems.forEach(function(el){
            if (thisMenuItem != el && el.subMenu) {
                el.subMenu.close(true);
            }
        });
    }
     
};

SubMenu.prototype.close = function (closeChildMenus) {
    removeClass(this.parentMenuItem.domNode, 'active');
    this.parentMenuItem.setExpanded(false);
    this.isVisible = false;
    
    if(closeChildMenus){
        this.menuitems.forEach(function(el){//for each of the submenu's menuitems
            removeClass(el.domNode, 'active');//remove the active class for each menuitem
            if (el.subMenu){ //
                el.subMenu.close(true);
            }
        });
    }
};



SubMenu.prototype.setFocusToItem = function (newItem) {
  var flag = false;
  for (var i = 0; i < this.menuitems.length; i++) {
        var mi = this.menuitems[i];
        flag = mi.domNode.getAttribute('aria-expanded') === 'true';

      newItem.domNode.focus();

      if (flag && newItem.subMenu) {
        newItem.subMenu.open();
      }
    }
};

SubMenu.prototype.setFocusToFirstItem = function(){
    this.menuitems[0].domNode.focus();
};

SubMenu.prototype.setFocusToParent = function(){
    if(this.parentMenuItem) { //if the element has a parent list item, focus on that
        this.parentMenuItem.domNode.focus();
    }
};


SubMenu.prototype.setFocusToNext = function (currentItem) {
  var index, newItem;
  if (currentItem === this.menuitems[this.menuitems.length-1]) {
    return; //item is the last item in its menu
  }
  else {
    index = this.menuitems.indexOf(currentItem);
    newItem = this.menuitems[ index + 1 ];
  }
  this.setFocusToItem(newItem);

};

SubMenu.prototype.setFocusToPrev = function (currentItem) {
  var index = this.menuitems.indexOf(currentItem);
  if (index===0) {
    return;//item is the first item in its menu
  }
  var newItem = this.menuitems[ index - 1 ];
  this.setFocusToItem(newItem);

};



////////////////////////////////////////


var menu = new MenuBar('main-navigation');
menu.init();