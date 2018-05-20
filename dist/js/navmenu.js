(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
        if (elem) {
            var menuItem = new MenuItem(elem, this); //pass the constructor this listitem and this menu
            menuItem.init();
            this.menuitems.push(menuItem);//push menu item to parent menu's array
        }

     elem = elem.nextElementSibling;
    }
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
var MenuItem = function(domNode, menuObj) {

    this.menu = menuObj; //menu that the element is a child of
    this.domNode = domNode;
    this.subMenu = false; //either false, of the object holding this menu item's submenu.  Inititally set to false

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
    this.domNode.addEventListener('touchstart', this.handleTouch.bind(this));
    this.domNode.addEventListener('focus', this.handleFocus.bind(this));
    this.domNode.addEventListener('blur', this.handleBlur.bind(this));
    this.domNode.addEventListener('mouseover', this.handleMouseover.bind(this));
    this.domNode.addEventListener('mouseout', this.handleMouseout.bind(this));

    var nextElement; 
    if (this.menu.isMenuBar) {
        //element is a top level nav item
        nextElement = this.domNode.firstElementChild; //get the first element (the ul in each li.nav-item)

        if (nextElement && nextElement.tagName === 'UL') {
            this.domNode.setAttribute('aria-haspopup', 'true'); //set aria-haspopup
            addClass(this.domNode, 'has-children');

            this.subMenu = new SubMenu(nextElement, this);
            this.subMenu.init();
        }

    } else {
        //element isn't top level nav, so it'll be the sibling element
        nextElement = this.domNode.nextElementSibling;

        if (nextElement && nextElement.tagName === 'UL') {
            this.domNode.setAttribute('aria-haspopup', 'true'); //set aria-haspopup
            addClass(this.domNode, 'has-children');

            this.subMenu = new SubMenu(nextElement, this);
            this.subMenu.init();
        }

    }
};
MenuItem.prototype.handleTouch = function (event) {
    console.log("Touch detected");
    
    if (!hasClass(event.target, 'active') && this.subMenu){ //if the menu item has a subnav, but not the active class, prevent normal behavior.
        console.log("El wasnt active and has submenu");
        event.stopPropagation();
        event.preventDefault();
        addClass(this.domNode, 'active');//add active class

        var obj = this;
        this.menu.menuitems.forEach(function(el){//for each sibling menuitem
            if (obj !== el && el.subMenu) { //if the particular item isnt the 
              console.log("Closing: ", el.subMenu);
              el.subMenu.close();
            }
        });
        this.subMenu.open(true);
        
    } else {
        console.log("Else clause fired");
    }

    console.log("------------");
};
MenuItem.prototype.handleKeydown = function (event) {
  var tgt = event.currentTarget,
    char = event.key,
    flag = false,
    clickEvent;

  switch (event.keyCode) {
    
    case this.keyCode.SPACE:
    case this.keyCode.RETURN:
      if (this.subMenu) {
        this.subMenu.open();//open subnav
        this.subMenu.setFocusToFirstItem();//set focus to first item
        flag = true;
      }
      break;


    case this.keyCode.DOWN:
        if (this.menu.isMenuBar) { //is a menu item, show subnav
            this.subMenu.open();//open subnav
            this.subMenu.setFocusToFirstItem();//set focus to first item
            flag = true;
        } else {
            this.menu.setFocusToNext(this);
            flag = true;
        }
        break;

    case this.keyCode.LEFT:
        if(this.menu.isMenuBar) {
            this.menu.setFocusToPrev(this);
            this.subNav.close();
        } else if (!this.menu.parentMenuItem.menu.isMenuBar){
            this.menu.setFocusToParent();
            this.menu.close();
        }
        flag = true;
        break;

    case this.keyCode.RIGHT:
        if(this.menu.isMenuBar) {
            this.menu.setFocusToNext(this);
            this.subNav.close();
        } else if (this.subMenu){
            this.subMenu.open();
            this.subMenu.setFocusToFirstItem();
        }
        flag = true;
        break;

    case this.keyCode.UP:
        console.log("Pressed up");
        console.log(this.menu.menuitems.indexOf(this));
        console.log(this.menu.parentMenuItem.menu.isMenuBar);
        if (this.menu.menuitems && this.menu.menuitems.indexOf(this) === 0 && this.menu.parentMenuItem.menu.isMenuBar) {
            //check to see if you're on the first item, and the parent menu is the root
            this.menu.close();//close this subnav
            this.menu.parentMenuItem.domNode.focus();
        } else {
            //grab previous item
            this.menu.setFocusToPrev(this);
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

    case this.keyCode.TAB:
      this.subMenu.close();
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

//Set hasFocus to true
MenuItem.prototype.handleFocus = function (event) {
  console.log("Focus assigned");
};

//set hasFocus to false
MenuItem.prototype.handleBlur = function (event) {

};

MenuItem.prototype.handleMouseover = function (event) {
    addClass(this.domNode, 'active');
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
    if (this.subMenu){
        setTimeout(this.subMenu.close.bind(this.subMenu, false), 200);
    }
  
};



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

  this.domNode.addEventListener('mouseover', this.handleMouseover.bind(this));
  this.domNode.addEventListener('mouseout', this.handleMouseout.bind(this));

  childElement = this.domNode.firstElementChild; //get the first li in the ul

  while (childElement) {
    menuElement = childElement.firstElementChild; //get the first anchor in the li

    if (menuElement && menuElement.tagName.toLowerCase() == 'a') {
      var menuItem = new MenuItem(menuElement, this);
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
SubMenu.prototype.open = function (closeSiblings) {
  addClass(this.parentMenuItem.domNode, 'active');   
  this.parentMenuItem.setExpanded(true);
  this.isVisible = true;
     
};

SubMenu.prototype.close = function (closeChildMenus) {
    removeClass(this.parentMenuItem.domNode, 'active');
    this.parentMenuItem.setExpanded(false);
    this.isVisible = false;

    if(closeChildMenus){
        this.menuitems.forEach(function(el){
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
},{}]},{},[1]);
